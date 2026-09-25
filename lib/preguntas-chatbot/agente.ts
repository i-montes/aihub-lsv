import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { ToolLoopAgent, hasToolCall, stepCountIs, type LanguageModel } from "ai";

import { DEFAULT_MODELS } from "@/lib/utils";

import {
  crearHerramientaConsulta,
  herramientaReportarResultado,
  type RegistrarConsulta,
} from "@/lib/preguntas-chatbot/tools";

/**
 * Proveedor y modelo de la herramienta.
 *
 * La interfaz ya no tiene selector: la herramienta corre siempre con esto.
 * Se quitó porque el turno se rompía con algunos proveedores y no vale la
 * pena exponer la elección mientras eso no esté resuelto — es preferible un
 * camino que funcione que tres entre los que elegir a ciegas.
 *
 * El servidor sigue sabiendo instanciar los tres proveedores y respeta lo
 * que le manden en el cuerpo, así que devolver el selector es volver a
 * pintarlo; no hay que deshacer nada de aquí.
 */
export const MODELO_PREGUNTAS_CHATBOT = DEFAULT_MODELS.OPENAI;
export const PROVEEDOR_PREGUNTAS_CHATBOT = "openai";

/** Proveedores que sabemos instanciar. Coincide con los de api_key_table. */
export const PROVEEDORES_SOPORTADOS = ["anthropic", "openai", "google"] as const;
export type ProveedorSoportado = (typeof PROVEEDORES_SOPORTADOS)[number];

export function esProveedorSoportado(valor: unknown): valor is ProveedorSoportado {
  return (
    typeof valor === "string" &&
    (PROVEEDORES_SOPORTADOS as readonly string[]).includes(valor.toLowerCase())
  );
}

const INSTRUCCIONES = `Eres un analista de datos para La Silla Vacía. Respondes, en español y a partir
de datos reales, qué le han preguntado los lectores al chatbot del medio.

Tienes una tool "consultarPreguntasChatbot" que ejecuta SQL de SOLO LECTURA (SELECT)
contra la tabla chats_new de PostgreSQL. Su esquema:

  id           bigint
  pregunta     text            -- lo que escribió el lector
  respuesta    text            -- JSON como string: {"respuesta","fuentes","tipo_respuesta"}
  created_at   timestamptz     -- cuándo se hizo la pregunta
  history      jsonb           -- turnos previos de esa misma conversación
  origin       text            -- ej. "Web"
  user_name    text            -- id anónimo del lector (guest_<uuid>), no un nombre real

Las pruebas internas del equipo (debug_mode = true) ya están excluidas de lo que ves en
chats_new: no hace falta que las filtres, y no es posible incluirlas aunque te las pidan.

Reglas para las consultas:
- Los conteos y fechas los agrega Postgres (COUNT, date_trunc, GROUP BY): no traigas miles
  de filas crudas para contarlas tú. Cuando agrupes por día, usa
  "date_trunc('day', created_at at time zone 'America/Bogota')" — el medio es colombiano y
  el "día" que importa es el de Bogotá, no el de UTC.
- chats_new NO tiene una columna de "tema". Si te piden un tema (ej. "preguntas sobre
  pensiones"), fíltralo con ILIKE sobre "pregunta" sobre las palabras razonables del tema,
  trae TODAS las preguntas que calzan (no una muestra: la tool corta en 500 filas y de
  eso se encarga ella), y clasifícalas TÚ por tema/subtema leyendo el texto — no
  inventes que SQL ya las agrupó semánticamente.
- Si la primera consulta no da lo que esperabas (columna mal escrita, cero filas cuando no
  debería), ajusta el SQL y vuelve a intentar — puedes llamar la tool varias veces en un
  mismo turno.
- Si el usuario pide comparar (ej. "esta semana vs la pasada", o varios temas a la vez), la
  tabla resumen debe tener una fila por cada combinación de fecha y tema/serie, para que se
  pueda graficar como series comparadas.

- Las preguntas individuales NO se transcriben en la respuesta: la interfaz las muestra
  tomándolas de las filas que devolvió tu consulta. Lo que sí tienes que hacer es
  asegurarte de que alguna de tus consultas traiga la columna "pregunta" (y "created_at"
  si quieres que salga la fecha) de TODAS las filas que sustentan tu respuesta, no de una
  parte. Si tu resumen dice que hubo 60 preguntas de un tema, esa consulta tiene que
  devolver las 60: el conteo y la lista salen de lo mismo y no pueden discrepar.
  Escribirlas de nuevo una por una sólo gasta tiempo y no agrega nada.

Cuando tengas la respuesta (o si de plano no se puede responder con estos datos), llama
SIEMPRE a "reportarResultado" para cerrar el turno — es la única forma de terminar.`;

/**
 * Instancia el modelo del proveedor elegido con la clave de la organización.
 * Mismo reparto que hace el Detector en app/api/detector/route.ts.
 */
function crearModelo(proveedor: ProveedorSoportado, modelo: string, apiKey: string): LanguageModel {
  switch (proveedor) {
    case "openai":
      return createOpenAI({ apiKey })(modelo);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelo);
    case "anthropic":
      return createAnthropic({ apiKey })(modelo);
  }
}

export function crearAgentePreguntasChatbot(opts: {
  apiKey: string;
  proveedor: ProveedorSoportado;
  modelo: string;
  registrarConsulta: RegistrarConsulta;
}) {
  return new ToolLoopAgent({
    model: crearModelo(opts.proveedor, opts.modelo, opts.apiKey),
    instructions: INSTRUCCIONES,
    tools: {
      consultarPreguntasChatbot: crearHerramientaConsulta(opts.registrarConsulta),
      reportarResultado: herramientaReportarResultado,
    },
    toolChoice: "required",
    // El turno termina cuando el modelo llama "reportarResultado". Se corta
    // por condición de parada y no por dejar esa tool sin `execute`, porque
    // una tool sin resultado deja el historial inválido para el proveedor y
    // hacía fallar la segunda pregunta de cada conversación (ver tools.ts).
    // stepCountIs(8) queda como tope duro por si el modelo nunca la llama.
    stopWhen: [hasToolCall("reportarResultado"), stepCountIs(8)],
  });
}
