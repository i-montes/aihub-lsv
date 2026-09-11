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

export interface FilaDetallePreguntas {
  fecha: string;
  pregunta: string;
}

export interface ResultadoAgentePreguntas {
  comentario: string;
  resumen: FilaResumenPreguntas[];
  detalle: FilaDetallePreguntas[];
}
