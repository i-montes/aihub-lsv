import { after, NextRequest, NextResponse } from "next/server";

import { verificarAccesoQuienEsQuien } from "@/lib/quien-es-quien/acceso";
import { MAX_NOMBRE_LENGTH } from "@/app/dashboard/quien-es-quien/constants";
import { AnalyticsQuienEsQuienService } from "@/lib/analytics";

/** El upstream tarda entre 3 y 10 segundos: con el default de Vercel sobra. */
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const NOMBRE_API_URL = "https://quienai.vercel.app/api/nombre";

/**
 * Costo estimado de una llamada a `/api/nombre`. El upstream no reporta el
 * costo real en esta respuesta (a diferencia de `/api/perfil`, que sí trae
 * `metricas.costo_usd` en el evento `fin`) — este número es el que ya estaba
 * documentado en el comentario original de esta ruta, no una medición.
 */
const COSTO_ESTIMADO_NOMBRE = 0.003;

function jsonError(mensaje: string, status: number) {
  return NextResponse.json({ error: mensaje }, { status });
}

/**
 * Guarda la fila de analytics después de responder. Nunca debe tumbar la
 * respuesta al usuario: cualquier error aquí sólo se registra en consola.
 */
function registrarAnalytics(datos: {
  userId: string;
  organizationId: string;
  nombre: string;
  estado?: string | null;
  errorMensaje?: string | null;
}) {
  after(async () => {
    try {
      const analytics = new AnalyticsQuienEsQuienService({
        user_id: datos.userId,
        organization_id: datos.organizationId,
        tipo: "nombre",
        nombre_consultado: datos.nombre,
        estado: datos.estado ?? null,
        costo_usd: datos.errorMensaje ? null : COSTO_ESTIMADO_NOMBRE,
        costo_estimado: true,
        error_mensaje: datos.errorMensaje ?? null,
        created_at: new Date(),
      });
      await analytics.save();
      analytics.avisarSiNoGuardo(`nombre (${datos.errorMensaje ? "fallido" : datos.estado ?? "?"})`);
    } catch (error) {
      console.error("No se pudo registrar analytics de /api/nombre:", error);
    }
  });
}

/**
 * POST /api/nombre
 *
 * Proxy del API que resuelve un nombre contra el archivo antes de generar el
 * perfil. Existe por lo mismo que `/api/perfil`: el token no puede viajar al
 * navegador.
 *
 * Esta llamada cuesta ~$0.003 —cien veces menos que un perfil— y es lo que
 * evita gastar $0.35 y dos minutos en la persona equivocada por un nombre mal
 * tecleado o ambiguo.
 */
export async function POST(request: NextRequest) {
  const token = process.env.PERFILBOT_TOKEN;

  if (!token) {
    return jsonError(
      "Falta configurar el acceso al generador de perfiles. Avisa al equipo técnico.",
      500
    );
  }

  const { negado, organizationId, userId } = await verificarAccesoQuienEsQuien();
  if (negado) return jsonError(negado.mensaje, negado.status);

  const body = await request.json().catch(() => null);
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";

  if (!nombre) {
    return jsonError("Escribe el nombre de la persona", 400);
  }

  if (nombre.length > MAX_NOMBRE_LENGTH) {
    return jsonError(
      `El nombre no puede pasar de ${MAX_NOMBRE_LENGTH} caracteres`,
      400
    );
  }

  let upstream: Response;

  try {
    upstream = await fetch(NOMBRE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
      signal: request.signal,
    });
  } catch (error) {
    console.error("Error llamando al API de nombres:", error);
    registrarAnalytics({
      userId,
      organizationId,
      nombre,
      errorMensaje: "No se pudo conectar con el buscador de nombres",
    });
    return jsonError("No se pudo conectar con el buscador de nombres", 502);
  }

  const datos = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    const mensaje =
      typeof datos?.error === "string" ? datos.error : "No se pudo verificar el nombre";
    console.error(`API de nombres respondió ${upstream.status}:`, mensaje);
    registrarAnalytics({ userId, organizationId, nombre, errorMensaje: mensaje });
    return jsonError(mensaje, upstream.status);
  }

  if (!datos) {
    registrarAnalytics({
      userId,
      organizationId,
      nombre,
      errorMensaje: "El buscador de nombres respondió algo ilegible",
    });
    return jsonError("El buscador de nombres respondió algo ilegible", 502);
  }

  registrarAnalytics({ userId, organizationId, nombre, estado: datos.estado ?? null });

  return NextResponse.json(datos);
}
