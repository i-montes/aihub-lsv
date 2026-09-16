"use client";

import { useEffect, useRef } from "react";
import { SendHorizontal, Square } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Caja de texto del chat: crece con el contenido hasta cuatro líneas, Enter
 * envía y Shift+Enter hace salto de línea. Mientras el agente responde, el
 * botón pasa a "detener".
 */
export function CajaEntrada({
  valor,
  onChange,
  onEnviar,
  onDetener,
  ocupado,
  deshabilitado,
  placeholder = "Escribe tu pregunta…",
}: {
  valor: string;
  onChange: (v: string) => void;
  onEnviar: () => void;
  onDetener?: () => void;
  ocupado: boolean;
  deshabilitado?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Autoajuste de altura: se mide el scrollHeight y se acota a ~4 líneas.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [valor]);

  const puedeEnviar = !ocupado && !deshabilitado && valor.trim().length > 0;

  return (
    <div className="border-t bg-white pt-3">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 transition-colors",
          "focus-within:border-primary-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100",
          deshabilitado && "opacity-60"
        )}
      >
        <textarea
          ref={ref}
          rows={1}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={deshabilitado}
          aria-label="Pregunta para el agente"
          className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm leading-6 text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (puedeEnviar) onEnviar();
            }
          }}
        />
        {ocupado && onDetener ? (
          <button
            type="button"
            onClick={onDetener}
            aria-label="Detener respuesta"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onEnviar}
            disabled={!puedeEnviar}
            aria-label="Enviar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:bg-gray-300"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-gray-400">
        Enter para enviar · Shift + Enter para salto de línea
      </p>
    </div>
  );
}
