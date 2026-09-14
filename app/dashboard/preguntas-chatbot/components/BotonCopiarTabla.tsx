"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Evita que un tab o salto de línea dentro de una celda rompa el TSV */
function limpiarCelda(valor: string | number): string {
  return String(valor).replace(/[\t\n\r]+/g, " ");
}

/**
 * Copia una tabla al portapapeles como TSV (tab-separated values) — es el
 * formato que Excel y Google Sheets reconocen al pegar, sin necesitar
 * exportar/descargar ningún archivo.
 */
export function BotonCopiarTabla({
  encabezados,
  filas,
}: {
  encabezados: string[];
  filas: (string | number)[][];
}) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    const tsv = [encabezados, ...filas]
      .map((fila) => fila.map(limpiarCelda).join("\t"))
      .join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch (error) {
      console.error("No se pudo copiar la tabla:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={copiar}
      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
    >
      {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copiado ? "Copiado" : "Copiar tabla"}
    </button>
  );
}
