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

function texto(valor: unknown): string {
  if (typeof valor === "string") return valor;
  if (typeof valor === "number" || typeof valor === "boolean") return String(valor);
  return "";
}

function numero(valor: unknown): number {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  if (typeof valor === "string") {
    // El modelo a veces manda "1.234" o "12 preguntas": se rescata el número.
    const limpio = valor.replace(/[^\d.-]/g, "");
    const n = Number(limpio);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Convierte el `input` de la tool `reportarResultado` en el resultado que
 * espera la UI, sin lanzar nunca.
 *
 * Hace falta por dos razones distintas:
 *
 * 1. Mientras el turno está en curso, el `input` que ve el cliente es el JSON
 *    a medio llegar: faltan campos, hay filas incompletas y `cantidad` puede
 *    ser todavía un string.
 * 2. El esquema de la tool es a propósito permisivo con los tipos (ver
 *    tools.ts): un modelo que manda `"cantidad": "12"` ya no revienta el
 *    turno entero, pero alguien tiene que dejarlo en número. Ese alguien es
 *    esto.
 *
 * Las filas que no tienen nada útil (sin fecha, sin tema y sin pregunta) se
 * descartan en vez de dibujarse vacías.
 */
export function normalizarResultado(input: unknown): ResultadoAgentePreguntas {
  const crudo = (input ?? {}) as Record<string, unknown>;

  const resumen = (Array.isArray(crudo.resumen) ? crudo.resumen : [])
    .map((fila): FilaResumenPreguntas => {
      const f = (fila ?? {}) as Record<string, unknown>;
      return {
        fecha: texto(f.fecha),
        tema: texto(f.tema),
        cantidad: numero(f.cantidad),
      };
    })
    .filter((f) => f.fecha || f.tema);

  const detalle = (Array.isArray(crudo.detalle) ? crudo.detalle : [])
    .map((fila): FilaDetallePreguntas => {
      const f = (fila ?? {}) as Record<string, unknown>;
      return { fecha: texto(f.fecha), pregunta: texto(f.pregunta) };
    })
    .filter((f) => f.pregunta);

  return { comentario: texto(crudo.comentario), resumen, detalle };
}
