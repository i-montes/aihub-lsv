"use client";

import { useEffect, useRef } from "react";
import { SendHorizontal, Square } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Caja de texto del chat: crece con el contenido hasta cuatro líneas, Enter
 * envía y Shift+Enter hace salto de línea.
 *
 * Se ve como un campo de texto de verdad —fondo blanco, borde marcado y
 * altura holgada— porque antes era una banda gris plana que no invitaba a
 * escribir. Y toma el foco sola: al entrar a la herramienta, al terminar de
 * cargar los modelos y en cuanto el agente termina de responder, para poder
 * seguir preguntando sin tocar el ratón.
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
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [valor]);

  // Foco automático cuando el campo está disponible: al montar, al habilitarse
  // y al liberarse tras una respuesta.
  useEffect(() => {
    if (!deshabilitado && !ocupado) ref.current?.focus();
  }, [deshabilitado, ocupado]);

  const puedeEnviar = !ocupado && !deshabilitado && valor.trim().length > 0;

  return (
    <div className="bg-transparent pt-3">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border-2 border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors",
          "focus-within:border-primary-500 focus-within:shadow-md",
          deshabilitado && "border-gray-200 bg-gray-50 opacity-70"
        )}
      >
        <textarea
          ref={ref}
          rows={1}
          autoFocus
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={deshabilitado}
          aria-label="Pregunta para el agente"
          className="max-h-[132px] min-h-[28px] flex-1 resize-none bg-transparent text-base leading-7 text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed"
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition-colors hover:bg-gray-700"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onEnviar}
            disabled={!puedeEnviar}
            aria-label="Enviar pregunta"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:bg-gray-300"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>
      {/* A 16px la pista ocupa dos líneas en móvil y estorba; allí basta el
          botón de enviar, que está a la vista. */}
      <p className="mt-2 hidden px-1 text-base text-gray-500 sm:block">
        Enter para enviar · Shift + Enter para salto de línea
      </p>
    </div>
  );
}
