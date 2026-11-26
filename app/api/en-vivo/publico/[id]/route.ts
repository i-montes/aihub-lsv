import { NextRequest } from "next/server";

import { esIdValido, leerArchivo, tipoDe } from "@/lib/en-vivo/almacen";
import { firmaValida } from "@/lib/en-vivo/publico";

export const dynamic = "force-dynamic";

/**
 * Un archivo del almacén sin sesión, si la firma vale y no venció (ver lib/en-vivo/publico.ts).
 * Lo baja Instagram para publicar la pieza.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = request.nextUrl.searchParams;
  if (!esIdValido(id) || !firmaValida(id, q.get("vence"), q.get("firma"))) {
    return new Response("Enlace vencido o no válido.", { status: 403 });
  }
  const datos = await leerArchivo(id);
  if (!datos) return new Response("El archivo ya no existe.", { status: 404 });
  return new Response(new Uint8Array(datos), {
    headers: { "Content-Type": tipoDe(id), "Cache-Control": "private, max-age=3600" },
  });
}
