"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  TIMEOUT_SEGUNDOS,
  type Avance,
  type EntradaBitacora,
  type PerfilError,
  type PerfilResultado,
} from "../constants";
import { leerEventosSse } from "../utils";

export type EstadoPerfil = "inicial" | "generando" | "listo" | "error";

/**
 * Maneja la generación de un perfil contra `/api/perfil`.
 *
 * Dos cosas gobiernan el diseño de este hook:
 *
 * 1. Cada llamada cuesta ~$0.20, así que sólo se dispara desde una acción
 *    explícita del usuario: nunca desde un efecto y nunca reintentando sola.
 * 2. En streaming el HTTP siempre es 200 y los fallos llegan como
 *    `event: error`. Sólo se da por bueno un perfil si llegó `event: fin`.
 */
export function usePerfil() {
  const [estado, setEstado] = useState<EstadoPerfil>("inicial");
  const [nombreEnCurso, setNombreEnCurso] = useState("");
  const [paso, setPaso] = useState(0);
  const [bitacora, setBitacora] = useState<EntradaBitacora[]>([]);
  const [resultado, setResultado] = useState<PerfilResultado | null>(null);
  const [error, setError] = useState<PerfilError | null>(null);
  const [segundos, setSegundos] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  /** Distingue una cancelación del usuario de una caída de la conexión */
  const canceladoRef = useRef(false);

  const generando = estado === "generando";

  // Cronómetro de la espera: es lo único que se mueve solo durante los ~2 min.
  useEffect(() => {
    if (!generando) return;

    const inicio = Date.now();
    setSegundos(0);

    const id = setInterval(() => {
      setSegundos(Math.floor((Date.now() - inicio) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [generando]);

  // Cerrar la pestaña a mitad de camino pierde el perfil y el dinero gastado.
  useEffect(() => {
    if (!generando) return;

    const avisar = (evento: BeforeUnloadEvent) => {
      evento.preventDefault();
      evento.returnValue = "";
    };

    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [generando]);

  // Si el componente se desmonta, se corta la petición en curso.
  useEffect(() => () => abortRef.current?.abort(), []);

  const cancelar = useCallback(() => {
    canceladoRef.current = true;
    abortRef.current?.abort();
  }, []);

  const reiniciar = useCallback(() => {
    setEstado("inicial");
    setNombreEnCurso("");
    setPaso(0);
    setBitacora([]);
    setResultado(null);
    setError(null);
    setSegundos(0);
  }, []);

  const generar = useCallback(
    async (nombre: string) => {
      const limpio = nombre.trim();
      if (!limpio || abortRef.current) return;

      const controller = new AbortController();
      abortRef.current = controller;
      canceladoRef.current = false;

      setEstado("generando");
      setNombreEnCurso(limpio);
      setPaso(0);
      setBitacora([]);
      setResultado(null);
      setError(null);

      // El upstream corta a los 300 s; sin esto la UI se quedaría esperando.
      const timeout = setTimeout(
        () => controller.abort(),
        TIMEOUT_SEGUNDOS * 1000
      );

      /** Sólo `event: fin` cuenta como perfil generado */
      let recibioFin = false;

      try {
        const response = await fetch("/api/perfil", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: limpio }),
          signal: controller.signal,
        });

        if (!response.body) {
          throw new Error("La respuesta del servidor llegó vacía");
        }

        for await (const { evento, datos } of leerEventosSse(response.body)) {
          if (evento === "avance") {
            const avance = datos as Avance;

            if (avance.tipo === "paso") {
              setPaso(avance.paso);
            } else {
              setBitacora((previas) => [...previas, avance]);
            }
            continue;
          }

          if (evento === "fin") {
            recibioFin = true;
            setResultado(datos as PerfilResultado);
            setEstado("listo");
            continue;
          }

          if (evento === "error") {
            recibioFin = true; // el stream terminó, aunque haya sido mal
            setError(datos as PerfilError);
            setEstado("error");
            return;
          }
        }

        if (!recibioFin) {
          setError({
            error:
              "La conexión se cortó antes de terminar el perfil. No se generó nada utilizable.",
          });
          setEstado("error");
        }
      } catch (excepcion) {
        if (canceladoRef.current) {
          reiniciar();
          return;
        }

        const abortado =
          excepcion instanceof DOMException && excepcion.name === "AbortError";

        setError({
          error: abortado
            ? `El perfil superó los ${TIMEOUT_SEGUNDOS} segundos y se detuvo.`
            : excepcion instanceof Error
              ? excepcion.message
              : "No se pudo generar el perfil",
        });
        setEstado("error");
      } finally {
        clearTimeout(timeout);
        abortRef.current = null;
      }
    },
    [reiniciar]
  );

  return {
    estado,
    generando,
    nombreEnCurso,
    paso,
    bitacora,
    resultado,
    error,
    segundos,
    generar,
    cancelar,
    reiniciar,
  };
}
