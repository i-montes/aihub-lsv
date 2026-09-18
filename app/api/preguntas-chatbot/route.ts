import { after, NextRequest } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import { verificarAccesoPreguntasChatbot } from "@/lib/preguntas-chatbot/acceso";
import {
  crearAgentePreguntasChatbot,
  esProveedorSoportado,
  MODELO_PREGUNTAS_CHATBOT,
  PROVEEDOR_PREGUNTAS_CHATBOT,
  type ProveedorSoportado,
} from "@/lib/preguntas-chatbot/agente";
import { sanearHistorial } from "@/lib/preguntas-chatbot/mensajes";
import { AnalyticsPreguntasChatbotService } from "@/lib/analytics";
import { calcularCosto } from "@/lib/costos";
import { getSupabaseRouteHandler } from "@/lib/supabase/server";

/** El agente puede llamar la tool de SQL varias veces antes de responder. */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function jsonError(mensaje: string, status: number): Response {
  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Clave activa de ese proveedor para la organización, y la lista de modelos
 * que el admin le habilitó en Ajustes. Los modelos sirven para rechazar un
 * modelo que no esté configurado: el selector de la UI sale de esa misma
 * lista, así que un modelo ajeno sólo llega por una petición armada a mano.
 */
async function obtenerApiKey(
  organizationId: string,
  proveedor: ProveedorSoportado
): Promise<{ key: string; modelos: string[] } | null> {
  const supabase = await getSupabaseRouteHandler();
  const { data } = await supabase
    .from("api_key_table")
    .select("key, models")
    .eq("organizationId", organizationId)
    .eq("provider", COLUMNA_PROVEEDOR[proveedor])
    .eq("status", "ACTIVE")
    .maybeSingle();

  const key = data?.key?.trim();
  if (!key) return null;
  const modelos = Array.isArray(data?.models)
    ? (data.models as unknown[]).filter((m): m is string => typeof m === "string")
    : [];
  return { key, modelos };
}

/** Nombre legible del proveedor para los mensajes de error */
const NOMBRE_PROVEEDOR: Record<ProveedorSoportado, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
};

/** Cómo se guarda el proveedor en api_key_table.provider */
const COLUMNA_PROVEEDOR = {
  anthropic: "ANTHROPIC",
  openai: "OPENAI",
  google: "GOOGLE",
} as const satisfies Record<ProveedorSoportado, string>;

function textoDeMensaje(mensaje: any): string {
  if (!Array.isArray(mensaje?.parts)) return "";
  return mensaje.parts
    .filter((p: any) => p.type === "text")
    .map((p: any) => p.text)
    .join("\n");
}

