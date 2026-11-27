import { createHash } from "crypto";

import { borrarMarca, escribirMarca, leerMarca, reservarMarca } from "@/lib/en-vivo/almacen";

/**
 * Que una pieza no salga dos veces en la misma red.
 *
 * Antes de publicar se reserva una marca con nombre fijo (organización + red + imagen + segunda
 * foto). La reserva es atómica, así que dos pedidos a la vez no publican dos veces.
 *
 * - "publicada": ya salió; se devuelve el link de la primera vez sin volver a publicar.
 * - "publicando": hay una publicación en curso, o una anterior se cortó (la función se cayó
 *   esperando a Meta) y no se sabe si salió. No se publica: el editor revisa la página y, si de
 *   verdad no salió, cambia la pieza o la vuelve a generar (otra imagen, otra marca).
 * - Si publicar lanza un error, Meta no publicó nada: la marca se borra y se puede reintentar.
 *
 * Ver docs/superpowers/specs/2026-11-27-post-redes-revision-pr-design.md.
 */

export type Red = "facebook" | "instagram";
type Marca = { estado: "publicando" | "publicada"; link?: string; desde: string };

const NOMBRE_RED: Record<Red, string> = { facebook: "Facebook", instagram: "Instagram" };

export class PublicacionPendienteError extends Error {}

function nombreMarca(org: string, red: Red, imagen: string, evidencia: string | null): string {
  const huella = createHash("sha256").update(`${org}|${red}|${imagen}|${evidencia ?? ""}`).digest("hex");
  return `pub-${huella}.json`;
}

export async function publicarUnaVez(
  org: string,
  red: Red,
  imagen: string,
  evidencia: string | null,
  publicar: () => Promise<string>,
): Promise<{ link: string; yaEstaba: boolean }> {
  const nombre = nombreMarca(org, red, imagen, evidencia);
  const pendiente = () =>
    new PublicacionPendienteError(
      `Esta pieza ya se está publicando en ${NOMBRE_RED[red]}, o un intento anterior se cortó y no sé si salió. ` +
        `Revisa la página antes de volver a intentarlo; si no salió, pide un cambio o genera la pieza de nuevo para publicarla.`,
    );

  const previa = await leerMarca<Marca>(nombre);
  if (previa?.estado === "publicada" && previa.link) return { link: previa.link, yaEstaba: true };
  if (previa) throw pendiente();

  if (!(await reservarMarca(nombre, { estado: "publicando", desde: new Date().toISOString() } satisfies Marca))) {
    const otra = await leerMarca<Marca>(nombre);
    if (otra?.estado === "publicada" && otra.link) return { link: otra.link, yaEstaba: true };
    throw pendiente();
  }

  let link: string;
  try {
    link = await publicar();
  } catch (error) {
    await borrarMarca(nombre).catch(() => {});
    throw error;
  }
  await escribirMarca(nombre, { estado: "publicada", link, desde: new Date().toISOString() } satisfies Marca).catch((error) =>
    console.error("[en-vivo] ❌ se publicó pero no se pudo guardar la marca:", error),
  );
  return { link, yaEstaba: false };
}
