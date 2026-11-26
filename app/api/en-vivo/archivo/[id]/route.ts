import { NextRequest } from "next/server";

import { AnalyticsEnVivoService } from "@/lib/analytics";
import { verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { esIdValido, leerArchivo, tipoDe } from "@/lib/en-vivo/almacen";
import { jsonError } from "@/lib/en-vivo/flujo";

export const dynamic = "force-dynamic";

/**
 * Sirve las fotos y piezas del almacén a quien tenga acceso a En Vivo. Con `?descargar=nombre`
 * baja el archivo con ese nombre y, si viene `analytics`, lo cuenta como descargado.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { negado } = await verificarAccesoEnVivo();
  if (negado) return jsonError(negado.mensaje, negado.status);

  const { id } = await params;
  if (!esIdValido(id)) return jsonError("Archivo no válido.", 400);
  const datos = await leerArchivo(id);
  if (!datos) return jsonError("El archivo ya no existe: vuelve a generar la pieza.", 404);

  const descargar = request.nextUrl.searchParams.get("descargar");
  const analyticsId = request.nextUrl.searchParams.get("analytics");
  if (descargar && analyticsId) {
    await new AnalyticsEnVivoService({}, analyticsId).updateSchema({ descargada: true }).catch(() => {});
  }

  const nombre = (descargar ?? "").replace(/[^a-z0-9-]/gi, "").slice(0, 80) || "envivo";
  return new Response(new Uint8Array(datos), {
    headers: {
      "Content-Type": tipoDe(id),
      "Cache-Control": "private, max-age=86400",
      ...(descargar ? { "Content-Disposition": `attachment; filename="${nombre}.png"` } : {}),
    },
  });
}
