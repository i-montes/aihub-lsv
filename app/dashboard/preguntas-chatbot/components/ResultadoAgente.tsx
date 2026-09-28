"use client";

import { MarkdownView } from "@/components/shared/markdown-view";
import {
  resultadoAMarkdown,
  type ResultadoAgentePreguntas,
} from "@/lib/preguntas-chatbot/tipos";

import { GraficaResumen } from "./GraficaResumen";

/**
 * La respuesta final del agente, como un solo texto: el párrafo y debajo sus
 * tablas en markdown, igual que respondería un chat. Antes las tablas iban en
 * una caja aparte con su propio scroll, y se leían como un anexo y no como
 * parte de la respuesta.
 *
 * Lo único que va fuera del markdown es la gráfica, y sólo cuando piden
 * comparar períodos o temas.
 */
export function ResultadoAgente({ resultado }: { resultado: ResultadoAgentePreguntas }) {
  const markdown = resultadoAMarkdown(resultado);

  return (
    <>
      {markdown && <MarkdownView content={markdown} compacto />}
      {resultado.resumen.length > 0 && (
        <div className="mt-3 min-w-0 overflow-hidden">
          <GraficaResumen resumen={resultado.resumen} />
        </div>
      )}
    </>
  );
}
