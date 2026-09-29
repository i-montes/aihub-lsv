import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

import type { ProveedorEnUso } from "@/lib/proveedores/configuracion";
import { VERBOSIDAD_POR_DEFECTO, type Proveedor } from "@/lib/proveedores/tipos";

/**
 * Cómo se traduce el esfuerzo configurado en Ajustes a cada proveedor:
 * `reasoningEffort` y `textVerbosity` en OpenAI, `effort` en Anthropic,
 * `thinkingLevel` en Google. Antes sólo el Detector lo aplicaba; ahora todas
 * las herramientas pasan por aquí.
 *
 * `xhigh` sólo existe en OpenAI: si llegara para otro proveedor (no debería,
 * la validación lo impide) se recorta a `high` en vez de fallar.
 */
export function opcionesDeProveedor(
  proveedor: Proveedor,
  reasoningEffort: string,
  verbosity: string | null,
  extraOpenAI: Record<string, unknown> = {}
): Record<string, Record<string, unknown>> {
  const sinXhigh = reasoningEffort === "xhigh" ? "high" : reasoningEffort;
  switch (proveedor) {
    case "OPENAI":
      return {
        openai: {
          reasoningEffort,
          textVerbosity: verbosity ?? VERBOSIDAD_POR_DEFECTO,
          store: false,
          ...extraOpenAI,
        },
      };
    case "ANTHROPIC":
      return { anthropic: { effort: sinXhigh } };
    case "GOOGLE":
      return { google: { thinkingConfig: { thinkingLevel: sinXhigh } } };
  }
}

/** El modelo instanciado con la clave de la herramienta, más sus opciones */
export function crearModeloConfigurado(
  config: ProveedorEnUso,
  extraOpenAI: Record<string, unknown> = {}
): { model: LanguageModel; providerOptions: Record<string, Record<string, unknown>> } {
  const providerOptions = opcionesDeProveedor(config.proveedor, config.reasoningEffort, config.verbosity, extraOpenAI);
  switch (config.proveedor) {
    case "OPENAI":
      return { model: createOpenAI({ apiKey: config.apiKey })(config.modelo), providerOptions };
    case "ANTHROPIC":
      return { model: createAnthropic({ apiKey: config.apiKey })(config.modelo), providerOptions };
    case "GOOGLE":
      return { model: createGoogleGenerativeAI({ apiKey: config.apiKey })(config.modelo), providerOptions };
  }
}
