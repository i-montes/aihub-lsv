import { calcularCosto } from "@/lib/costos";

/**
 * Suma el consumo de TODAS las llamadas a modelos de una misma generación.
 *
 * Existe porque una generación no siempre es una llamada. El generador de
 * resúmenes, por ejemplo, corre el modelo mini una vez por lote de noticias
 * (más pasadas extra de refuerzo y una selección final) y sólo después corre el
 * modelo principal para escribir el resumen. Hasta ahora la fila de analytics
 * guardaba únicamente el `usage` de esa última llamada, así que el costo que
 * quedaba en la base de datos era sistemáticamente menor que el que factura el
 * proveedor: faltaban todas las llamadas de selección.
 *
 * El costo se calcula llamada por llamada, no sobre los tokens sumados, porque
 * las llamadas de una misma generación pueden ser de modelos distintos (mini y
 * principal tienen tarifas muy distintas) y sumar sus tokens antes de aplicar
 * un precio daría cualquier cosa menos lo que se pagó.
 */

/** El `usage` que devuelven generateText/generateObject del AI SDK */
interface UsageDelSdk {
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  inputTokenDetails?: {
    noCacheTokens?: number | null;
    cacheReadTokens?: number | null;
    cacheWriteTokens?: number | null;
  } | null;
  outputTokenDetails?: { reasoningTokens?: number | null } | null;
}

export interface TotalesDeUso {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  reasoningTokens: number | null;
  cachedInputTokens: number | null;
  cacheWriteTokens: number | null;
  /**
   * Suma de los costos de todas las llamadas. `null` si alguna quedó sin
   * precio: se sigue el mismo criterio que en el resto del código —antes un
   * NULL visible que un total parcial que parece completo.
   */
  costo: number | null;
  /** Cuántas llamadas a modelo entraron en estos totales */
  llamadas: number;
}

export class AcumuladorDeUso {
  private inputTokens = 0;
  private outputTokens = 0;
  private totalTokens = 0;
  private reasoningTokens = 0;
  private cachedInputTokens = 0;
  private cacheWriteTokens = 0;
  private costo = 0;
  private algunaLlamadaSinPrecio = false;
  private llamadas = 0;
  /** Ninguna llamada reportó tokens: distinto de "reportó cero" */
  private hayDatos = false;

  /**
   * Agrega una llamada. Nunca lanza: perder la contabilidad de una llamada no
   * puede tumbar la generación que el periodista está esperando.
   */
  agregar(
    proveedor: string,
    modelo: string,
    usage: UsageDelSdk | null | undefined
  ): void {
    this.llamadas++;
    if (!usage) {
      // Sin `usage` no se sabe cuánto costó: el total deja de ser confiable.
      this.algunaLlamadaSinPrecio = true;
      return;
    }

    this.hayDatos = true;

    const input = usage.inputTokens ?? 0;
    const output = usage.outputTokens ?? 0;
    const cacheRead = usage.inputTokenDetails?.cacheReadTokens ?? 0;
    const cacheWrite = usage.inputTokenDetails?.cacheWriteTokens ?? 0;

    this.inputTokens += input;
    this.outputTokens += output;
    this.totalTokens += usage.totalTokens ?? input + output;
    this.reasoningTokens += usage.outputTokenDetails?.reasoningTokens ?? 0;
    this.cachedInputTokens += cacheRead;
    this.cacheWriteTokens += cacheWrite;

    const costoLlamada = calcularCosto(proveedor, modelo, {
      inputTokens: input,
      inputNoCacheTokens: usage.inputTokenDetails?.noCacheTokens,
      outputTokens: output,
      cachedInputTokens: cacheRead,
      cacheWriteTokens: cacheWrite,
    });

    if (costoLlamada === null) {
      this.algunaLlamadaSinPrecio = true;
    } else {
      this.costo += costoLlamada;
    }
  }

  get totales(): TotalesDeUso {
    if (!this.hayDatos) {
      return {
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
        reasoningTokens: null,
        cachedInputTokens: null,
        cacheWriteTokens: null,
        costo: null,
        llamadas: this.llamadas,
      };
    }

    return {
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      totalTokens: this.totalTokens,
      reasoningTokens: this.reasoningTokens,
      cachedInputTokens: this.cachedInputTokens,
      cacheWriteTokens: this.cacheWriteTokens,
      costo: this.algunaLlamadaSinPrecio
        ? null
        : Math.round(this.costo * 1e6) / 1e6,
      llamadas: this.llamadas,
    };
  }
}

/**
 * Saca el consumo de una generación que falló.
 *
 * Cuando el modelo responde pero su respuesta no encaja en el schema, el AI SDK
 * lanza `NoObjectGeneratedError` — y ahí adentro vienen el `usage` y el
 * `finishReason` de esa llamada. El proveedor ya la facturó: leyó todo el
 * prompt y generó algo. Si el error se deja pasar sin registrar nada, ese gasto
 * desaparece de la base de datos.
 *
 * No es hipotético: el 16 de septiembre de 2026, 20 de los 39 análisis del
 * corrector con claude-opus-4-8 terminaron así, todos en unos 3 segundos (los
 * que salen bien tardan 7,5), sin dejar fila. Anthropic cobró ese día $3,30 y
 * la base de datos sólo podía dar cuenta de $1,92.
 *
 * Devuelve `null` cuando el error no trae consumo: un 429, un 529 o una API key
 * mala nunca llegaron al modelo y no se facturan, así que no hay nada que
 * guardar.
 */
export function usoDeGeneracionFallida(error: unknown): {
  usage: UsageDelSdk;
  finishReason: string | null;
} | null {
  if (!error || typeof error !== "object") return null;

  const usage = (error as { usage?: UsageDelSdk }).usage;
  if (!usage || typeof usage !== "object") return null;

  // Un usage sin ningún token es un error que no llegó al modelo.
  const algoConsumido =
    (usage.inputTokens ?? 0) > 0 || (usage.outputTokens ?? 0) > 0;
  if (!algoConsumido) return null;

  const finishReason = (error as { finishReason?: unknown }).finishReason;
  return {
    usage,
    finishReason: typeof finishReason === "string" ? finishReason : null,
  };
}
