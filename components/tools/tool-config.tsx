"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { Accordion } from "@/components/ui/accordion";
import { ProveedorAcordeon } from "@/components/tools/proveedor-acordeon";
import {
  ESFUERZO_POR_DEFECTO,
  NOMBRE_PROVEEDOR,
  PROVEEDORES,
  VERBOSIDAD_POR_DEFECTO,
  type Proveedor,
  type ProveedorConfigurado,
} from "@/lib/proveedores/tipos";

/** Un proveedor mientras se edita en el diálogo */
export interface ProveedorEnEdicion {
  proveedor: Proveedor;
  /** Tiene clave guardada o una nueva escrita */
  encendido: boolean;
  /** Clave guardada, enmascarada. `null` si no hay. */
  claveEnmascarada: string | null;
  /** Clave escrita ahora. Vacía si se conserva la guardada. */
  claveNueva: string;
  /** El usuario pulsó "Cambiar" y quiere escribir otra clave */
  reemplazandoClave: boolean;
  modelo: string;
  reasoningEffort: string;
  verbosity: string;
  /** Lista del proveedor. `null` mientras no se ha consultado o si falló. */
  modelosDisponibles: string[] | null;
  cargandoModelos: boolean;
  errorModelos: string | null;
}

interface ToolConfigProps {
  herramienta: string;
  proveedores: ProveedorEnEdicion[];
  /**
   * Setter de React, no un callback con el valor cerrado: las actualizaciones
   * de aquí siempre son funcionales (`prev => ...`) para no pisar una clave
   * recién escrita con el estado que existía cuando arrancó una consulta
   * asíncrona (ver Tarea 8, corrección de la clave que se perdía).
   */
  onProveedoresChange: Dispatch<SetStateAction<ProveedorEnEdicion[]>>;
  sugerencias: Record<Proveedor, string[]>;
  /** Error del guardado, para mostrarlo en el acordeón del proveedor */
  errorGuardado: { mensaje: string; proveedor?: Proveedor } | null;
}

export function proveedorVacio(proveedor: Proveedor): ProveedorEnEdicion {
  return {
    proveedor,
    encendido: false,
    claveEnmascarada: null,
    claveNueva: "",
    reemplazandoClave: false,
    modelo: "",
    reasoningEffort: ESFUERZO_POR_DEFECTO,
    verbosity: VERBOSIDAD_POR_DEFECTO,
    modelosDisponibles: null,
    cargandoModelos: false,
    errorModelos: null,
  };
}

/** Los guardados en su orden, y después los que faltan, apagados */
export function proveedoresDesdeConfiguracion(configurados: ProveedorConfigurado[]): ProveedorEnEdicion[] {
  const guardados = configurados.map((c) => ({
    ...proveedorVacio(c.proveedor),
    encendido: true,
    claveEnmascarada: c.claveEnmascarada,
    modelo: c.modelo,
    reasoningEffort: c.reasoningEffort,
    verbosity: c.verbosity ?? VERBOSIDAD_POR_DEFECTO,
  }));
  const faltantes = PROVEEDORES.filter((p) => !configurados.some((c) => c.proveedor === p)).map(proveedorVacio);
  return [...guardados, ...faltantes];
}

/**
 * Los proveedores de la herramienta: un acordeón por cada uno, en el orden
 * que se guarda. La clave enciende el proveedor; al escribirla se consulta
 * la lista de modelos con un retardo corto.
 */
