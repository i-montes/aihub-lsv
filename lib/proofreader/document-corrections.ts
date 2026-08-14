import type { Editor } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";

/**
 * Índice de texto del documento con el mapa de vuelta a posiciones ProseMirror.
 *
 * `text` es exactamente lo que se le envía al modelo, y `positions[i]` es la
 * posición ProseMirror del carácter `i` de ese texto. Mantener las dos cosas
 * en la misma función es lo que garantiza que el fragmento que devuelve el
 * modelo se pueda volver a localizar en el documento real.
 */
export interface TextIndex {
  text: string;
  positions: number[];
  /** Marca los caracteres que son separadores de bloque, no texto del documento */
  isSeparator: boolean[];
}

export const BLOCK_SEPARATOR = "\n\n";

/**
 * Recorre el documento una sola vez construyendo el texto plano y, a la par,
 * la posición ProseMirror de cada carácter.
 */
export function buildTextIndex(
  doc: PMNode,
  blockSeparator: string = BLOCK_SEPARATOR
): TextIndex {
  let text = "";
  const positions: number[] = [];
  const isSeparator: boolean[] = [];
  let pendingSeparator = false;

  const pushChar = (char: string, pos: number, separator: boolean) => {
    text += char;
    positions.push(pos);
    isSeparator.push(separator);
  };

  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      // El separador se emite justo antes del primer texto del bloque, así no
      // quedan separadores sueltos al final ni al principio del documento.
      if (pendingSeparator && text.length > 0) {
        for (const char of blockSeparator) pushChar(char, pos, true);
      }
      pendingSeparator = false;

      for (let k = 0; k < node.text.length; k++) {
        pushChar(node.text[k], pos + k, false);
      }
      return false;
    }

    // Los saltos de línea duros cuentan como salto dentro del mismo bloque
    if (node.type.name === "hardBreak") {
      pushChar("\n", pos, true);
      return false;
    }

    if (node.isBlock && text.length > 0) {
      pendingSeparator = true;
    }

    return true;
  });

  return { text, positions, isSeparator };
}

// Equivalencias que solo afectan a la comparación, nunca al documento.
// Se limitan a sustituciones de un carácter por otro para que el mapa de
// índices siga siendo uno a uno.
const CANONICAL_CHARS: Record<string, string> = {
  "‘": "'",
  "’": "'",
  "‚": "'",
  "“": '"',
  "”": '"',
  "„": '"',
  "–": "-",
  "—": "-",
  "−": "-",
  "«": '"',
  "»": '"',
};

export interface NormalizedText {
  normalized: string;
  /** indexMap[j] = índice en el texto original del carácter normalizado j */
  indexMap: number[];
}

/**
 * Proyección tolerante del texto para buscar: colapsa espacios, unifica
 * comillas tipográficas y guiones. Es sensible a mayúsculas a propósito,
 * porque muchas correcciones son justamente de capitalización.
 */
export function normalizeForMatch(text: string): NormalizedText {
  let normalized = "";
  const indexMap: number[] = [];
  let lastWasSpace = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (/\s/.test(char) || char === " ") {
      if (lastWasSpace) continue;
      lastWasSpace = true;
      normalized += " ";
      indexMap.push(i);
      continue;
    }

    lastWasSpace = false;
    normalized += CANONICAL_CHARS[char] ?? char;
    indexMap.push(i);
  }

  return { normalized, indexMap };
}

export interface FragmentMatch {
  /** Índices sobre TextIndex.text */
  start: number;
  end: number;
}

/**
 * Localiza un fragmento en el texto del documento, tolerando diferencias de
 * espaciado y de comillas. Busca primero a partir del cursor —para que las
 * repeticiones se resuelvan en orden de documento— y reintenta desde el
 * principio si no aparece.
 */
export function findFragment(
  index: TextIndex,
  fragment: string,
  fromChar = 0
): FragmentMatch | null {
  const { normalized, indexMap } = normalizeForMatch(index.text);
  const needle = normalizeForMatch(fragment).normalized.trim();

  if (!needle) return null;

  // Traducir el cursor del texto original a la proyección normalizada
  let normalizedCursor = 0;
  while (
    normalizedCursor < indexMap.length &&
    indexMap[normalizedCursor] < fromChar
  ) {
    normalizedCursor++;
  }

  let found = normalized.indexOf(needle, normalizedCursor);
  if (found === -1) found = normalized.indexOf(needle);
  if (found === -1) return null;

  return {
    start: indexMap[found],
    end: indexMap[found + needle.length - 1] + 1,
  };
}

