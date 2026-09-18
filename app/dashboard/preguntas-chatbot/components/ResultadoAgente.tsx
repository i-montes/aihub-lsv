"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BarChart3, ChevronDown, ChevronRight, Table2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { GraficaResumen, coloresPorTema } from "./GraficaResumen";
import { BotonCopiarTabla } from "./BotonCopiarTabla";
import type { ResultadoAgentePreguntas } from "@/lib/preguntas-chatbot/tipos";

/**
 * Tablas y gráfica del resultado final, dentro de la burbuja del agente.
 *
 * El orden es el de lectura de una nota: el comentario del agente (lo pinta
 * page.tsx justo encima), después las preguntas una por una —el dato crudo,
 * lo que el periodista viene a ver— y de último el resumen por tema, que es
 * la interpretación y por eso puede verse como gráfica o como tabla.
 *
 * Densidad de chat con el cuerpo a 16px: celdas cortas y un borde suave.
 */
export function ResultadoAgente({ resultado }: { resultado: ResultadoAgentePreguntas }) {
  const resumen = resultado.resumen ?? [];
  const detalle = resultado.detalle ?? [];

  if (resumen.length === 0 && detalle.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 w-full min-w-[240px] space-y-3 rounded-xl border border-gray-200 bg-white p-2 shadow-sm sm:p-3">
      {detalle.length > 0 && <BloquePreguntas detalle={detalle} />}
      {resumen.length > 0 && <BloqueResumen resumen={resumen} />}
    </div>
  );
}

/**
 * Las preguntas desagregadas. Abierta de entrada: es la tabla que sustenta
 * todo lo demás, y tenerla que desplegar escondía justo lo que se vino a ver.
 * El plegado se queda por si son muchas y estorban para llegar a la gráfica.
 */
function BloquePreguntas({ detalle }: { detalle: ResultadoAgentePreguntas["detalle"] }) {
  const [abierto, setAbierto] = useState(true);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="flex items-center gap-1.5 text-base font-medium text-primary-700 hover:underline"
        >
          {abierto ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Preguntas
          <span className="ml-1 rounded-full bg-primary-50 px-2 py-0.5 text-base text-primary-700">
            {detalle.length}
          </span>
        </button>
        <BotonCopiarTabla
          encabezados={["Fecha", "Pregunta"]}
          filas={detalle.map((f) => [f.fecha, f.pregunta])}
        />
      </div>
      {abierto && (
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
  );
}

/**
 * El resumen por tema, en gráfica o en tabla.
 *
 * Los chips de tema son leyenda y filtro a la vez, y filtran las dos vistas:
 * con cinco o seis series la gráfica se vuelve ilegible, y poder dejar sólo
 * dos es justamente lo que se hace para comparar.
 */
function BloqueResumen({ resumen }: { resumen: ResultadoAgentePreguntas["resumen"] }) {
  const [vista, setVista] = useState<"grafica" | "tabla">("grafica");
  const [ocultos, setOcultos] = useState<string[]>([]);

  const temas = useMemo(() => Array.from(new Set(resumen.map((f) => f.tema))), [resumen]);
  const colores = useMemo(() => coloresPorTema(temas), [temas]);

  const visibles = temas.filter((t) => !ocultos.includes(t));
  const filas = resumen.filter((f) => visibles.includes(f.tema));

  const alternarTema = (tema: string) =>
    setOcultos((previos) => {
      if (previos.includes(tema)) return previos.filter((t) => t !== tema);
      // No se deja apagar el último: una gráfica vacía no dice nada y deja al
      // usuario sin pista de cómo volver.
      return visibles.length > 1 ? [...previos, tema] : previos;
    });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
        <span className="text-base font-medium uppercase tracking-wide text-gray-500">
          Resumen por tema
        </span>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-gray-200 p-0.5">
            <BotonVista
              activo={vista === "grafica"}
              onClick={() => setVista("grafica")}
              icono={<BarChart3 className="h-4 w-4" />}
              texto="Gráfica"
            />
            <BotonVista
              activo={vista === "tabla"}
              onClick={() => setVista("tabla")}
              icono={<Table2 className="h-4 w-4" />}
              texto="Tabla"
            />
          </div>
          <BotonCopiarTabla
            encabezados={["Fecha", "Tema", "Cantidad"]}
            filas={filas.map((f) => [f.fecha, f.tema, f.cantidad])}
          />
        </div>
      </div>

      {temas.length > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-gray-100 px-3 py-2">
          {temas.map((tema) => {
            const activo = visibles.includes(tema);
            return (
              <button
                key={tema}
                type="button"
                onClick={() => alternarTema(tema)}
                aria-pressed={activo}
                title={activo ? "Ocultar este tema" : "Mostrar este tema"}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-base transition-colors",
                  activo
                    ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    : "border-dashed border-gray-200 bg-gray-50 text-gray-400"
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: activo ? colores[tema] : "#D1D5DB" }}
                />
                {tema}
              </button>
            );
          })}
        </div>
      )}

      {vista === "grafica" ? (
        <div className="min-w-0 overflow-hidden p-2">
          <GraficaResumen resumen={filas} colores={colores} />
        </div>
      ) : (
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
              {filas.map((fila, i) => (
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
      )}
    </div>
  );
}

function BotonVista({
  activo,
  onClick,
  icono,
  texto,
}: {
  activo: boolean;
  onClick: () => void;
  icono: ReactNode;
  texto: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-medium transition-colors",
        activo ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:text-gray-700"
      )}
    >
      {icono}
      {texto}
    </button>
  );
}
