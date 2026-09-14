import { after, NextRequest } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import { verificarAccesoPreguntasChatbot } from "@/lib/preguntas-chatbot/acceso";
import {
  crearAgentePreguntasChatbot,
  MODELO_PREGUNTAS_CHATBOT,
  PROVEEDOR_PREGUNTAS_CHATBOT,
} from "@/lib/preguntas-chatbot/agente";
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

async function obtenerApiKeyAnthropic(organizationId: string): Promise<string | null> {
  const supabase = await getSupabaseRouteHandler();
  const { data } = await supabase
    .from("api_key_table")
    .select("key")
    .eq("organizationId", organizationId)
    .eq("provider", "ANTHROPIC")
    .eq("status", "ACTIVE")
    .single();

  const key = data?.key?.trim();
  return key ? key : null;
}

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

  const apiKey = await obtenerApiKeyAnthropic(organizationId);
  if (!apiKey) {
    return jsonError(
      "Falta configurar la clave de Anthropic de la organización",
      500
    );
  }

  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? body.messages : [];
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
        calcularCosto(PROVEEDOR_PREGUNTAS_CHATBOT, MODELO_PREGUNTAS_CHATBOT, {
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
        modelo_utilizado: MODELO_PREGUNTAS_CHATBOT,
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
