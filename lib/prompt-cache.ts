import type { SystemModelMessage } from "ai";

/**
 * Utilidades para activar el caché de prompts en las generaciones del hub.
 *
 * Anthropic NO cachea solo: hay que marcar explícitamente dónde termina el
 * prefijo estable con un "cache breakpoint" (`cache_control: ephemeral`).
 * https://platform.claude.com/docs/es/build-with-claude/prompt-caching
 *
 * OpenAI y Google sí cachean automáticamente los prefijos largos; ahí lo único
 * que se puede hacer es ayudar al enrutamiento (ver `cacheOpenAI`).
 *
 * La regla que manda en los tres casos es la misma: **lo estable primero, lo
 * volátil después**. El caché es un match de prefijo byte a byte, así que un
 * `Date.now()`, un id de request o el texto del usuario metidos arriba del
 * breakpoint invalidan todo lo que venga después.
 */

/** TTL del caché de Anthropic. 5m escribe a 1.25x el input; 1h, a 2x. */
export type TtlCache = "5m" | "1h";

/**
 * Marca un system prompt como prefijo cacheable.
 *
 * Devuelve un `SystemModelMessage` en vez de un string porque el AI SDK sólo
 * admite `providerOptions` en la forma de objeto (`system` y las
 * `instructions` de un agente aceptan ambas).
 *
 * El breakpoint va al final del system, así que cubre las **tools y el system
 * completos** — Anthropic arma el request en orden `tools -> system ->
 * messages`. Lo que cambia en cada petición (el texto a analizar, la pregunta
 * del lector) tiene que ir en `messages`, nunca aquí.
 *
 * `providerOptions.anthropic` lo ignoran OpenAI y Google, así que esto se puede
 * usar en el switch de proveedores sin ramificar.
 *
 * Ojo: el prefijo mínimo cacheable es de 1024 tokens (2048 en Haiku). Con un
 * system más corto la marca no falla, simplemente no cachea nada.
 */
export function systemCacheado(
  contenido: string,
  ttl: TtlCache = "5m"
): SystemModelMessage {
  return {
    role: "system",
    content: contenido,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral", ttl } },
    },
  };
}

/**
 * `providerOptions.openai` para aprovechar el caché automático de OpenAI.
 *
 * OpenAI cachea solo los prefijos de más de 1024 tokens, pero el hit depende de
 * que la petición caiga en la misma máquina. `promptCacheKey` es lo que fuerza
 * ese enrutamiento: peticiones con la misma clave van al mismo caché.
 *
 * Por eso la clave tiene que ser **estable entre peticiones** y describir la
 * herramienta, no la petición: sirve "detector", no el id del usuario ni un
 * hash del texto (eso daría una clave distinta cada vez y mataría el caché).
 */
export function cacheOpenAI(clave: string): { promptCacheKey: string } {
  return { promptCacheKey: `lsv-${clave}` };
}
