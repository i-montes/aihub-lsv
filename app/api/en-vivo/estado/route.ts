import { esAdministrador, verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { estadoConexiones } from "@/lib/en-vivo/conexiones";
import { jsonError } from "@/lib/en-vivo/flujo";
import { usaFuenteDeRespaldo } from "@/lib/en-vivo/plantilla";

export const dynamic = "force-dynamic";

/** Estado de Canva y Facebook para la pantalla, sin secretos. */
export async function GET() {
  const { negado, organizationId, role } = await verificarAccesoEnVivo();
  if (negado) return jsonError(negado.mensaje, negado.status);
  try {
    return Response.json({ ...(await estadoConexiones(organizationId)), esAdmin: esAdministrador(role), fuenteRespaldo: usaFuenteDeRespaldo() });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudo leer el estado de las conexiones.", 500);
  }
}
