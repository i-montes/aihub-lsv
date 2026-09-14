"use client";

/**
 * Muestra el SQL que el agente ejecutó (o intentó ejecutar) este paso.
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

  return (
    <details className="mt-2 rounded border bg-gray-50 px-3 py-2 text-xs text-gray-600">
      <summary className="cursor-pointer select-none">
        {!terminado
          ? "Consultando la base de datos…"
          : error
            ? "Consulta con error"
            : `Consulta a la base de datos (${output?.filas?.length ?? 0} filas)`}
      </summary>
      {input?.sql && (
        <pre className="mt-2 whitespace-pre-wrap break-words font-mono">{input.sql}</pre>
      )}
      {error && <p className="mt-1 text-red-600">{error}</p>}
    </details>
  );
}
