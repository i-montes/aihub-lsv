import { NextRequest } from "next/server";

import { verificarAccesoQuienEsQuien } from "@/lib/quien-es-quien/acceso";
import { createOrgToken } from "@/lib/services/org-token";
import { MAX_NOMBRE_LENGTH } from "@/app/dashboard/quien-es-quien/constants";

/**
 * El agente de perfiles tarda entre 80 y 160 segundos y tiene un tope duro de
 * 300 en el upstream. Con el default de Vercel el stream se cortaría a mitad
 * del perfil y parecería un fallo del API.
 */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const PERFIL_API_URL = "https://quienai.vercel.app/api/perfil";

/**
 * Vigencia del token que identifica a la organización ante el upstream. Diez
 * minutos cubren de sobra un perfil (80-160 s, con tope de 300) y se firma uno
 * nuevo en cada petición, así que nunca hay que renovarlo ni guardarlo.
 */
const LSV_TOKEN_TTL_SECONDS = 10 * 60;

/**
 * Empaqueta un error como evento SSE.
 *
 * En streaming el upstream responde siempre 200 y avisa de los fallos con
 * `event: error`, así que los errores propios del proxy se emiten con la misma
 * forma: el cliente tiene un solo camino de manejo.
 */
function sseError(message: string, status?: number): Response {
  const payload = JSON.stringify({ error: message, status });

  return new Response(`event: error\ndata: ${payload}\n\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Lee el `{ error }` del upstream sin romperse si no vino JSON */
async function readUpstreamError(response: Response): Promise<string | null> {
  try {
    const body = await response.json();
    return typeof body?.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}

/**
 * POST /api/perfil
 *
 * Proxy del API de perfiles "Quién es quién". Existe porque el token no puede
 * viajar al navegador: cada llamada cuesta ~$0.20 y quien lo viera en devtools
 * podría gastar la cuenta a voluntad.
 *
 * Reenvía el stream SSE del upstream tal cual.
 */
export async function POST(request: NextRequest) {
  const token = process.env.PERFILBOT_TOKEN;

  if (!token) {
    return sseError(
      "Falta configurar el acceso al generador de perfiles. Avisa al equipo técnico.",
      500
    );
  }

  const { negado, organizationId } = await verificarAccesoQuienEsQuien();
  if (negado) return sseError(negado.mensaje, negado.status);

  /**
   * `LSV-TOKEN` le dice al upstream de qué organización viene la petición, y le
   * sirve para pedir sus claves de IA a `POST /api/internal/llm-keys`. Se firma
   * aquí en cada llamada: el navegador nunca lo ve y expira en diez minutos.
   */
  let lsvToken: string;

  try {
    lsvToken = createOrgToken(organizationId, LSV_TOKEN_TTL_SECONDS);
  } catch (error) {
    console.error("No se pudo firmar el token de organización:", error);
    return sseError(
      "Falta configurar el acceso al generador de perfiles. Avisa al equipo técnico.",
      500
    );
  }

  const body = await request.json().catch(() => null);
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";

  if (!nombre) {
    return sseError("Escribe el nombre de la persona", 400);
  }

  if (nombre.length > MAX_NOMBRE_LENGTH) {
    return sseError(
      `El nombre no puede pasar de ${MAX_NOMBRE_LENGTH} caracteres`,
      400
    );
  }

  /**
   * El cuerpo es el `para_generar` que devolvió `/api/nombre`, y se reenvía sin
   * tocar: `confirmado: true` es lo que le dice al agente que ese nombre ya fue
   * verificado contra el archivo y que no lo complete ni lo corrija por su
   * cuenta. La `descripcion` es la que desempata entre homónimos.
   */
  const descripcion =
    typeof body?.descripcion === "string" ? body.descripcion : undefined;
  const confirmado = body?.confirmado === true;

  let upstream: Response;

  try {
    upstream = await fetch(`${PERFIL_API_URL}?stream=1`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "LSV-TOKEN": lsvToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, descripcion, confirmado }),
      // El usuario cancela desde la UI: hay que cortar también el upstream.
      signal: request.signal,
    });
  } catch (error) {
    console.error("Error llamando al API de perfiles:", error);
    return sseError("No se pudo conectar con el generador de perfiles");
  }

  // Los fallos previos al stream (401, 400, 500) llegan como JSON normal.
  if (!upstream.ok || !upstream.body) {
    const message = await readUpstreamError(upstream);
    console.error(
      `API de perfiles respondió ${upstream.status}:`,
      message ?? "(sin mensaje)"
    );

    return sseError(
      message ?? "El generador de perfiles no respondió correctamente",
      upstream.status
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