export async function POST(request: NextRequest) {
  const { negado, organizationId, userId } = await verificarAccesoPreguntasChatbot();
  if (negado) return jsonError(negado.mensaje, negado.status);

  const body = await request.json().catch(() => null);

  // Sin selección explícita se usa el modelo de siempre, para que un cliente
  // viejo (o una pestaña abierta antes del despliegue) siga funcionando.
  const proveedor: ProveedorSoportado = esProveedorSoportado(body?.proveedor)
    ? (body.proveedor.toLowerCase() as ProveedorSoportado)
    : PROVEEDOR_PREGUNTAS_CHATBOT;
  const modelo: string =
    typeof body?.modelo === "string" && body.modelo.trim()
      ? body.modelo.trim()
      : MODELO_PREGUNTAS_CHATBOT;

  const credencial = await obtenerApiKey(organizationId, proveedor);
  if (!credencial) {
    return jsonError(
      `La organización no tiene una clave activa de ${NOMBRE_PROVEEDOR[proveedor]}. Configúrala en Ajustes.`,
      400
    );
  }
  if (credencial.modelos.length > 0 && !credencial.modelos.includes(modelo)) {
    return jsonError(
      `El modelo ${modelo} no está habilitado para ${NOMBRE_PROVEEDOR[proveedor]} en Ajustes.`,
      400
    );
  }
  const apiKey = credencial.key;
  // Se sanea antes de usarlo: un turno que quedó a medias (el usuario detuvo
  // al agente) deja una llamada a tool sin resultado, y el proveedor rechaza
  // todo el hilo con un 400 a partir de ahí. Ver lib/preguntas-chatbot/mensajes.ts.
  const messages = sanearHistorial(
    Array.isArray(body?.messages) ? body.messages : []
  );
  const sessionId =
    typeof body?.sessionId === "string" && body.sessionId
      ? body.sessionId
      : crypto.randomUUID();

  const turno = messages.filter((m: any) => m.role === "user").length;
  const ultimoMensajeUsuario = [...messages].reverse().find((m: any) => m.role === "user");
  const preguntaUsuario = textoDeMensaje(ultimoMensajeUsuario).slice(0, 5000);

  const inicio = Date.now();
  const consultas: { sql: string; filas: number; error: string | null }[] = [];
  const usos: any[] = [];
  let pasos = 0;
  let resultadoFinal: { comentario?: string; resumen?: unknown; detalle?: unknown } | null =
    null;

  const agent = crearAgentePreguntasChatbot({
    apiKey,
    proveedor,
    modelo,
    registrarConsulta: (info) => consultas.push(info),
  });

  const response = await createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    onStepFinish: async (step) => {
      pasos += 1;
      usos.push(step.usage);
      const llamadaFinal = step.toolCalls.find((c) => c.toolName === "reportarResultado");
      if (llamadaFinal) {
        resultadoFinal = llamadaFinal.input as typeof resultadoFinal;
      }
    },
  });

  after(async () => {
    try {
      const costosPorPaso = usos.map((uso) =>
        calcularCosto(proveedor, modelo, {
          inputTokens: uso?.inputTokens,
          outputTokens: uso?.outputTokens,
          cachedInputTokens: uso?.inputTokenDetails?.cacheReadTokens,
          cacheWriteTokens: uso?.inputTokenDetails?.cacheWriteTokens,
        })
      );
      const costo = costosPorPaso.some((c) => c === null)
        ? null
        : costosPorPaso.reduce((total: number, c) => total + (c ?? 0), 0);

      const sumar = (campo: (uso: any) => number | null | undefined) =>
        usos.reduce((total: number, uso) => total + (campo(uso) ?? 0), 0) || null;

      const analytics = new AnalyticsPreguntasChatbotService({
        session_id: sessionId,
        user_id: userId,
        organization_id: organizationId,
        turno,
        pregunta_usuario: preguntaUsuario || null,
        comentario_agente: resultadoFinal?.comentario ?? null,
        sql_ejecutado: consultas.map((c) => c.sql),
        filas_devueltas: consultas.reduce((total, c) => total + c.filas, 0),
        resumen: (resultadoFinal?.resumen as any) ?? null,
        pasos_agente: pasos,
        modelo_utilizado: modelo,
        input_tokens: sumar((u) => u?.inputTokens),
        output_tokens: sumar((u) => u?.outputTokens),
        total_tokens: sumar((u) => u?.totalTokens),
        reasoning_tokens: sumar((u) => u?.outputTokenDetails?.reasoningTokens),
        cached_input_tokens: sumar((u) => u?.inputTokenDetails?.cacheReadTokens),
        cache_write_tokens: sumar((u) => u?.inputTokenDetails?.cacheWriteTokens),
        costo,
        tiempo_procesamiento: (Date.now() - inicio) / 1000,
        error_mensaje:
          consultas.find((c) => c.error)?.error ??
          (resultadoFinal ? null : "El agente no llegó a reportarResultado"),
        created_at: new Date(),
      });
      await analytics.save();
      analytics.avisarSiNoGuardo(`preguntas-chatbot turno ${turno}`);
    } catch (error) {
      console.error("No se pudo registrar analytics de preguntas-chatbot:", error);
    }
  });

  return response;
}
