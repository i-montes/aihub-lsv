"use client";

/** Tres puntos que laten mientras llega la respuesta, sin burbuja ni avatar */
export function IndicadorEscribiendo({ texto }: { texto?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <span className="flex items-center gap-1" aria-label="El agente está respondiendo">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
          />
        ))}
      </span>
      {texto && <span className="text-base text-gray-500">{texto}</span>}
    </div>
  );
}
