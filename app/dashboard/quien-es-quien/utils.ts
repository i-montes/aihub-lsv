/**
 * Utilidades del generador de perfiles: lectura del stream SSE y formateo.
 */

export interface EventoSse {
  evento: string;
  datos: unknown;
}

/**
 * Convierte un bloque SSE (`event: …` + `data: …`) en un evento utilizable.
 *
 * Devuelve `null` para los bloques que no traen las dos partes: comentarios de
 * keep-alive, líneas sueltas o restos de un bloque mal formado.
 */
export function parsearBloqueSse(bloque: string): EventoSse | null {
  const evento = bloque.match(/^event: (.+)$/m)?.[1]?.trim();

  // Un mismo evento puede repartir el payload en varias líneas `data:`.
  const lineas = bloque
    .split("\n")
    .filter((linea) => linea.startsWith("data:"))
    .map((linea) => linea.slice("data:".length).trim());

  if (!evento || lineas.length === 0) return null;

  try {
    return { evento, datos: JSON.parse(lineas.join("\n")) };
  } catch {
    console.warn("Evento SSE con JSON inválido:", bloque);
    return null;
  }
}

/**
 * Recorre el cuerpo de la respuesta y va entregando los eventos SSE completos.
 *
 * El último bloque de cada lectura puede venir cortado, así que se guarda en el
 * buffer hasta que llegue su separador.
 */
export async function* leerEventosSse(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<EventoSse> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const bloques = buffer.split("\n\n");
      buffer = bloques.pop() ?? "";

      for (const bloque of bloques) {
        const evento = parsearBloqueSse(bloque);
        if (evento) yield evento;
      }
    }

    // El stream puede cerrarse sin el separador final del último bloque.
    const ultimo = parsearBloqueSse(buffer);
    if (ultimo) yield ultimo;
  } finally {
    // Salir antes de tiempo (un `event: error`) también debe cerrar el stream.
    await reader.cancel().catch(() => undefined);
  }
}

/** Segundos a `mm:ss`, para el cronómetro de la espera */
export function formatearDuracion(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);
  return `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}

/**
 * El 502 es el único error donde reintentar tiene sentido: el agente arrancó
 * pero no terminó. Los demás no se arreglan repitiendo la llamada, y cada
 * intento cuesta otros ~$0.20.
 */
export function esReintentable(status?: number): boolean {
  return status === 502;
}

/** Recorta la pregunta del agente para que no rompa el ancho de la bitácora */
export function recortar(texto: string, maximo = 110): string {
  const limpio = texto.trim();
  return limpio.length > maximo ? `${limpio.slice(0, maximo - 1)}…` : limpio;
}
