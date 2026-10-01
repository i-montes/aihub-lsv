import { after, NextRequest } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import { verificarAccesoPreguntasChatbot } from "@/lib/preguntas-chatbot/acceso";
import { crearAgentePreguntasChatbot } from "@/lib/preguntas-chatbot/agente";
import { sanearHistorial } from "@/lib/preguntas-chatbot/mensajes";
import { normalizarResultado } from "@/lib/preguntas-chatbot/tipos";
import { AnalyticsPreguntasChatbotService } from "@/lib/analytics";
import { calcularCosto } from "@/lib/costos";
import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import { leerPromptDeOrganizacionCompleto } from "@/lib/organizaciones/prompt-herramienta";
import {
  listarProveedoresActivos,
  obtenerProveedorDeHerramienta,
  ProveedorNoConfiguradoError,
} from "@/lib/proveedores/configuracion";
import { normalizarProveedor } from "@/lib/proveedores/tipos";

/**
 * El agente puede llamar la tool de SQL varias veces antes de responder, y un
 * turno con varias consultas rondaba los 58 segundos contra un tope de 60: el
 * siguiente se cortaba a mitad del stream. Vercel admite hasta 300 en todos
 * los planes, así que el techo deja de ser el que manda.
 */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function jsonError(mensaje: string, status: number): Response {
  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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

  const body = await request.json().catch(() => null);

  // Sin selector en la interfaz: corre con el primer proveedor del orden de
  // Ajustes > Herramientas, salvo que el cuerpo pida otro que también esté encendido.
  const activos = await listarProveedoresActivos(organizationId, "preguntas-chatbot");
  if (activos.length === 0) {
    return jsonError("Preguntas a SillaIA no tiene ningún proveedor configurado. Configúralo en Ajustes > Herramientas.", 400);
  }
  const pedido = normalizarProveedor(body?.proveedor);
  const proveedorElegido = pedido && activos.some((a) => a.proveedor === pedido) ? pedido : activos[0].proveedor;

  let configuracion;
  try {
    configuracion = await obtenerProveedorDeHerramienta(organizationId, "preguntas-chatbot", proveedorElegido);
  } catch (error) {
    return jsonError(error instanceof ProveedorNoConfiguradoError ? error.message : "No se pudo obtener la configuración del proveedor", 400);
  }
  const proveedor = configuracion.proveedor.toLowerCase();
  const modelo = configuracion.modelo;
  const pestanasPrompt = await leerPromptDeOrganizacionCompleto(await getSupabaseRouteHandler(), organizationId, "preguntas-chatbot");
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
  let resultadoFinal: ReturnType<typeof normalizarResultado> | null = null;
  let errorDelTurno: string | null = null;

  const agent = crearAgentePreguntasChatbot({
    configuracion,
    registrarConsulta: (info) => consultas.push(info),
    pestanasPrompt,
  });

  const response = await createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    // Sin esto el AI SDK enmascara cualquier fallo del proveedor con un "An
    // error occurred", y el periodista ve una alerta que no dice nada y
    // nosotros no vemos nada en el servidor. Cuando el turno se rompe, el
    // mensaje del proveedor es justo lo que hace falta: nombra el ítem del
    // historial que rechazó.
    onError: (error) => {
      const detalle =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      console.error(
        `[preguntas-chatbot] ❌ turno roto (${proveedor}/${modelo}):`,
        error,
      );
      errorDelTurno = detalle;
      return detalle;
    },
    onStepFinish: async (step) => {
      pasos += 1;
      usos.push(step.usage);
      const llamadaFinal = step.toolCalls.find((c) => c.toolName === "reportarResultado");
      if (llamadaFinal) {
        resultadoFinal = normalizarResultado(llamadaFinal.input);
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
        comentario_agente: resultadoFinal?.comentario || null,
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
          errorDelTurno ??
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
