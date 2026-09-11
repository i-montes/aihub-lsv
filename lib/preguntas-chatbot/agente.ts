import { createAnthropic } from "@ai-sdk/anthropic";
import { ToolLoopAgent, stepCountIs } from "ai";

import {
  crearHerramientaConsulta,
  herramientaReportarResultado,
  type RegistrarConsulta,
} from "@/lib/preguntas-chatbot/tools";

/**
 * Modelo usado por este agente. A propósito NO es DEFAULT_MODELS.ANTHROPIC
 * (Opus 4.8, el de las otras herramientas): para escribir SQL y resumir
 * datos tabulares Sonnet 5 alcanza sobrado y sale más barato. Sin selector en
 * la UI todavía —ver README del PR.
 */
export const MODELO_PREGUNTAS_CHATBOT = "claude-sonnet-5";
export const PROVEEDOR_PREGUNTAS_CHATBOT = "anthropic";

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
  trae una muestra de las preguntas que calzan, y clasifícalas TÚ por tema/subtema leyendo
  el texto — no inventes que SQL ya las agrupó semánticamente.
- Si la primera consulta no da lo que esperabas (columna mal escrita, cero filas cuando no
  debería), ajusta el SQL y vuelve a intentar — puedes llamar la tool varias veces en un
  mismo turno.
- Si el usuario pide comparar (ej. "esta semana vs la pasada", o varios temas a la vez), la
  tabla resumen debe tener una fila por cada combinación de fecha y tema/serie, para que se
  pueda graficar como series comparadas.

Cuando tengas la respuesta (o si de plano no se puede responder con estos datos), llama
SIEMPRE a "reportarResultado" para cerrar el turno — es la única forma de terminar.`;

export function crearAgentePreguntasChatbot(opts: {
  apiKey: string;
  registrarConsulta: RegistrarConsulta;
}) {
  const anthropic = createAnthropic({ apiKey: opts.apiKey });

  return new ToolLoopAgent({
    model: anthropic(MODELO_PREGUNTAS_CHATBOT),
    instructions: INSTRUCCIONES,
    tools: {
      consultarPreguntasChatbot: crearHerramientaConsulta(opts.registrarConsulta),
      reportarResultado: herramientaReportarResultado,
    },
    toolChoice: "required",
    stopWhen: stepCountIs(8),
  });
}