export interface MinimalEdit {
  prefixLen: number;
  suffixLen: number;
  replacement: string;
}

/**
 * Recorta el prefijo y el sufijo comunes para quedarse solo con lo que
 * realmente cambia.
 *
 * Es la pieza que conserva el formato: en «gobierno» → «Gobierno» el cambio
 * real es un carácter, así que se reemplaza ese carácter y el enlace o la
 * negrita que lo envuelven no se tocan.
 */
export function computeMinimalEdit(
  original: string,
  suggestion: string
): MinimalEdit {
  let prefixLen = 0;
  const maxPrefix = Math.min(original.length, suggestion.length);
  while (
    prefixLen < maxPrefix &&
    original[prefixLen] === suggestion[prefixLen]
  ) {
    prefixLen++;
  }

  let suffixLen = 0;
  const maxSuffix = Math.min(
    original.length - prefixLen,
    suggestion.length - prefixLen
  );
  while (
    suffixLen < maxSuffix &&
    original[original.length - 1 - suffixLen] ===
      suggestion[suggestion.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  return {
    prefixLen,
    suffixLen,
    replacement: suggestion.slice(prefixLen, suggestion.length - suffixLen),
  };
}

/**
 * Marcas que se aplican al carácter que empieza en `pos`.
 *
 * No sirve `resolve(pos).marks()`: en la frontera de un tramo marcado
 * devuelve las marcas del nodo *anterior*, así que una corrección justo al
 * principio de un enlace acabaría perdiéndolo. `nodeAt` da el nodo que
 * realmente ocupa esa posición.
 */
export function marksAt(doc: PMNode, pos: number) {
  return doc.nodeAt(pos)?.marks ?? doc.resolve(pos).marks();
}

export type CorrectionFailure = "not-found" | "cross-block";

export interface CorrectionResult {
  applied: boolean;
  reason?: CorrectionFailure;
  /** Desde dónde buscar la siguiente corrección */
  nextCursor: number;
}

/**
 * Localiza la corrección en el documento y aplica solo el tramo que cambia,
 * heredando las marcas (enlace, negrita…) de la posición de inicio.
 */
export function applyCorrectionToEditor(
  editor: Editor,
  correction: { original: string; suggestion: string },
  cursor = 0
): CorrectionResult {
  const { state } = editor;
  const index = buildTextIndex(state.doc);

  const match = findFragment(index, correction.original, cursor);
  if (!match) {
    return { applied: false, reason: "not-found", nextCursor: cursor };
  }

  // El diff se calcula contra lo que hay de verdad en el documento, no contra
  // el `original` del modelo, que puede diferir en espacios o comillas.
  const matched = index.text.slice(match.start, match.end);
  const { prefixLen, suffixLen, replacement } = computeMinimalEdit(
    matched,
    correction.suggestion
  );

  const fromChar = match.start + prefixLen;
  const toChar = match.end - suffixLen;

  // Un reemplazo que abarque un separador cruzaría bloques y ProseMirror no
  // puede representarlo como un nodo de texto: se avisa en vez de corromper.
  for (let i = fromChar; i < toChar; i++) {
    if (index.isSeparator[i]) {
      return { applied: false, reason: "cross-block", nextCursor: match.end };
    }
  }

  const from =
    fromChar < index.positions.length
      ? index.positions[fromChar]
      : index.positions[index.positions.length - 1] + 1;
  const to =
    toChar > fromChar ? index.positions[toChar - 1] + 1 : from;

  const marks = marksAt(state.doc, from);
  const tr = state.tr;

  if (replacement) {
    tr.replaceWith(from, to, state.schema.text(replacement, marks));
  } else {
    tr.delete(from, to);
  }

  editor.view.dispatch(tr);

  return { applied: true, nextCursor: match.end };
}

/**
 * Rango en posiciones ProseMirror de un fragmento, para resaltarlo sin tocar
 * el documento.
 */
export function findRangeInEditor(
  editor: Editor,
  fragment: string,
  cursor = 0
): { from: number; to: number } | null {
  const index = buildTextIndex(editor.state.doc);
  const match = findFragment(index, fragment, cursor);
  if (!match) return null;

  return {
    from: index.positions[match.start],
    to: index.positions[match.end - 1] + 1,
  };
}

/** Texto plano del documento; es el que se envía al modelo */
export function getPlainTextFromEditor(editor: Editor): string {
  return buildTextIndex(editor.state.doc).text;
}
