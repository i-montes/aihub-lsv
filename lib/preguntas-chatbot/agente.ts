import { ToolLoopAgent, hasToolCall, stepCountIs } from "ai";

import { crearModeloConfigurado } from "@/lib/proveedores/opciones-modelo";
import type { ProveedorEnUso } from "@/lib/proveedores/configuracion";

import { COLUMNAS_CHATS_NEW } from "@/lib/preguntas-chatbot/db";
import {
  MARCADOR_COLUMNAS,
  MARCADOR_HOY,
  PROMPTS_BASE_PREGUNTAS_CHATBOT,
  type PestanaPrompt,
} from "@/lib/preguntas-chatbot/prompt-base";
import {
  crearHerramientaConsulta,
  herramientaReportarResultado,
  type RegistrarConsulta,
} from "@/lib/preguntas-chatbot/tools";

/**
 * Fecha de hoy en Bogotá, ej. "2026-09-28 (lunes)". Va en el prompt porque
 * las reglas de fechas ("últimos 7 días contando hoy", "este mes") dependen
 * de ella y el modelo no tiene cómo saberla por su cuenta.
 */
function hoyEnBogota(): string {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const dia = ahora.toLocaleDateString("es-CO", { timeZone: "America/Bogota", weekday: "long" });
  return `${fecha} (${dia})`;
}

/**
 * La lista de columnas del prompt sale de COLUMNAS_CHATS_NEW, la misma que
 * arma la CTE en db.ts: si se agrega o quita una columna allá, el prompt se
 * entera solo y el modelo no puede pedir una que no existe.
 */
function columnasParaElPrompt(): string {
  const ancho = Math.max(...COLUMNAS_CHATS_NEW.map((c) => c.nombre.length));
  return COLUMNAS_CHATS_NEW.map(
    (c) => `  ${c.nombre.padEnd(ancho)}  ${c.tipo.padEnd(11)}  -- ${c.descripcion}`
  ).join("\n");
}

/**
 * Arma el prompt del agente a partir de sus pestañas: las que la organización
 * guardó en Ajustes > Herramientas o, si no tiene, las base de prompt-base.ts.
 * Se unen en orden y se reemplazan los marcadores de fecha y columnas.
 *
 * Una pestaña vacía se salta. Si todas están vacías se vuelve al prompt base:
 * un agente sin instrucciones no sirve para nada.
 */
function instrucciones(pestanas?: PestanaPrompt[]): string {
  const propias = (pestanas ?? [])
    .map((p) => p.content.trim())
    .filter((c) => c !== "");
  const partes =
    propias.length > 0
      ? propias
      : PROMPTS_BASE_PREGUNTAS_CHATBOT.map((p) => p.content.trim());

  return partes
    .join("\n\n")
    .replaceAll(MARCADOR_HOY, hoyEnBogota())
    .replaceAll(MARCADOR_COLUMNAS, columnasParaElPrompt());
}

/**
 * Tope de salida del turno. Sin él, el proveedor aplica su propio máximo (en
 * OpenAI, bajo) y el JSON de "reportarResultado" se corta a la mitad: la
 * respuesta se ve llegar en pantalla y al terminar revienta el turno entero.
 * Es el mismo problema —y el mismo remedio— que MAX_OUTPUT_TOKENS en
 * actions/analyze-text.ts.
 */
const MAX_OUTPUT_TOKENS = 16000;

export function crearAgentePreguntasChatbot(opts: {
  configuracion: ProveedorEnUso;
  registrarConsulta: RegistrarConsulta;
  /** Pestañas del prompt guardadas en Ajustes > Herramientas; ver `instrucciones` */
  pestanasPrompt?: PestanaPrompt[];
}) {
  const { model, providerOptions } = crearModeloConfigurado(opts.configuracion);
  return new ToolLoopAgent({
    model,
    instructions: instrucciones(opts.pestanasPrompt),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions,
    tools: {
      consultarPreguntasChatbot: crearHerramientaConsulta(opts.registrarConsulta),
      reportarResultado: herramientaReportarResultado,
    },
    // "required" llega a Anthropic como tool_choice "any", que sus modelos
    // nuevos rechazan con un 400. Ahí va "auto" y el prompt ya obliga a cerrar
    // con "reportarResultado".
    toolChoice: opts.configuracion.proveedor === "ANTHROPIC" ? "auto" : "required",
    // El turno termina cuando el modelo llama "reportarResultado". Se corta
    // por condición de parada y no por dejar esa tool sin `execute`, porque
    // una tool sin resultado deja el historial inválido para el proveedor y
    // hacía fallar la segunda pregunta de cada conversación (ver tools.ts).
    // Tope duro por si el modelo nunca la llama: 12 y no 8, porque ahora trae
    // total, período anterior y filas del tema, y a veces corrige el filtro.
    stopWhen: [hasToolCall("reportarResultado"), stepCountIs(12)],
  });
}
