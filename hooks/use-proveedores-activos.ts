"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProveedorActivo } from "@/lib/proveedores/tipos";

/**
 * Proveedores encendidos de una herramienta, en el orden guardado en
 * Ajustes. Reemplaza las lecturas de api_key_table que las páginas hacían
 * desde el navegador: el cliente sólo ve proveedor y modelo.
 */
export function useProveedoresActivos(herramienta: string) {
  const [proveedores, setProveedores] = useState<ProveedorActivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch(`/api/herramientas/${herramienta}/proveedores-activos`, {
        cache: "no-store",
      });
      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setError(datos?.error ?? "No se pudieron cargar los proveedores");
        setProveedores([]);
        return;
      }
      setProveedores(Array.isArray(datos?.proveedores) ? datos.proveedores : []);
    } catch {
      setError("No se pudieron cargar los proveedores");
      setProveedores([]);
    } finally {
      setCargando(false);
    }
  }, [herramienta]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { proveedores, cargando, error, recargar };
}
