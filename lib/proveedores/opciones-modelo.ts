import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { generateText, LanguageModel } from "ai";

import type { ProveedorEnUso } from "@/lib/proveedores/configuracion";
import type { Proveedor } from "@/lib/proveedores/tipos";

/** El tipo de `providerOptions` que aceptan generateText, generateObject y los agentes; `ai` no lo reexporta, así que se deriva de la firma. */
export type ProviderOptions = NonNullable<Parameters<typeof generateText>[0]["providerOptions"]>;

/**
 * Cómo saca JSON `generateObject` con Anthropic. En modo "auto" el SDK sólo
 * usa la salida estructurada nativa (`output_format`) con los modelos que
 * conoce (hasta los 4.5); con cualquier otro —Sonnet 5, Opus 4.8...— cae a
 * una tool "json" forzada con `tool_choice: "tool"`, que esos modelos
 * rechazan con un 400 ("tool_choice: type 'tool' and 'any' are not supported
 * for this model"). Todos los modelos que se ofrecen soportan la nativa.
 */
export const ANTHROPIC_SALIDA_ESTRUCTURADA = { structuredOutputMode: "outputFormat" } as const;

/**
 * Cómo se traduce el esfuerzo configurado en Ajustes a cada proveedor:
 * `reasoningEffort` y `textVerbosity` en OpenAI, `effort` en Anthropic,
 * `thinkingLevel` en Google. Antes sólo el Detector lo aplicaba; ahora todas
 * las herramientas pasan por aquí.
 *
 * `null` en el esfuerzo o la verbosidad significa "por defecto del modelo":
 * la opción no se envía, porque hay modelos que la rechazan con un 400.
 *
 * `xhigh` sólo existe en OpenAI: si llegara para otro proveedor (no debería,
 * la validación lo impide) se recorta a `high` en vez de fallar.
 */
export function opcionesDeProveedor(
  proveedor: Proveedor,
  reasoningEffort: string | null,
  verbosity: string | null,
  extraOpenAI: Record<string, string | number | boolean | null> = {}
): ProviderOptions {
  const sinXhigh = reasoningEffort === "xhigh" ? "high" : reasoningEffort;
  switch (proveedor) {
    case "OPENAI":
      return {
        openai: {
          ...(reasoningEffort !== null ? { reasoningEffort } : {}),
          ...(verbosity !== null ? { textVerbosity: verbosity } : {}),
          store: false,
          ...extraOpenAI,
        },
      };
    case "ANTHROPIC":
      return {
        anthropic: {
          ...(sinXhigh !== null ? { effort: sinXhigh } : {}),
          ...ANTHROPIC_SALIDA_ESTRUCTURADA,
        },
      };
    case "GOOGLE":
      return sinXhigh !== null ? { google: { thinkingConfig: { thinkingLevel: sinXhigh } } } : {};
  }
}

/** El modelo instanciado con la clave de la herramienta, más sus opciones */
export function crearModeloConfigurado(
  config: ProveedorEnUso,
  extraOpenAI: Record<string, string | number | boolean | null> = {}
): { model: LanguageModel; providerOptions: ProviderOptions } {
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
