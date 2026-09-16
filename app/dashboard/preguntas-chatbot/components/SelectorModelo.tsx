"use client";

import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MODELS } from "@/lib/utils";

/** Proveedor y modelo tal como los espera /api/preguntas-chatbot */
export interface SeleccionModelo {
  proveedor: string;
  modelo: string;
}

const NOMBRE_PROVEEDOR: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
};

/** Lo que se lee de api_key_table; `models` es jsonb, así que llega sin tipar */
interface FilaClaveApi {
  provider: string | null;
  models: unknown;
}

/** Con qué arranca si la organización lo tiene: el mismo que usaba la herramienta sin selector */
const PREFERIDO: SeleccionModelo = { proveedor: "anthropic", modelo: "claude-sonnet-5" };

function nombreModelo(modelo: string): string {
  return MODELS[modelo as keyof typeof MODELS] ?? modelo;
}

function clave(s: SeleccionModelo) {
  return `${s.proveedor}|${s.modelo}`;
}

/**
 * Selector compacto de proveedor y modelo para la cabecera del chat.
 *
 * Las opciones son los modelos de las claves ACTIVAS de la organización
 * (api_key_table.models), que es lo que el admin llenó en Ajustes. Es el
 * mismo origen que usa el Detector, sin el filtro extra de la tabla `tools`
 * porque esta herramienta no tiene configuración de prompt propia.
 */
export function SelectorModelo({
  valor,
  onChange,
  disabled,
}: {
  valor: SeleccionModelo | null;
  onChange: (seleccion: SeleccionModelo) => void;
  disabled?: boolean;
}) {
  const { profile } = useAuth();
  const [opciones, setOpciones] = useState<SeleccionModelo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!profile?.organizationId) return;
    let cancelado = false;

    (async () => {
      setCargando(true);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("api_key_table")
        .select("provider, models")
        .eq("organizationId", profile.organizationId)
        .eq("status", "ACTIVE");

      if (cancelado) return;
      if (error) {
        console.error("No se pudieron cargar los modelos disponibles:", error);
        setOpciones([]);
        setCargando(false);
        return;
      }

      const lista: SeleccionModelo[] = [];
      for (const fila of (data ?? []) as FilaClaveApi[]) {
        const proveedor = String(fila.provider ?? "").toLowerCase();
        const modelos = fila.models;
        if (!proveedor || !Array.isArray(modelos)) continue;
        for (const modelo of modelos) {
          if (typeof modelo === "string" && modelo) lista.push({ proveedor, modelo });
        }
      }
      setOpciones(lista);
      setCargando(false);

      if (!valor && lista.length > 0) {
        const preferido = lista.find((o) => clave(o) === clave(PREFERIDO));
        const anthropic = lista.find((o) => o.proveedor === "anthropic");
        onChange(preferido ?? anthropic ?? lista[0]);
      }
    })();

    return () => {
      cancelado = true;
    };
    // `valor` y `onChange` a propósito fuera: sólo se recarga si cambia la organización.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.organizationId]);

  const sinOpciones = !cargando && opciones.length === 0;

  return (
    <Select
      value={valor ? clave(valor) : ""}
      onValueChange={(v) => {
        const [proveedor, modelo] = v.split("|");
        if (proveedor && modelo) onChange({ proveedor, modelo });
      }}
      disabled={disabled || cargando || sinOpciones}
    >
      <SelectTrigger
        className="h-10 w-auto min-w-[230px] gap-2 rounded-full border-gray-300 bg-white px-3.5 text-base shadow-none focus:ring-1"
        aria-label="Modelo de IA"
      >
        <Cpu className="h-4 w-4 shrink-0 text-gray-500" />
        <SelectValue
          placeholder={
            cargando
              ? "Cargando modelos…"
              : sinOpciones
                ? "Sin modelos configurados"
                : "Elegir modelo"
          }
        />
      </SelectTrigger>
      <SelectContent align="end">
        {opciones.map((o) => (
          <SelectItem key={clave(o)} value={clave(o)} className="text-base">
            <span className="flex items-center gap-2">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-base font-medium text-gray-600">
                {NOMBRE_PROVEEDOR[o.proveedor] ?? o.proveedor}
              </span>
              <span>{nombreModelo(o.modelo)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
