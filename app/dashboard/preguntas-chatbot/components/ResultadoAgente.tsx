"use client";

import { useState } from "react";

import { GraficaResumen } from "./GraficaResumen";
import type { ResultadoAgentePreguntas } from "@/lib/preguntas-chatbot/tipos";

export function ResultadoAgente({ resultado }: { resultado: ResultadoAgentePreguntas }) {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const resumen = resultado.resumen ?? [];
  const detalle = resultado.detalle ?? [];

  if (resumen.length === 0 && detalle.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border bg-white p-4 space-y-4">
      {resumen.length > 0 && (
        <>
          <GraficaResumen resumen={resumen} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-1.5 pr-4 font-medium">Fecha</th>
                  <th className="py-1.5 pr-4 font-medium">Tema</th>
                  <th className="py-1.5 font-medium">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((fila, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-4">{fila.fecha}</td>
                    <td className="py-1.5 pr-4">{fila.tema}</td>
                    <td className="py-1.5">{fila.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {detalle.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setMostrarDetalle((v) => !v)}
            className="text-sm text-blue-600 hover:underline"
          >
            {mostrarDetalle ? "Ocultar" : "Ver"} preguntas individuales ({detalle.length})
          </button>
          {mostrarDetalle && (
            <div className="mt-2 max-h-64 overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-1.5 pr-4 font-medium">Fecha</th>
                    <th className="py-1.5 font-medium">Pregunta</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((fila, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5 pr-4 whitespace-nowrap align-top">{fila.fecha}</td>
                      <td className="py-1.5">{fila.pregunta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
