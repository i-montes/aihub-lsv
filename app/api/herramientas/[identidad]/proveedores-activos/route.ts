import { NextResponse, type NextRequest } from "next/server";

import { listarProveedoresActivos } from "@/lib/proveedores/configuracion";
import { sesionDeOrganizacion } from "@/lib/proveedores/sesion";
import { esHerramientaConProveedores } from "@/lib/proveedores/tipos";

export const dynamic = "force-dynamic";

/**
 * Proveedores encendidos de una herramienta, en orden, sin claves ni
 * ajustes. Para cualquier miembro: es lo que arma el selector de la página
 * de uso y decide el proveedor por defecto.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ identidad: string }> }) {
  const { identidad } = await params;
  if (!esHerramientaConProveedores(identidad)) {
    return NextResponse.json({ error: "Herramienta desconocida" }, { status: 404 });
  }
  const sesion = await sesionDeOrganizacion();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  try {
    const proveedores = await listarProveedoresActivos(sesion.organizationId, identidad);
    return NextResponse.json({ proveedores }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[herramientas/[identidad]/proveedores-activos] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
