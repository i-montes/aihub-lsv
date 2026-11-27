import { NextRequest } from "next/server";

import { verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { armarEvidencia } from "@/lib/en-vivo/evidencia";
import { jsonError } from "@/lib/en-vivo/flujo";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Arma la segunda foto del post (opcional) desde un archivo subido o un link. */
export async function POST(request: NextRequest) {
  const { negado } = await verificarAccesoEnVivo();
  if (negado) return jsonError(negado.mensaje, negado.status);

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const datos = typeof body?.foto?.datos === "string" ? body.foto.datos : "";
  if (!url && !datos) return jsonError("Sube una foto o pega su link.", 400);

  try {
    const imagen = await armarEvidencia(url ? { url } : { datos, nombre: String(body.foto.nombre ?? "foto") });
    return Response.json({ imagen });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudo armar la segunda foto.", 400);
  }
}
