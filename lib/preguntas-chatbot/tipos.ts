/**
 * Formas compartidas entre servidor y cliente para "Preguntas al chatbot".
 * Deliberadamente sin importar nada de `agente.ts`/`tools.ts` (que jalan
 * `pg` y las tools reales): este archivo lo importa el cliente, y esas
 * dependencias son de servidor únicamente.
 */

/** Una fila de la tabla de temas: la respuesta principal de la herramienta. */
export interface FilaTemaPreguntas {
  tema: string;
  /** Último día en que se preguntó algo del tema, ej. "18 sep" */
  fecha: string;
  /** Cómo lo preguntaron los lectores, tal cual; no todas las del tema */
  variantes: string[];
  /** Cuántas preguntas del período caen en el tema */
  veces: number;
  /** Los id de chats_new de todas las preguntas del tema */
  ids: string[];
}

/** Sólo para "las N preguntas más recientes": sin agrupar. */
export interface FilaRecientePreguntas {
  pregunta: string;
  fecha: string;
}

/** Sólo cuando se comparan períodos o temas: es lo que se grafica. */
export interface FilaResumenPreguntas {
  fecha: string;
  tema: string;
  cantidad: number;
}

export interface ResultadoAgentePreguntas {
  comentario: string;
  temas: FilaTemaPreguntas[];
  recientes: FilaRecientePreguntas[];
  resumen: FilaResumenPreguntas[];
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
    const n = Number(valor.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function lista(valor: unknown): unknown[] {
  return Array.isArray(valor) ? valor : [];
}

function registro(valor: unknown): Record<string, unknown> {
  return (valor ?? {}) as Record<string, unknown>;
}

/** Una celda de tabla markdown: sin saltos de línea ni barras que la partan. */
function celda(valor: string | number): string {
  return String(valor).replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|").trim();
}

function tablaMarkdown(encabezados: string[], filas: (string | number)[][]): string {
  const alineacion = encabezados.map((e) =>
    ["Veces", "Cantidad"].includes(e) ? "---:" : "---"
  );
  return [encabezados, alineacion, ...filas]
    .map((fila) => `| ${fila.map(celda).join(" | ")} |`)
    .join("\n");
}

/**
 * Las variantes en una sola celda: una tabla markdown no admite listas ni
 * saltos de línea dentro, así que van entre comillas y separadas por punto
 * medio, y cierran con "y X más" calculado a partir de Veces.
 */
function celdaVariantes(fila: FilaTemaPreguntas): string {
  const restantes = Math.max(0, fila.veces - fila.variantes.length);
  const partes = fila.variantes.map((v) => `“${v.trim()}”`);
  if (restantes > 0) partes.push(`y ${restantes} más`);
  return partes.join(" · ");
}

/**
 * El resultado como markdown, para pintarlo dentro de la respuesta igual que
 * el párrafo: el comentario y debajo sus tablas, sin caja ni scroll propios.
 * La gráfica de comparación no cabe en markdown y se pinta aparte.
 */
export function resultadoAMarkdown(resultado: ResultadoAgentePreguntas): string {
  const bloques: string[] = [];

  if (resultado.comentario) bloques.push(resultado.comentario);

  if (resultado.temas.length > 0) {
    bloques.push(
      tablaMarkdown(
        ["Tema", "Fecha", "Preguntas", "Veces"],
        resultado.temas.map((f) => [`**${f.tema}**`, f.fecha, celdaVariantes(f), f.veces])
      )
    );
  }

  if (resultado.recientes.length > 0) {
    bloques.push(
      tablaMarkdown(
        ["Pregunta", "Fecha"],
        resultado.recientes.map((f) => [f.pregunta, f.fecha])
      )
    );
  }

  if (resultado.resumen.length > 0) {
    bloques.push(
      tablaMarkdown(
        ["Fecha", "Tema", "Cantidad"],
        resultado.resumen.map((f) => [f.fecha, f.tema, f.cantidad])
      )
    );
  }

  return bloques.join("\n\n");
}

/**
 * Convierte el `input` de la tool `reportarResultado` en lo que pinta la UI,
 * sin lanzar nunca.
 *
 * Hace falta por dos razones:
 *
 * 1. Mientras el turno está en curso, el `input` que ve el cliente es el JSON
 *    a medio llegar: faltan campos, hay filas incompletas y un tema puede no
 *    traer todavía sus variantes.
 * 2. El esquema de la tool es a propósito permisivo con los tipos (ver
 *    tools.ts): un modelo que manda `"veces": "12"` no revienta el turno,
 *    pero alguien tiene que dejarlo en número. Ese alguien es esto.
 *
 * Las filas que no tienen nada útil se descartan en vez de dibujarse vacías.
 */
export function normalizarResultado(input: unknown): ResultadoAgentePreguntas {
  const crudo = registro(input);

  const temas = lista(crudo.temas)
    .map((fila): FilaTemaPreguntas => {
      const f = registro(fila);
      return {
        tema: texto(f.tema),
        fecha: texto(f.fecha),
        variantes: lista(f.variantes).map(texto).filter(Boolean),
        veces: numero(f.veces),
        ids: lista(f.ids).map(texto).filter(Boolean),
      };
    })
    .filter((f) => f.tema);

  const recientes = lista(crudo.recientes)
    .map((fila): FilaRecientePreguntas => {
      const f = registro(fila);
      return { pregunta: texto(f.pregunta), fecha: texto(f.fecha) };
    })
    .filter((f) => f.pregunta);

  const resumen = lista(crudo.resumen)
    .map((fila): FilaResumenPreguntas => {
      const f = registro(fila);
      return { fecha: texto(f.fecha), tema: texto(f.tema), cantidad: numero(f.cantidad) };
    })
    .filter((f) => f.fecha || f.tema);

  return { comentario: texto(crudo.comentario), temas, recientes, resumen };
}
