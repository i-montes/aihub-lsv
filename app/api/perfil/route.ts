import { NextRequest } from "next/server";

import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import {
  MAX_NOMBRE_LENGTH,
  ORGANIZACION_HABILITADA,
} from "@/app/dashboard/quien-es-quien/constants";

/**
 * El agente de perfiles tarda entre 80 y 160 segundos y tiene un tope duro de
 * 300 en el upstream. Con el default de Vercel el stream se cortaría a mitad
 * del perfil y parecería un fallo del API.
 */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const PERFIL_API_URL = "https://quienai.vercel.app/api/perfil";

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

  const supabase = await getSupabaseRouteHandler();
  const {
    data: { user },
    error: userAuthError,
  } = await supabase.auth.getUser();

  if (userAuthError || !user) {
    return sseError("No hay usuario autenticado", 401);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organizationId")
    .eq("id", user.id)
    .single();

  if (!profile?.organizationId) {
    return sseError("No se pudo obtener la organización del usuario", 403);
  }

  const { data: organization } = await supabase
    .from("organization")
    .select("name")
    .eq("id", profile.organizationId)
    .single();

  if (organization?.name !== ORGANIZACION_HABILITADA) {
    return sseError(
      "Tu organización no tiene habilitada esta herramienta",
      403
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

  let upstream: Response;

  try {
    upstream = await fetch(`${PERFIL_API_URL}?stream=1`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
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
