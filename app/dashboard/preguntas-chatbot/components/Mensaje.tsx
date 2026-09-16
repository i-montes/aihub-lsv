"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const formatoHora = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Un turno del chat.
 *
 * La pregunta del usuario es corta, así que va en una burbuja azul a la
 * derecha. La respuesta del agente es larga —trae análisis, tablas y
 * gráficas— así que NO va en burbuja: ocupa todo el ancho de la columna de
 * lectura, como un texto corrido. Esa asimetría es la que diferencia quién
 * habla, sin necesidad de avatares ni etiquetas.
 */
export function Mensaje({
  autor,
  hora,
  children,
}: {
  autor: "usuario" | "agente";
  hora?: Date;
  children: ReactNode;
}) {
  if (autor === "usuario") {
    return (
      <div className="flex flex-col items-end gap-1 pl-10">
        <div className="min-w-0 max-w-full rounded-2xl rounded-br-md bg-primary-600 px-3.5 py-2 text-sm text-white shadow-sm">
          {children}
        </div>
        {hora && <Hora valor={hora} className="pr-1" />}
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="min-w-0 text-sm text-gray-800">{children}</div>
      {hora && <Hora valor={hora} />}
    </div>
  );
}

function Hora({ valor, className }: { valor: Date; className?: string }) {
  return (
    <span className={cn("text-[11px] text-gray-400", className)}>
      {formatoHora.format(valor)}
    </span>
  );
}
