import type { LanguageModel } from "ai";

import { calcularCosto } from "@/lib/costos";
import type { PestanaPrompt } from "@/lib/en-vivo/prompt-base";
import type { UsoModelo } from "@/lib/en-vivo/tipos";
import { leerPromptDeOrganizacionCompleto } from "@/lib/organizaciones/prompt-herramienta";
import {
  listarProveedoresActivos,
  obtenerProveedorDeHerramienta,
  type ProveedorEnUso,
} from "@/lib/proveedores/configuracion";
import { crearModeloConfigurado, type ProviderOptions } from "@/lib/proveedores/opciones-modelo";
import { normalizarProveedor } from "@/lib/proveedores/tipos";
import { getSupabaseRouteHandler } from "@/lib/supabase/server";

/** Todo lo que una llamada al modelo necesita, más un acumulador de uso para el costo. */
export type ContextoModelo = {
  configuracion: ProveedorEnUso;
  model: LanguageModel;
  providerOptions: ProviderOptions;
  pestanas: PestanaPrompt[];
  usos: UsoModelo[];
  /** Agrega el uso de una llamada del AI SDK. */
  registrar: (uso: unknown) => void;
};

export class SinProveedorError extends Error {}

/**
 * El modelo de En Vivo: el proveedor pedido si está encendido, si no el primero del orden de
 * Ajustes > Herramientas. Con él vienen las pestañas de prompt de la organización.
 */
export async function contextoModelo(organizationId: string, proveedorPedido?: unknown): Promise<ContextoModelo> {
  const activos = await listarProveedoresActivos(organizationId, "en-vivo");
  if (activos.length === 0) {
    throw new SinProveedorError("Post redes no tiene ningún proveedor configurado. Configúralo en Ajustes > Herramientas.");
  }
  const pedido = normalizarProveedor(proveedorPedido);
  const proveedor = pedido && activos.some((a) => a.proveedor === pedido) ? pedido : activos[0].proveedor;

  const configuracion = await obtenerProveedorDeHerramienta(organizationId, "en-vivo", proveedor);
  const { model, providerOptions } = crearModeloConfigurado(configuracion);
  const pestanas = await leerPromptDeOrganizacionCompleto(await getSupabaseRouteHandler(), organizationId, "en-vivo");

  const usos: UsoModelo[] = [];
  const registrar = (uso: unknown) => {
    const u = uso as {
      inputTokens?: number;
      outputTokens?: number;
      outputTokenDetails?: { reasoningTokens?: number };
      inputTokenDetails?: { cacheReadTokens?: number; cacheWriteTokens?: number };
    } | undefined;
    if (!u) return;
    usos.push({
      inputTokens: u.inputTokens,
      outputTokens: u.outputTokens,
      reasoningTokens: u.outputTokenDetails?.reasoningTokens,
      cachedInputTokens: u.inputTokenDetails?.cacheReadTokens,
      cacheWriteTokens: u.inputTokenDetails?.cacheWriteTokens,
    });
  };

  return { configuracion, model, providerOptions, pestanas, usos, registrar };
}

/** Suma de tokens y costo de todas las llamadas. `costo` es null si el modelo no está en la tabla. */
export function totalUso(ctx: ContextoModelo) {
  const suma = (k: keyof UsoModelo) => ctx.usos.reduce((t, u) => t + (u[k] ?? 0), 0);
  const total = {
    inputTokens: suma("inputTokens"),
    outputTokens: suma("outputTokens"),
    reasoningTokens: suma("reasoningTokens"),
    cachedInputTokens: suma("cachedInputTokens"),
    cacheWriteTokens: suma("cacheWriteTokens"),
  };
  const costo = calcularCosto(ctx.configuracion.proveedor, ctx.configuracion.modelo, total);
  return { ...total, costo, modelo: ctx.configuracion.modelo };
}
