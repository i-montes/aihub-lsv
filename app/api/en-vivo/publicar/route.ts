import { NextRequest } from "next/server";

import { analyticsPropia } from "@/lib/analytics";
import { verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { leerArchivo } from "@/lib/en-vivo/almacen";
import { conexionFacebook, conexionInstagram, marcarFacebookDesconectado } from "@/lib/en-vivo/conexiones";
import { ErrorMeta, origenPublico, publicar } from "@/lib/en-vivo/facebook";
import { jsonError } from "@/lib/en-vivo/flujo";
import { publicarEnInstagram, textoInstagram } from "@/lib/en-vivo/instagram";
import { PublicacionPendienteError, publicarUnaVez, type Red } from "@/lib/en-vivo/publicaciones";

/** Instagram procesa la imagen antes de publicar: puede tardar más que Facebook. */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Lo que puede esperar Instagram desde que empieza el pedido: deja margen bajo `maxDuration`. */
const PLAZO_MS = 240_000;

type Resultado = { red: Red; ok: true; link: string; yaEstaba: boolean } | { red: Red; ok: false; error: string };

/**
 * Publica la pieza en las redes pedidas. Cada red va por separado: si una falla, las otras no se
 * deshacen, y la respuesta trae el resultado de cada una. Cada red pasa por `publicarUnaVez`: la
 * misma pieza no sale dos veces aunque el editor reintente o la función se corte a mitad.
 */
export async function POST(request: NextRequest) {
  const inicio = Date.now();
  const { negado, organizationId, userId } = await verificarAccesoEnVivo();
  if (negado) return jsonError(negado.mensaje, negado.status);

  const body = await request.json().catch(() => null);
  const imagen = typeof body?.imagen === "string" ? body.imagen : "";
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  const url = typeof body?.url === "string" ? body.url : "";
  const redes: Red[] = (Array.isArray(body?.redes) ? body.redes : ["facebook"]).filter((r: unknown): r is Red => r === "facebook" || r === "instagram");
  if (!imagen || !texto) return jsonError("Faltan la imagen o el texto del post.", 400);
  if (!redes.length) return jsonError("Elige al menos una red.", 400);

  const fb = await conexionFacebook(organizationId);
  if (!fb || fb.estado !== "conectado") {
    return jsonError("La página de Facebook no está conectada: conéctala con «Conectar con Facebook», arriba en Post redes.", 400);
  }
  const png = await leerArchivo(imagen);
  if (!png) return jsonError("No encontré la imagen: vuelve a generar la pieza.", 404);
  // La segunda foto (opcional) va después de la pieza, en las dos redes.
  const evidencia = typeof body?.evidencia === "string" && body.evidencia ? body.evidencia : null;
  const segunda = evidencia ? await leerArchivo(evidencia) : null;
  if (evidencia && !segunda) return jsonError("No encontré la segunda foto: vuelve a agregarla.", 404);
  const pngs = segunda ? [png, segunda] : [png];

  const nombre = typeof body.nombre === "string" ? body.nombre : "envivo";
  const resultados: Resultado[] = [];
  const fallo = async (red: Red, error: unknown): Promise<Resultado> => {
    if (error instanceof PublicacionPendienteError) return { red, ok: false, error: error.message };
    if (error instanceof ErrorMeta && error.hayQueReconectar) {
      await marcarFacebookDesconectado(organizationId).catch(() => {});
      return { red, ok: false, error: `${error.message} Hay que volver a conectar Facebook en Ajustes.` };
    }
    console.error(`[en-vivo] ❌ no se pudo publicar en ${red}:`, error);
    return { red, ok: false, error: error instanceof Error ? error.message : "No se pudo publicar." };
  };

  if (redes.includes("facebook")) {
    try {
      const r = await publicarUnaVez(organizationId, "facebook", imagen, evidencia, async () => (await publicar(fb, pngs, texto, nombre)).link);
      resultados.push({ red: "facebook", ok: true, ...r });
    } catch (error) {
      resultados.push(await fallo("facebook", error));
    }
  }

  if (redes.includes("instagram")) {
    const ig = await conexionInstagram(organizationId);
    if (!ig || ig.pageId !== fb.pageId) {
      resultados.push({ red: "instagram", ok: false, error: "Instagram no está conectado: reconecta Facebook en Ajustes y acepta los permisos de Instagram." });
    } else {
      try {
        const caption = typeof body.textoInstagram === "string" && body.textoInstagram.trim() ? body.textoInstagram.trim() : textoInstagram(texto, url);
        const origen = origenPublico(request.headers, request.nextUrl.origin);
        const r = await publicarUnaVez(
          organizationId,
          "instagram",
          imagen,
          evidencia,
          async () => (await publicarEnInstagram(fb, ig, pngs, caption, origen, inicio + PLAZO_MS)).link,
        );
        resultados.push({ red: "instagram", ok: true, ...r });
      } catch (error) {
        resultados.push(await fallo("instagram", error));
      }
    }
  }

  // El id lo manda el navegador: sólo se toca la fila si es de esta organización y de este usuario.
  const analytics = await analyticsPropia(body.analyticsId, organizationId, userId).catch(() => null);
  if (analytics) {
    const ok = (red: Red) => resultados.find((r) => r.red === red && r.ok) as Extract<Resultado, { ok: true }> | undefined;
    await analytics
      .updateSchema({
        ...(ok("facebook") ? { publicada: true, permalink: ok("facebook")!.link } : {}),
        ...(ok("instagram") ? { publicada_instagram: true, permalink_instagram: ok("instagram")!.link } : {}),
      })
      .catch(() => {});
  }

  return Response.json({ resultados });
}
