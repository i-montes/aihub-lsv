"use client";

import { AlertCircle, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Convierte el error que entrega useChat en un mensaje que se pueda leer.
 *
 * Cuando el servidor responde con status de error, el transporte del AI SDK
 * lanza un Error cuyo `message` es el cuerpo crudo: aquí eso es el JSON
 * `{"error": "..."}` de la ruta, y se saca el texto. Un fallo de red llega
 * como "Failed to fetch", que no le dice nada al periodista.
 */
export function describirError(error: Error): { titulo: string; detalle: string } {
  const crudo = error.message?.trim() ?? "";

  if (crudo.startsWith("{")) {
    try {
      const json = JSON.parse(crudo);
      if (typeof json?.error === "string" && json.error) {
        return { titulo: "No se pudo responder", detalle: json.error };
      }
    } catch {
      // no era JSON; sigue abajo
    }
  }

  if (/failed to fetch|networkerror|load failed/i.test(crudo)) {
    return {
      titulo: "Sin conexión con el servidor",
      detalle: "Revisa tu conexión a internet e intenta de nuevo.",
    };
  }

  if (/abort/i.test(crudo)) {
    return { titulo: "Respuesta cancelada", detalle: "Puedes volver a enviar la pregunta." };
  }

  return {
    titulo: "Algo falló",
    detalle: crudo || "Intenta de nuevo en un momento.",
  };
}

export function AlertaError({
  error,
  onReintentar,
  onCerrar,
  reintentando,
}: {
  error: Error;
  onReintentar?: () => void;
  onCerrar?: () => void;
  reintentando?: boolean;
}) {
  const { titulo, detalle } = describirError(error);

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-900"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-tight">{titulo}</p>
        <p className="mt-0.5 break-words text-[13px] leading-snug text-red-800/90">{detalle}</p>
        {onReintentar && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onReintentar}
            disabled={reintentando}
            className="mt-2 h-7 gap-1.5 border-red-200 bg-white px-2.5 text-xs text-red-800 hover:bg-red-100 hover:text-red-900"
          >
            <RotateCcw className="h-3 w-3" />
            Reintentar
          </Button>
        )}
      </div>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="-mr-1 -mt-1 rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
