"use client";

import { useCallback, useRef, useState } from "react";

import type { NombreResultado } from "../constants";

export type EstadoVerificacion = "inicial" | "verificando" | "resuelto";

/**
 * Resuelve el nombre que escribió el usuario contra el archivo, antes de gastar
 * una generación completa.
 *
 * La llamada cuesta ~$0,003 y tarda 3–10 s, así que se puede repetir sin
 * pensarlo: lo caro es el paso siguiente. Los fallos se guardan aparte del
 * resultado porque se muestran en el mismo buscador —son corregibles ahí
 * mismo— y no en la pantalla de error del generador.
 */
export function useVerificacionNombre() {
  const [estado, setEstado] = useState<EstadoVerificacion>("inicial");
  /** Lo último que tecleó el usuario. Sobrevive a `reiniciar` para que
   *  corregir un nombre sea editarlo, no volver a escribirlo. */
  const [consulta, setConsulta] = useState("");
  const [resultado, setResultado] = useState<NombreResultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const reiniciar = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setEstado("inicial");
    setResultado(null);
    setError(null);
  }, []);

  const verificar = useCallback(async (nombre: string) => {
    const limpio = nombre.trim();
    if (!limpio) return;

    // Un doble envío deja la petición vieja compitiendo con la nueva.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setEstado("verificando");
    setConsulta(limpio);
    setResultado(null);
    setError(null);

    try {
      const response = await fetch("/api/nombre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: limpio }),
        signal: controller.signal,
      });

      const datos = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          typeof datos?.error === "string"
            ? datos.error
            : "No se pudo verificar el nombre"
        );
        setEstado("inicial");
        return;
      }

      setResultado(datos as NombreResultado);
      setEstado("resuelto");
    } catch (excepcion) {
      // Abortar es siempre decisión nuestra: no hay error que mostrar.
      if (excepcion instanceof DOMException && excepcion.name === "AbortError") {
        return;
      }

      setError(
        excepcion instanceof Error
          ? excepcion.message
          : "No se pudo verificar el nombre"
      );
      setEstado("inicial");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  return {
    estado,
    consulta,
    verificando: estado === "verificando",
    resultado,
    error,
    verificar,
    reiniciar,
  };
}
