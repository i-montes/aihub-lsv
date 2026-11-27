import { NextRequest } from "next/server";

import { esAdministrador, verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { camposDePlantilla } from "@/lib/en-vivo/canva";
import { conexionCanva, guardarConexionCanva } from "@/lib/en-vivo/conexiones";
import { jsonError } from "@/lib/en-vivo/flujo";

export const dynamic = "force-dynamic";

/** "Probar": lee los campos de datos de la plantilla con las credenciales guardadas. Sólo admins. */
export async function GET() {
  const { negado, organizationId, role } = await verificarAccesoEnVivo();
  if (negado) return jsonError(negado.mensaje, negado.status);
  if (!esAdministrador(role)) return jsonError("Sólo un administrador puede probar la conexión con Canva.", 403);

  const c = await conexionCanva(organizationId);
  if (!c) return jsonError("Canva no está configurado.", 400);
  try {
    const campos = await camposDePlantilla(c);
    const faltan = [c.campoTitular, c.campoFoto].filter((k) => !campos[k]);
    return Response.json({ campos, faltan });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudo probar Canva.", 502);
  }
}

/** Guarda las credenciales de la service app y la plantilla. Sólo admins. */
export async function PUT(request: NextRequest) {
  const { negado, organizationId, userId, role } = await verificarAccesoEnVivo();
  if (negado) return jsonError(negado.mensaje, negado.status);
  if (!esAdministrador(role)) return jsonError("Sólo un administrador puede configurar Canva.", 403);

  const b = await request.json().catch(() => null);
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const actual = await conexionCanva(organizationId);
  const datos = {
    clientId: texto(b?.clientId),
    // Vacío = conservar el secreto guardado, como las claves de los proveedores.
    clientSecret: texto(b?.clientSecret) || actual?.clientSecret || "",
    plantillaId: texto(b?.plantillaId),
    campoTitular: texto(b?.campoTitular) || "titular",
    campoFoto: texto(b?.campoFoto) || "foto",
  };
  if (!datos.clientId || !datos.clientSecret || !datos.plantillaId) {
    return jsonError("Faltan el client ID, el client secret o el ID de la plantilla.", 400);
  }
  try {
    await guardarConexionCanva(organizationId, userId, datos);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudo guardar.", 500);
  }
}
