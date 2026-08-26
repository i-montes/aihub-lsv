"use client";

import type React from "react";
import { useState } from "react";
import { AlertTriangle, Check, Copy, Plus } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MarkdownView, copiarMarkdown } from "@/components/shared/markdown-view";
import type { EntradaBitacora, PerfilResultado } from "../constants";
import { ListaBitacora } from "./BitacoraPanel";

interface PerfilPanelProps {
  resultado: PerfilResultado;
  entradas: EntradaBitacora[];
  onNuevoPerfil: () => void;
}

/** Métricas del perfil, en el orden en que le sirven a quien lo va a usar */
function resumirMetricas(resultado: PerfilResultado): string[] {
  const { metricas } = resultado;
  if (!metricas) return [];

  const partes: string[] = [];
  const fuentes = metricas.citas?.links_unicos;
  const busquedas = metricas.busquedas;
  const segundos = metricas.segundos;

  if (typeof fuentes === "number") {
    partes.push(`${fuentes} ${fuentes === 1 ? "fuente citada" : "fuentes citadas"}`);
  }
  if (typeof busquedas === "number") {
    partes.push(`${busquedas} ${busquedas === 1 ? "búsqueda" : "búsquedas"}`);
  }
  if (typeof metricas.leyes_encontradas === "number" && metricas.leyes_encontradas > 0) {
    partes.push(`${metricas.leyes_encontradas} proyectos de ley`);
  }
  if (typeof segundos === "number") {
    partes.push(`${Math.round(segundos)} s`);
  }

  return partes;
}

/**
 * Perfil terminado. La bitácora de la espera queda accesible en un acordeón:
 * sirve para saber qué se buscó y qué no.
 */
export const PerfilPanel: React.FC<PerfilPanelProps> = ({
  resultado,
  entradas,
  onNuevoPerfil,
}) => {
  const [copiado, setCopiado] = useState(false);

  // El API avisa así de un perfil que se quedó a medias por límite de tokens.
  const incompleto =
    !!resultado.metricas?.stop_reason &&
    resultado.metricas.stop_reason !== "end_turn";

  const metricas = resumirMetricas(resultado);

  const handleCopiar = async () => {
    if (!(await copiarMarkdown(resultado.perfil))) return;

    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {resultado.personaje}
          </h2>
          {metricas.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {metricas.join(" · ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopiar}
            className="flex items-center gap-2"
          >
            {copiado ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={onNuevoPerfil}
            className="flex items-center gap-2 text-white"
          >
            <Plus className="w-4 h-4" />
            Nuevo perfil
          </Button>
        </div>
      </div>

      {incompleto && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-accent-50 border border-accent-200">
          <AlertTriangle className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-accent-800">
            El agente se detuvo antes de tiempo, así que el perfil pudo quedar
            incompleto. Revísalo antes de usarlo.
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-3xl shadow-sm p-8">
        <MarkdownView content={resultado.perfil} />

        {entradas.length > 0 && (
          <Accordion type="single" collapsible className="mt-8 border-t border-gray-200 pt-2">
            <AccordionItem value="bitacora" className="border-none">
              <AccordionTrigger className="text-sm text-gray-500 hover:text-gray-700">
                Ver las {entradas.length} consultas que hizo el agente
              </AccordionTrigger>
              <AccordionContent>
                <ListaBitacora entradas={entradas} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </div>
  );
};
