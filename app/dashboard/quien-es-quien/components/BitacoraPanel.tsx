"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { Clock, Gavel, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DURACION_ESTIMADA_SEGUNDOS,
  PASOS_ESTIMADOS,
  type EntradaBitacora,
} from "../constants";
import { formatearDuracion, recortar } from "../utils";

/**
 * Lista de lo que el agente ha ido haciendo.
 *
 * `q` viene del API en español legible, pensado para mostrarse tal cual, así
 * que no se reescribe: es el mejor material que hay para llenar la espera.
 */
export const ListaBitacora: React.FC<{
  entradas: EntradaBitacora[];
  enCurso?: boolean;
}> = ({ entradas, enCurso = false }) => {
  const finalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (enCurso) finalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entradas.length, enCurso]);

  return (
    <ul className="space-y-2.5">
      {entradas.map((entrada, indice) => (
        <li
          key={`${entrada.tipo}-${indice}`}
          className="flex items-start gap-2.5 text-sm animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          {entrada.tipo === "busqueda" ? (
            <>
              <Search className="w-4 h-4 text-soft-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 flex-1 text-left">
                {recortar(entrada.q)}
              </span>
              <span className="text-gray-400 text-xs flex-shrink-0 mt-0.5 whitespace-nowrap">
                {entrada.resultados}{" "}
                {entrada.resultados === 1 ? "resultado" : "resultados"}
              </span>
            </>
          ) : (
            <>
              <Gavel className="w-4 h-4 text-soft-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 flex-1 text-left">
                Proyectos de ley de {entrada.persona} como {entrada.rol}
              </span>
              <span className="text-gray-400 text-xs flex-shrink-0 mt-0.5 whitespace-nowrap">
                {entrada.total}{" "}
                {entrada.total === 1 ? "proyecto" : "proyectos"}
              </span>
            </>
          )}
        </li>
      ))}

      {enCurso && (
        <li className="flex items-start gap-2.5 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 flex-shrink-0 mt-0.5 animate-spin" />
          <span className="text-left">
            {entradas.length === 0
              ? "Preparando las primeras búsquedas…"
              : "Buscando más fuentes…"}
          </span>
        </li>
      )}

      <div ref={finalRef} />
    </ul>
  );
};

interface BitacoraPanelProps {
  nombre: string;
  paso: number;
  segundos: number;
  entradas: EntradaBitacora[];
  onCancelar: () => void;
}

/**
 * Pantalla de espera. Ocupa todo el ancho porque durante minuto y medio es lo
 * único que hay que mirar.
 */
export const BitacoraPanel: React.FC<BitacoraPanelProps> = ({
  nombre,
  paso,
  segundos,
  entradas,
  onCancelar,
}) => {
  // El progreso sale de los pasos reales del agente, pero nunca llega al 100 %
  // hasta que llegue el evento `fin`: no se inventa el tramo final.
  const progreso = Math.min((paso / PASOS_ESTIMADOS) * 100, 95);
  const demorado = segundos > DURACION_ESTIMADA_SEGUNDOS.max;

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">
          Perfilando a {nombre}
        </h2>

        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="tabular-nums text-lg font-medium">
            {formatearDuracion(segundos)}
          </span>
          {paso > 0 && (
            <span className="text-sm text-gray-400">
              · paso {paso} de ~{PASOS_ESTIMADOS}
            </span>
          )}
        </div>

        <div className="mt-5 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progreso, 4)}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {demorado
            ? "Está tardando más de lo normal, pero sigue trabajando."
            : `Suele tardar entre ${DURACION_ESTIMADA_SEGUNDOS.min} y ${DURACION_ESTIMADA_SEGUNDOS.max} segundos.`}
        </p>

        <div className="mt-6 pt-6 border-t border-gray-100 max-h-[38vh] overflow-y-auto">
          <ListaBitacora entradas={entradas} enCurso />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onCancelar}
          className="mt-6"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};
