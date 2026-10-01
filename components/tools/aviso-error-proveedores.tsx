"use client";

import { Button } from "@/components/ui/button";

interface Props {
  error: string;
  onReintentar: () => void;
  className?: string;
}

/**
 * Aviso para cuando la consulta de proveedores de una herramienta falla. No
 * es lo mismo que no tener proveedores: en ese caso va el modal que pide la
 * configuración; aquí sólo se ofrece reintentar.
 */
export function AvisoErrorProveedores({ error, onReintentar, className = "" }: Props) {
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
    >
      <span>No se pudieron cargar los proveedores de la herramienta: {error}</span>
      <Button type="button" variant="outline" size="sm" onClick={onReintentar}>
        Reintentar
      </Button>
    </div>
  );
}
