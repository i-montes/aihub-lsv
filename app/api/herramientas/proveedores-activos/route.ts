import { NextResponse } from "next/server";

import { listarProveedoresActivosDeTodas } from "@/lib/proveedores/configuracion";
import { sesionDeOrganizacion } from "@/lib/proveedores/sesion";

export const dynamic = "force-dynamic";

/** Proveedores encendidos de todas las herramientas, para las tarjetas de Ajustes */
export async function GET() {
  const sesion = await sesionDeOrganizacion();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  try {
    const porHerramienta = await listarProveedoresActivosDeTodas(sesion.organizationId);
    return NextResponse.json({ porHerramienta }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[herramientas/proveedores-activos] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
