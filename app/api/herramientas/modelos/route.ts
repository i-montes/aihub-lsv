import { NextResponse, type NextRequest } from "next/server";

import { obtenerProveedorDeHerramienta, ProveedorNoConfiguradoError } from "@/lib/proveedores/configuracion";
import { ErrorProveedor, listarModelos } from "@/lib/proveedores/listar-modelos";
import { sesionDeAdministrador } from "@/lib/proveedores/sesion";
import { esHerramientaConProveedores, normalizarProveedor } from "@/lib/proveedores/tipos";

export const dynamic = "force-dynamic";

/**
 * Lista de modelos de un proveedor, con una clave nueva o con la que ya
 * tiene guardada una herramienta. Si la lista llega, la clave funciona.
 *
 * Cuerpo: { proveedor, apiKey } o { proveedor, herramienta }.
 */
export async function POST(request: NextRequest) {
  const sesion = await sesionDeAdministrador();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  const cuerpo = await request.json().catch(() => null);
  const proveedor = normalizarProveedor(cuerpo?.proveedor);
  if (!proveedor) return NextResponse.json({ error: "Proveedor desconocido" }, { status: 400 });

  try {
    let apiKey = typeof cuerpo?.apiKey === "string" ? cuerpo.apiKey.trim() : "";
    if (!apiKey) {
      const herramienta = cuerpo?.herramienta;
      if (!esHerramientaConProveedores(herramienta)) {
        return NextResponse.json({ error: "Falta la clave" }, { status: 400 });
      }
      apiKey = (await obtenerProveedorDeHerramienta(sesion.organizationId, herramienta, proveedor)).apiKey;
    }

    const modelos = await listarModelos(proveedor, apiKey);
    return NextResponse.json({ modelos }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ProveedorNoConfiguradoError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ErrorProveedor) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[herramientas/modelos] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
