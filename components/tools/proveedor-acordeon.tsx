"use client";

import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ESFUERZOS, NOMBRE_PROVEEDOR, VERBOSIDADES } from "@/lib/proveedores/tipos";
import type { ProveedorEnEdicion } from "@/components/tools/tool-config";

interface Props {
  estado: ProveedorEnEdicion;
  esPrimero: boolean;
  esUltimo: boolean;
  esPorDefecto: boolean;
  sugerencias: string[];
  error: string | null;
  onCambiar: (cambios: Partial<ProveedorEnEdicion>) => void;
  onSubir: () => void;
  onBajar: () => void;
  onCambiarClave: () => void;
  onApagar: () => void;
}

/** Un proveedor dentro del diálogo: clave, modelo, esfuerzo y verbosidad */
export function ProveedorAcordeon({
  estado,
  esPrimero,
  esUltimo,
  esPorDefecto,
  sugerencias,
  error,
  onCambiar,
  onSubir,
  onBajar,
  onCambiarClave,
  onApagar,
}: Props) {
  const nombre = NOMBRE_PROVEEDOR[estado.proveedor];
  const tieneClave = estado.claveNueva.trim() !== "" || estado.claveEnmascarada !== null;
  const mostrarSelector = estado.modelosDisponibles !== null && estado.modelosDisponibles.length > 0;

  return (
    <AccordionItem value={estado.proveedor} className="rounded-md border px-3">
      <div className="flex items-center gap-2">
        <AccordionTrigger className="flex-1 py-3 hover:no-underline">
          <div className="flex items-center gap-2 text-left">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${estado.encendido ? "bg-green-500" : "bg-gray-300"}`}
              aria-label={estado.encendido ? "Encendido" : "Apagado"}
            />
            <span className="font-medium">{nombre}</span>
            {estado.encendido && estado.modelo && (
              <span className="text-xs text-gray-500">{estado.modelo}</span>
            )}
            {esPorDefecto && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Por defecto</span>
            )}
          </div>
        </AccordionTrigger>
        <div className="flex flex-col">
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={esPrimero} onClick={onSubir} title="Subir">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={esUltimo} onClick={onBajar} title="Bajar">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AccordionContent className="space-y-3 pb-4">
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        <div>
          <Label className="mb-1 block text-xs text-gray-600">Clave de API</Label>
          {estado.claveEnmascarada !== null && estado.claveNueva === "" && !estado.reemplazandoClave ? (
            <div className="flex items-center gap-2">
              <Input value={estado.claveEnmascarada} readOnly className="h-8 font-mono text-xs" />
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={onCambiarClave}>
                Cambiar
              </Button>
            </div>
          ) : (
            <Input
              type="password"
              autoComplete="off"
              placeholder={`Pega la clave de ${nombre}`}
              value={estado.claveNueva}
              onChange={(e) => onCambiar({ claveNueva: e.target.value })}
              className="h-8 font-mono text-xs"
            />
          )}
          <p className="mt-1 text-xs text-gray-400">La clave enciende el proveedor. Cada herramienta lleva una clave distinta.</p>
        </div>

        {tieneClave && (
          <>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Label className="text-xs text-gray-600">Modelo</Label>
                {estado.cargandoModelos && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
              </div>

              {sugerencias.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {sugerencias.map((modelo) => (
                    <button
                      key={modelo}
                      type="button"
                      onClick={() => onCambiar({ modelo })}
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        estado.modelo === modelo ? "border-blue-300 bg-blue-50 text-blue-800" : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      title="Modelo usado en otra herramienta"
                    >
                      {modelo}
                    </button>
                  ))}
                </div>
              )}

              {mostrarSelector ? (
                <Select value={estado.modelo} onValueChange={(modelo) => onCambiar({ modelo })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Elige un modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set([estado.modelo, ...estado.modelosDisponibles!].filter(Boolean))].map((modelo) => (
                      <SelectItem key={modelo} value={modelo}>
                        {modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Escribe el nombre del modelo"
                  value={estado.modelo}
                  onChange={(e) => onCambiar({ modelo: e.target.value })}
                  className="h-8 text-xs"
                />
              )}
              {estado.errorModelos && (
                <p className="mt-1 text-xs text-amber-700">
                  No se pudo consultar la lista: {estado.errorModelos}. Escribe el modelo a mano.
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 block text-xs text-gray-600">Esfuerzo de razonamiento</Label>
              <Select value={estado.reasoningEffort} onValueChange={(reasoningEffort) => onCambiar({ reasoningEffort })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESFUERZOS[estado.proveedor].map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {estado.proveedor === "OPENAI" && (
              <div>
                <Label className="mb-1 block text-xs text-gray-600">Verbosidad</Label>
                <Select value={estado.verbosity} onValueChange={(verbosity) => onCambiar({ verbosity })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VERBOSIDADES.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-0.5 text-xs text-gray-400">Longitud y detalle de la respuesta.</p>
              </div>
            )}

            {estado.encendido && (
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700" onClick={onApagar}>
                  Apagar {nombre}
                </Button>
              </div>
            )}
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
