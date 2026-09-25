/**
 * Formas compartidas entre servidor y cliente para "Preguntas al chatbot".
 * Deliberadamente sin importar nada de `agente.ts`/`tools.ts` (que jalan
 * `pg` y las tools reales): este archivo lo importa el cliente, y esas
 * dependencias son de servidor únicamente.
 */

export interface FilaResumenPreguntas {
  fecha: string;
  tema: string;
  cantidad: number;
}

/**
 * Una pregunta individual. No la escribe el agente: sale de las filas que
 * devolvió su consulta SQL, donde ya venía con su texto y su fecha.
 */
export interface FilaDetallePreguntas {
  fecha: string;
  pregunta: string;
}

export interface ResultadoAgentePreguntas {
  comentario: string;
  resumen: FilaResumenPreguntas[];
}
