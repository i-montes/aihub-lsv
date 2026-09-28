import { tool } from "ai";
import { z } from "zod";

import { ejecutarSqlSoloLectura, SqlNoPermitidoError } from "@/lib/preguntas-chatbot/db";

/**
 * Registra cada intento de consulta (válido o no) para la analítica del
 * turno — el agente puede llamar la tool varias veces mientras afina el SQL.
 */
export type RegistrarConsulta = (info: {
  sql: string;
  filas: number;
  error: string | null;
}) => void;

export function crearHerramientaConsulta(registrar: RegistrarConsulta) {
  return tool({
    description:
      "Ejecuta una consulta SQL de SOLO LECTURA (SELECT) contra la tabla chats_new " +
      "del chatbot de La Silla Vacía y devuelve las filas. Sólo se permite un SELECT " +
      "por llamada, sin punto y coma en medio ni comentarios. Si la consulta falla " +
      "(sintaxis, columna inexistente, tabla no permitida), el mensaje de error se " +
      "devuelve tal cual para que puedas corregirla y volver a intentar.",
    inputSchema: z.object({
      sql: z
        .string()
        .describe(
          "Una sola sentencia SELECT (o WITH ... SELECT) de PostgreSQL contra chats_new."
        ),
    }),
    execute: async ({ sql }) => {
      try {
        const resultado = await ejecutarSqlSoloLectura(sql);
        registrar({ sql, filas: resultado.filas.length, error: null });
        return resultado;
      } catch (error) {
        const mensaje =
          error instanceof SqlNoPermitidoError || error instanceof Error
            ? error.message
            : "Error desconocido ejecutando la consulta";
        registrar({ sql, filas: 0, error: mensaje });
        return { error: mensaje };
      }
    },
  });
}

/**
 * Número o string: el esquema de la tool final es a propósito tolerante.
 *
 * El AI SDK valida el `input` de una tool contra este esquema cuando la
 * llamada termina de llegar, y si no calza corta el turno con
 * `InvalidToolInputError`. Los modelos de OpenAI mandan con frecuencia
 * `"veces": "42"` o `"fecha": 2026`, y el turno se rompía justo al final: el
 * usuario veía la tabla armarse en pantalla y, al terminar, todo se
 * reemplazaba por un error.
 *
 * Aceptarlo aquí y normalizarlo después (ver `normalizarResultado` en
 * tipos.ts) es preferible a perder una respuesta que ya está completa por una
 * comilla de más.
 */
const numeroTolerante = z.union([z.number(), z.string()]);
const textoTolerante = z.union([z.string(), z.number()]);

/**
 * Tool "de respuesta": el modelo la llama para entregar el resultado final
 * del turno.
 *
 * Tiene un `execute` que no hace nada más que acusar recibo, y eso es
 * deliberado. Antes no lo tenía —una tool sin `execute` corta el loop— pero
 * eso dejaba en el historial una llamada a tool sin su resultado, y tanto
 * Anthropic como OpenAI rechazan con 400 un turno donde un `tool_use` no va
 * seguido de su `tool_result`. Resultado: la primera pregunta funcionaba y la
 * segunda siempre reventaba, porque `useChat` reenvía todo el hilo.
 *
 * Ahora el loop lo corta `hasToolCall("reportarResultado")` en agente.ts, y
 * el par llamada/resultado queda completo. La respuesta se deja mínima a
 * propósito: se reenvía en el historial de cada turno siguiente, y lo que le
 * importa al modelo (y a la UI) es el `input`, no esto.
 */
export const herramientaReportarResultado = tool({
  description:
    "Entrega la respuesta final de este turno: el párrafo resumen, la tabla de " +
    "temas y, según el caso, la lista de preguntas más recientes o la tabla para " +
    "graficar una comparación. Se debe llamar siempre al final, incluso si no se " +
    "encontró nada o la pregunta no se puede responder con estos datos (en ese " +
    "caso las listas van vacías y el comentario lo explica).",
  inputSchema: z.object({
    comentario: z
      .string()
      .describe(
        "Párrafo resumen, máximo 80 palabras: volumen con el rango exacto de fechas, " +
          "peso sobre el total, tendencia y las dudas que más se repiten."
      ),
    temas: z
      .array(
        z.object({
          tema: textoTolerante.describe(
            "Nombre corto y específico del grupo, como lo diría la redacción"
          ),
          fecha: textoTolerante.describe(
            "Último día en que se preguntó algo del tema, en hora de Bogotá (ej. '18 sep')"
          ),
          variantes: z
            .array(textoTolerante)
            .describe(
              "Preguntas reales tal como las escribieron, cortadas a 150 caracteres. " +
                "Sin 'y X más': la interfaz lo calcula con veces."
            ),
          veces: numeroTolerante.describe("Cuántas preguntas del período caen en el tema"),
          ids: z
            .array(numeroTolerante)
            .optional()
            .describe("Los id de chats_new de todas las preguntas del tema"),
        })
      )
      .optional()
      .describe(
        "La tabla de temas, de más a menos veces. La suma de veces es igual al " +
          "número de preguntas del comentario."
      ),
    recientes: z
      .array(
        z.object({
          pregunta: textoTolerante,
          fecha: textoTolerante.describe("Día de la pregunta en hora de Bogotá"),
        })
      )
      .optional()
      .describe(
        "Solo cuando piden las preguntas más recientes: sin agrupar, de la más " +
          "reciente a la más antigua."
      ),
    resumen: z
      .array(
        z.object({
          fecha: textoTolerante.describe(
            "Período, ej. '2026-09-10' o 'Semana del 8 al 14'"
          ),
          tema: textoTolerante.describe("Tema o serie de esta fila"),
          cantidad: numeroTolerante.describe("Cantidad de preguntas, como número"),
        })
      )
      .optional()
      .describe(
        "Solo cuando piden comparar períodos o temas: una fila por combinación de " +
          "período y tema, para graficarla como series comparadas."
      ),
  }),
  execute: async () => ({ entregado: true }),
});
