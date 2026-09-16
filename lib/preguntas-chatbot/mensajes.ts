/**
 * Saneo del historial que manda el navegador antes de dárselo al agente.
 *
 * `useChat` reenvía el hilo completo en cada pregunta, y tanto Anthropic como
 * OpenAI rechazan con 400 un historial donde una llamada a tool no va seguida
 * de su resultado ("tool_use ids were found without tool_result blocks").
 * Eso pasa cada vez que un turno queda a medias: el usuario le da a "detener"
 * mientras el agente consultaba, o el loop se corta por el tope de pasos justo
 * después de una llamada.
 *
 * Al usuario eso se le manifiesta como "la siguiente pregunta siempre falla",
 * y además es irrecuperable desde la UI: como el hilo roto se reenvía tal
 * cual, todas las preguntas que siguen fallan igual hasta que le da a "Nueva
 * conversación". Por eso se limpia aquí y no se confía sólo en que el agente
 * siempre cierre bien (ver tools.ts).
 */

/** Estados de una tool part que sí producen un resultado en el historial. */
const ESTADOS_CON_RESULTADO = new Set([
  "output-available",
  "output-error",
  "output-denied",
]);

function esToolPart(part: any): boolean {
  return (
    typeof part?.type === "string" &&
    (part.type.startsWith("tool-") || part.type === "dynamic-tool")
  );
}

/** Partes que aportan contenido al mensaje del modelo (las demás son marcas). */
function aportaContenido(part: any): boolean {
  return part?.type !== "step-start";
}

/**
 * Quita de los mensajes del agente las llamadas a tool que nunca recibieron
 * resultado, y descarta los mensajes que se quedan sin nada que decir (si no,
 * el proveedor rechaza un mensaje de assistant con contenido vacío).
 *
 * Los mensajes del usuario se devuelven intactos.
 */
export function sanearHistorial<T extends { role: string; parts?: any[] }>(
  messages: T[]
): T[] {
  const saneados: T[] = [];

  for (const mensaje of messages) {
    if (mensaje.role !== "assistant" || !Array.isArray(mensaje.parts)) {
      saneados.push(mensaje);
      continue;
    }

    const parts = mensaje.parts.filter(
      (part) => !esToolPart(part) || ESTADOS_CON_RESULTADO.has(part.state)
    );

    if (!parts.some(aportaContenido)) continue;
    saneados.push({ ...mensaje, parts });
  }

  return saneados;
}