export function ToolConfig({ herramienta, proveedores, onProveedoresChange, sugerencias, errorGuardado }: ToolConfigProps) {
  const [abierto, setAbierto] = useState<string | undefined>(undefined);
  const temporizadores = useRef<Partial<Record<Proveedor, ReturnType<typeof setTimeout>>>>({});
  // Cuenta las consultas de modelos por proveedor: si llega una respuesta de
  // una consulta vieja (el usuario ya escribió otra clave o cambió de
  // herramienta), su id ya no coincide y se descarta.
  const peticiones = useRef<Partial<Record<Proveedor, number>>>({});
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    const temporizadoresAlDesmontar = temporizadores.current;
    return () => {
      montado.current = false;
      Object.values(temporizadoresAlDesmontar).forEach((t) => t && clearTimeout(t));
    };
  }, []);

  // Siempre funcional: nunca se pisa el estado con el `proveedores` que
  // tenía cerrado un timeout o una promesa vieja.
  const actualizar = (proveedor: Proveedor, cambios: Partial<ProveedorEnEdicion>) => {
    onProveedoresChange((prev) => prev.map((p) => (p.proveedor === proveedor ? { ...p, ...cambios } : p)));
  };

  const consultarModelos = async (proveedor: Proveedor, claveNueva: string) => {
    const idPeticion = (peticiones.current[proveedor] ?? 0) + 1;
    peticiones.current[proveedor] = idPeticion;
    actualizar(proveedor, { cargandoModelos: true, errorModelos: null });
    const esVigente = () => montado.current && peticiones.current[proveedor] === idPeticion;
    try {
      const respuesta = await fetch("/api/herramientas/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claveNueva ? { proveedor, apiKey: claveNueva } : { proveedor, herramienta }),
      });
      const datos = await respuesta.json().catch(() => null);
      if (!esVigente()) return;
      if (!respuesta.ok) {
        actualizar(proveedor, { cargandoModelos: false, modelosDisponibles: null, errorModelos: datos?.error ?? "sin respuesta" });
        return;
      }
      actualizar(proveedor, { cargandoModelos: false, modelosDisponibles: datos?.modelos ?? [], errorModelos: null });
    } catch {
      if (!esVigente()) return;
      actualizar(proveedor, { cargandoModelos: false, modelosDisponibles: null, errorModelos: "sin conexión" });
    }
  };

  // Al abrir un proveedor con clave guardada, consultar su lista una vez.
  useEffect(() => {
    if (!abierto) return;
    const estado = proveedores.find((p) => p.proveedor === abierto);
    if (estado && estado.claveEnmascarada && !estado.claveNueva && estado.modelosDisponibles === null && !estado.cargandoModelos && !estado.errorModelos) {
      consultarModelos(estado.proveedor, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  const cambiarClave = (proveedor: Proveedor, claveNueva: string) => {
    onProveedoresChange((prev) =>
      prev.map((p) =>
        p.proveedor === proveedor
          ? {
              ...p,
              claveNueva,
              encendido: claveNueva.trim() !== "" || p.claveEnmascarada !== null,
              modelosDisponibles: null,
              errorModelos: null,
            }
          : p
      )
    );
    const anterior = temporizadores.current[proveedor];
    if (anterior) clearTimeout(anterior);
    if (claveNueva.trim().length < 8) return;
    temporizadores.current[proveedor] = setTimeout(() => consultarModelos(proveedor, claveNueva.trim()), 600);
  };

  const mover = (indice: number, direccion: -1 | 1) => {
    onProveedoresChange((prev) => {
      const destino = indice + direccion;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  };

  const apagar = (proveedor: Proveedor) => {
    if (!window.confirm(`¿Apagar ${NOMBRE_PROVEEDOR[proveedor]} en esta herramienta? Se borrará su clave al guardar.`)) return;
    onProveedoresChange((prev) => prev.map((p) => (p.proveedor === proveedor ? proveedorVacio(proveedor) : p)));
  };

  const primeroEncendido = proveedores.find((p) => p.encendido)?.proveedor;
  const hayEncendidos = primeroEncendido !== undefined;

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Proveedores</label>
        <p className="text-xs text-gray-500">
          El primero encendido es el que corre por defecto. Usa las flechas para ordenarlos.
        </p>
      </div>

      {!hayEncendidos && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Enciende al menos un proveedor con su clave y un modelo.
        </p>
      )}
      {errorGuardado && !errorGuardado.proveedor && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{errorGuardado.mensaje}</p>
      )}

      <Accordion type="single" collapsible value={abierto} onValueChange={setAbierto} className="space-y-2">
        {proveedores.map((estado, indice) => (
          <ProveedorAcordeon
            key={estado.proveedor}
            estado={estado}
            esPrimero={indice === 0}
            esUltimo={indice === proveedores.length - 1}
            esPorDefecto={estado.proveedor === primeroEncendido}
            sugerencias={sugerencias[estado.proveedor] ?? []}
            error={errorGuardado?.proveedor === estado.proveedor ? errorGuardado.mensaje : null}
            onCambiar={(cambios) => {
              if (cambios.claveNueva !== undefined) cambiarClave(estado.proveedor, cambios.claveNueva);
              else actualizar(estado.proveedor, cambios);
            }}
            onSubir={() => mover(indice, -1)}
            onBajar={() => mover(indice, 1)}
            onCambiarClave={() => actualizar(estado.proveedor, { reemplazandoClave: true, modelosDisponibles: null, errorModelos: null })}
            onApagar={() => apagar(estado.proveedor)}
          />
        ))}
      </Accordion>
    </div>
  );
}
