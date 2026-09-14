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
 * Tool "de respuesta": el modelo la llama para entregar el resultado final
 * del turno. No tiene `execute` a propósito — según la documentación de la
 * AI SDK (ToolLoopAgent), una tool sin `execute` termina el loop del agente
 * ahí mismo, así que esto funciona como la señal de "ya terminé" sin
 * necesitar una condición de parada aparte.
 */
export const herramientaReportarResultado = tool({
  description:
    "Entrega la respuesta final de este turno: un comentario breve en lenguaje " +
    "natural, la tabla resumen (para graficar) y la tabla desagregada de preguntas. " +
    "Se debe llamar siempre al final, incluso si la respuesta es que no se encontró " +
    "nada o que la pregunta no se puede responder con estos datos (en ese caso, " +
    "resumen y detalle van vacíos y el comentario lo explica).",
  inputSchema: z.object({
    comentario: z
      .string()
      .describe(
        "Respuesta breve en lenguaje natural para mostrar en el chat, con el " +
          "hallazgo principal (ej. 'Las preguntas sobre pensiones subieron 40% esta semana')."
      ),
    resumen: z
      .array(
        z.object({
          fecha: z
            .string()
            .describe("Fecha o periodo agregado, ej. '2026-09-10' o 'Semana del 8 al 14'"),
          tema: z
            .string()
            .describe(
              "Tema o serie a la que corresponde esta fila (útil para comparar varios " +
                "temas o periodos a la vez; si sólo hay un tema, repetirlo en todas las filas)."
            ),
          cantidad: z.number().describe("Cantidad de preguntas de ese tema en esa fecha"),
        })
      )
      .describe(
        "Tabla resumen para graficar: una fila por combinación de fecha y tema/serie."
      ),
    detalle: z
      .array(
        z.object({
          fecha: z.string().describe("Fecha y hora de la pregunta (created_at)"),
          pregunta: z.string(),
        })
      )
      .describe(
        "Preguntas individuales desagregadas que sustentan el resumen, como máximo " +
          "las más relevantes (no hace falta listar cientos si el resumen ya las agrega)."
      ),
  }),
});
