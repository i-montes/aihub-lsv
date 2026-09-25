"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { GraficaResumen } from "./GraficaResumen";
import { BotonCopiarTabla } from "./BotonCopiarTabla";
import type {
  FilaDetallePreguntas,
  ResultadoAgentePreguntas,
} from "@/lib/preguntas-chatbot/tipos";

/**
 * Saca las preguntas individuales de las filas que devolvió el SQL.
 *
 * Antes las transcribía el agente en su respuesta, una por una. Era gastar
 * tokens de salida —y tiempo— en copiar texto que ya había viajado: las filas
 * vienen de `chats_new`, donde la pregunta ya está escrita. Ahora el agente
 * sólo redacta el comentario y el resumen, y esto recoge el resto.
 *
 * Las columnas dependen del SELECT que haya escrito el modelo, así que se
 * busca por nombre y se acepta lo que haya. Una fila sólo cuenta si trae texto
 * de pregunta; las de conteos agregados se ignoran solas.
 */
function preguntasDeLasFilas(filas: Record<string, unknown>[]): FilaDetallePreguntas[] {
  const vistas = new Set<string>();
  const salida: FilaDetallePreguntas[] = [];

  for (const fila of filas) {
    const pregunta = typeof fila?.pregunta === "string" ? fila.pregunta.trim() : "";
    if (!pregunta) continue;

    // La misma pregunta puede venir en varias consultas del mismo turno.
    if (vistas.has(pregunta)) continue;
    vistas.add(pregunta);

    const cruda = fila.created_at ?? fila.fecha ?? "";
    salida.push({ fecha: typeof cruda === "string" ? cruda : String(cruda ?? ""), pregunta });
  }

  return salida;
}

/**
 * Tablas y gráfica del resultado final, dentro de la burbuja del agente.
 * Densidad de chat: celdas cortas, tipografía a 13px y un borde suave.
 *
 * El orden es respuesta, preguntas individuales y después la gráfica. Las
 * preguntas son lo que el periodista viene a leer —son las palabras de la
 * gente—, así que van primero; la gráfica y el resumen son el agregado y
 * quedan de contexto debajo.
 */
export function ResultadoAgente({
  resultado,
  filasConsultadas = [],
}: {
  resultado: ResultadoAgentePreguntas;
  /** Filas crudas de las consultas SQL de este mismo turno. */
  filasConsultadas?: Record<string, unknown>[];
}) {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const resumen = resultado.resumen ?? [];
  const detalle = preguntasDeLasFilas(filasConsultadas);

  if (resumen.length === 0 && detalle.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 w-full min-w-[240px] space-y-3 rounded-xl border border-gray-200 bg-white p-2 shadow-sm sm:p-3">
      {detalle.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-3 py-2">
            <button
              type="button"
              onClick={() => setMostrarDetalle((v) => !v)}
              aria-expanded={mostrarDetalle}
              className="flex items-center gap-1.5 text-base font-medium text-primary-700 hover:underline"
            >
              {mostrarDetalle ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Preguntas individuales
              <span className="ml-1 rounded-full bg-primary-50 px-2 py-0.5 text-base text-primary-700">
                {detalle.length}
              </span>
            </button>
            {mostrarDetalle && (
              <BotonCopiarTabla
                encabezados={["Fecha", "Pregunta"]}
                filas={detalle.map((f) => [f.fecha, f.pregunta])}
              />
            )}
          </div>
          {mostrarDetalle && (
            <div className="max-h-[420px] overflow-auto border-t border-gray-100">
              <table className="w-full text-base">
                <thead className="sticky top-0 bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Fecha</th>
                    <th className="px-3 py-2 font-medium">Pregunta</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((fila, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="whitespace-nowrap px-3 py-2 align-top text-gray-600">
                        {fila.fecha}
                      </td>
                      <td className="px-3 py-2 leading-snug text-gray-800">{fila.pregunta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {resumen.length > 0 && (
        <>
          <div className="min-w-0 overflow-hidden">
            <GraficaResumen resumen={resumen} />
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <span className="text-base font-medium uppercase tracking-wide text-gray-500">
                Resumen
              </span>
              <BotonCopiarTabla
                encabezados={["Fecha", "Tema", "Cantidad"]}
                filas={resumen.map((f) => [f.fecha, f.tema, f.cantidad])}
              />
            </div>
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full text-base">
                <thead className="sticky top-0 bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Fecha</th>
                    <th className="px-3 py-2 font-medium">Tema</th>
                    <th className="px-3 py-2 text-right font-medium">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((fila, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{fila.fecha}</td>
                      <td className="px-3 py-2 text-gray-800">{fila.tema}</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums text-gray-900">
                        {fila.cantidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
