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
 * Vacía los resultados voluminosos de turnos anteriores.
 *
 * `useChat` reenvía el hilo completo en cada pregunta, y aquí lo que viaja no
 * son sólo los textos: cada consulta SQL deja hasta 500 filas en el historial
 * y cada resultado final deja su tabla de preguntas desagregadas. Medido en
 * una conversación real, el contexto pasaba de 43.000 tokens en el primer
 * turno a 72.000 en el segundo, y el turno tardaba 58 segundos contra un tope
 * de 60: el tercero se cortaba a la mitad del stream y el usuario se quedaba
 * con el spinner girando.
 *
 * Las filas crudas no hacen falta para seguir la conversación: el agente ya
 * destiló lo que importaba en su `reportarResultado`, y si necesita el detalle
 * puede volver a consultar, que para eso tiene la tool. Se deja una nota en
 * lugar de los datos para que sepa que existieron.
 */
function aligerarParte(part: any): any {
  if (part?.type === "tool-consultarPreguntasChatbot") {
    const filas = Array.isArray(part.output?.filas) ? part.output.filas.length : 0;
    return {
      ...part,
      output: {
        omitido: true,
        filas_devueltas: filas,
        nota: "Las filas de esta consulta se omitieron del historial para ahorrar contexto. Si las necesitas, vuelve a consultar.",
      },
    };
  }

  // `detalle` ya no está en el esquema de reportarResultado: las preguntas
  // individuales se toman de las filas del SQL. Esto se queda para los hilos
  // que venían de antes — una pestaña abierta durante el despliegue reenvía su
  // historial viejo, con su tabla transcrita a cuestas.
  if (part?.type === "tool-reportarResultado" && Array.isArray(part.input?.detalle)) {
    const n = part.input.detalle.length;
    if (n === 0) return part;
    return {
      ...part,
      input: {
        ...part.input,
        detalle: [],
        detalle_omitido: `Se omitieron ${n} preguntas individuales del historial.`,
      },
    };
  }

  return part;
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

  // El último mensaje del agente se deja entero: es el que el usuario tiene
  // delante y sobre el que suele preguntar ("de esas, ¿cuáles son de...?").
  const ultimoDelAgente = messages.map((m) => m.role).lastIndexOf("assistant");

  for (const [i, mensaje] of messages.entries()) {
    if (mensaje.role !== "assistant" || !Array.isArray(mensaje.parts)) {
      saneados.push(mensaje);
      continue;
    }

    let parts = mensaje.parts.filter(
      (part) => !esToolPart(part) || ESTADOS_CON_RESULTADO.has(part.state)
    );

    if (i !== ultimoDelAgente) parts = parts.map(aligerarParte);

    if (!parts.some(aportaContenido)) continue;
    saneados.push({ ...mensaje, parts });
  }

  return saneados;
}
