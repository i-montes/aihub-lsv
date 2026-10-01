import { NextResponse, type NextRequest } from "next/server";

import {
  guardarConfiguracionHerramienta,
  listarConfiguracionHerramienta,
} from "@/lib/proveedores/configuracion";
import { sesionDeAdministrador } from "@/lib/proveedores/sesion";
import { esHerramientaConProveedores, validarCuerpoGuardado } from "@/lib/proveedores/tipos";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

type Contexto = { params: Promise<{ identidad: string }> };

/** Configuración de una herramienta, con las claves enmascaradas. Sólo OWNER o ADMIN. */
export async function GET(_request: NextRequest, { params }: Contexto) {
  const { identidad } = await params;
  if (!esHerramientaConProveedores(identidad)) {
    return NextResponse.json({ error: "Herramienta desconocida" }, { status: 404 });
  }
  const sesion = await sesionDeAdministrador();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  try {
    const configuracion = await listarConfiguracionHerramienta(sesion.organizationId, identidad);
    return NextResponse.json(configuracion, { headers: NO_STORE });
  } catch (error) {
    console.error("[herramientas/[identidad]/proveedores GET] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500, headers: NO_STORE });
  }
}

/** Guarda la lista completa de proveedores de la herramienta. Sólo OWNER o ADMIN. */
export async function PUT(request: NextRequest, { params }: Contexto) {
  const { identidad } = await params;
  if (!esHerramientaConProveedores(identidad)) {
    return NextResponse.json({ error: "Herramienta desconocida" }, { status: 404 });
  }
  const sesion = await sesionDeAdministrador();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  try {
    const cuerpo = await request.json().catch(() => null);
    const guardados = (await listarConfiguracionHerramienta(sesion.organizationId, identidad)).proveedores.map(
      (p) => p.proveedor
    );
    const validacion = validarCuerpoGuardado(cuerpo, guardados);
    if (!validacion.ok) {
      return NextResponse.json({ error: validacion.error, proveedor: validacion.proveedor }, { status: 400 });
    }

    const resultado = await guardarConfiguracionHerramienta(sesion.organizationId, identidad, validacion.proveedores);
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error, proveedor: resultado.proveedor }, { status: 400 });
    }
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    console.error("[herramientas/[identidad]/proveedores PUT] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500, headers: NO_STORE });
  }
}
