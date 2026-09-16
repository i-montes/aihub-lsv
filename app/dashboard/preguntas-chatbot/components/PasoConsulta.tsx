"use client";

import { AlertCircle, Check, Database, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Muestra el SQL que el agente ejecutó (o intentó ejecutar) este paso, como
 * una fila discreta dentro de la burbuja que se despliega al hacer clic.
 *
 * La tool nunca lanza (ver lib/preguntas-chatbot/tools.ts): un SQL inválido
 * llega como `output.error`, no como `state: 'output-error'` — por eso el
 * error se lee del output, no del estado.
 */
export function PasoConsulta({
  input,
  state,
  output,
}: {
  input: { sql?: string } | undefined;
  state: string;
  output?: { error?: string; filas?: unknown[] };
}) {
  const terminado = state === "output-available" || state === "output-error";
  const error = output?.error;
  const filas = output?.filas?.length ?? 0;

  return (
    <details
      className={cn(
        "group my-1.5 rounded-lg border text-xs",
        error ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
      )}
    >
      <summary className="flex cursor-pointer select-none items-center gap-2 px-2.5 py-1.5 text-gray-600 [&::-webkit-details-marker]:hidden">
        {!terminado ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-gray-400" />
        ) : error ? (
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
        ) : (
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        )}
        <Database className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="flex-1 truncate">
          {!terminado
            ? "Consultando la base de datos…"
            : error
              ? "La consulta falló"
              : `Consulta a la base de datos · ${filas} ${filas === 1 ? "fila" : "filas"}`}
        </span>
        <span className="text-[11px] text-gray-400 group-open:hidden">ver SQL</span>
        <span className="hidden text-[11px] text-gray-400 group-open:inline">ocultar</span>
      </summary>
      <div className="border-t border-gray-200/70 px-2.5 py-2">
        {input?.sql ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-gray-700">
            {input.sql}
          </pre>
        ) : (
          <p className="text-gray-400">Sin SQL todavía.</p>
        )}
        {error && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-red-700">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="break-words">{error}</span>
          </p>
        )}
      </div>
    </details>
  );
}
