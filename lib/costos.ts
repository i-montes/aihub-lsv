/**
 * Precios por token de los modelos que usan las herramientas del kit.
 *
 * Ningún proveedor devuelve el costo en dólares en la respuesta del API —
 * verificado contra su documentación oficial: OpenAI, Anthropic y Google sólo
 * devuelven conteos de tokens. Tampoco sirve su API de costos/uso: es agregada
 * por organización y por minuto (a veces con horas de demora en publicarse),
 * no por llamada — no hay forma de aislar ahí el gasto de una generación
 * puntual. La única manera de tener un costo exacto por fila es
 * tokens × precio, con una tabla mantenida a mano.
 *
 * Precios verificados el 2026-09-07 contra:
 *   - OpenAI:    https://developers.openai.com/api/docs/pricing
 *   - Anthropic: https://claude.com/pricing
 *   - Google:    https://ai.google.dev/gemini-api/docs/pricing
 *
 * Cuando un proveedor cambie tarifas, esta es la única función que hay que
 * tocar — el resto del código sólo llama a `calcularCosto`.
 */

export interface UsoParaCosto {
  inputTokens?: number | null;
  /** Tokens de input leídos de caché (más baratos que el input normal) */
  cachedInputTokens?: number | null;
  /**
   * Tokens de input escritos a caché. OJO: en Anthropic esto es MÁS CARO que
   * el input normal (crea la entrada de caché), no más barato — al contrario
   * de la intuición de "cache = descuento".
   */
  cacheWriteTokens?: number | null;
  /**
   * Ya incluye los tokens de razonamiento/thinking: son un desglose de
   * outputTokens, no una cantidad aparte que se sume por separado. Ningún
   * proveedor de los tres cobra el razonamiento a una tarifa distinta del
   * resto del output.
   */
  outputTokens?: number | null;
}

interface TarifaPorToken {
  /** USD por token de input sin cachear */
  input: number;
  /** USD por token de input leído de caché */
  cacheRead: number;
  /**
   * USD por token de input escrito a caché. `null` cuando el proveedor no
   * cobra un extra por escribir caché (OpenAI y el cacheo automático de
   * Google): esos tokens se cobran como input normal.
   */
  cacheWrite: number | null;
  /** USD por token de output (incluye razonamiento/thinking) */
  output: number;
}

/**
 * Tarifa de un modelo. Puede depender del tamaño del prompt (Gemini 3.1 Pro
 * Preview: la tarifa sube si el prompt supera 200k tokens) — por eso es una
 * función del total de input tokens en vez de un objeto fijo.
 */
type TarifaModelo = (inputTokensTotal: number) => TarifaPorToken;

const POR_MILLON = 1_000_000;
/** Atajo: precio publicado en USD por millón de tokens -> USD por token */
const usd = (porMillon: number): number => porMillon / POR_MILLON;

const tarifaFija = (t: TarifaPorToken): TarifaModelo => () => t;

/**
 * Tabla de precios por (proveedor, modelo).
 *
 * La clave es el string exacto que guarda la columna de modelo de cada tabla
 * de analytics (== lo que configura la organización en `api_key_table`). Un
 * modelo que no esté aquí no rompe nada: `calcularCosto` devuelve `null` y la
 * fila queda con el costo en NULL, visible para agregarlo.
 */
const TARIFAS: Record<string, Record<string, TarifaModelo>> = {
  openai: {
    // gpt-5.6-terra: DEFAULT_MODELS.OPENAI en lib/utils.ts.
    // Tarifa escalonada: por encima de 272,000 tokens de input el prompt
    // COMPLETO se cobra a 2x input / 1.5x output — a diferencia de Gemini
    // (que dobla input y output por igual), acá el multiplicador es distinto
    // para cada lado.
    "gpt-5.6-terra": (inputTokensTotal) => {
      const promptLargo = inputTokensTotal > 272_000;
      return {
        input: usd(promptLargo ? 4.0 : 2.0),
        cacheRead: usd(promptLargo ? 0.4 : 0.2),
        // OpenAI no cobra por escribir a caché: es automático y gratis crearla.
        cacheWrite: null,
        output: usd(promptLargo ? 18.0 : 12.0),
      };
    },
    // gpt-4o-mini-2024-07-18: MINI_MODELS.OPENAI, usado en pasos baratos
    "gpt-4o-mini-2024-07-18": tarifaFija({
      input: usd(0.15),
      cacheRead: usd(0.075),
      cacheWrite: null,
      output: usd(0.6),
    }),
  },

  anthropic: {
    // claude-opus-4-8: DEFAULT_MODELS.ANTHROPIC
    "claude-opus-4-8": tarifaFija({
      input: usd(5.0),
      cacheRead: usd(0.5),
      // Cache write (TTL de 5 min, el único que usa esta app): 1.25x el input.
      cacheWrite: usd(6.25),
      output: usd(25.0),
    }),
    // claude-sonnet-5: usado por el agente de lib/preguntas-chatbot
    "claude-sonnet-5": tarifaFija({
      input: usd(2.0),
      cacheRead: usd(0.2),
      // Cache write (TTL de 5 min): 1.25x el input, mismo patrón que Opus 4.8.
      cacheWrite: usd(2.5),
      output: usd(10.0),
    }),
    // claude-haiku-4-5-20251001: MINI_MODELS.ANTHROPIC
    "claude-haiku-4-5-20251001": tarifaFija({
      input: usd(1.0),
      cacheRead: usd(0.1),
      cacheWrite: usd(1.25),
      output: usd(5.0),
    }),
  },

  google: {
    // gemini-3.1-pro-preview: DEFAULT_MODELS.GOOGLE.
    // Tarifa escalonada: sube si el prompt pasa de 200k tokens de input.
    "gemini-3.1-pro-preview": (inputTokensTotal) => {
      const promptLargo = inputTokensTotal > 200_000;
      return {
        input: usd(promptLargo ? 4.0 : 2.0),
        cacheRead: usd(promptLargo ? 0.4 : 0.2),
        // El cacheo automático de Gemini no tiene cargo aparte de escritura.
        cacheWrite: null,
        output: usd(promptLargo ? 18.0 : 12.0),
      };
    },
    // gemini-3-flash-preview: MINI_MODELS.GOOGLE (tarifa de texto/imagen/video;
    // Flash cobra distinto para audio, que este detector no usa)
    "gemini-3-flash-preview": tarifaFija({
      input: usd(0.5),
      cacheRead: usd(0.05),
      cacheWrite: null,
      output: usd(3.0),
    }),
  },
};

/**
 * Calcula el costo en USD de una llamada a partir de sus tokens.
 *
 * Devuelve `null` cuando el modelo no está en `TARIFAS` (por ejemplo, una
 * organización configuró un modelo nuevo que todavía no se agregó aquí) — así
 * el llamador puede dejar la columna de costo en NULL en vez de guardar un
 * cero engañoso.
 */
export function calcularCosto(
  proveedor: string,
  modelo: string,
  uso: UsoParaCosto | null | undefined
): number | null {
  if (!uso) return null;

  const tarifaModelo = TARIFAS[proveedor.toLowerCase()]?.[modelo];
  if (!tarifaModelo) return null;

  const inputTotal = uso.inputTokens ?? 0;
  const tarifa = tarifaModelo(inputTotal);

  const cacheRead = uso.cachedInputTokens ?? 0;
  const cacheWrite = uso.cacheWriteTokens ?? 0;
  // Los tokens de input "normales" son el total menos los que ya se cobraron
  // aparte como lectura o escritura de caché — sin esto se pagarían dos veces.
  const inputNormal = Math.max(0, inputTotal - cacheRead - cacheWrite);
  const output = uso.outputTokens ?? 0;

  const costoCacheWrite =
    tarifa.cacheWrite !== null
      ? cacheWrite * tarifa.cacheWrite
      : cacheWrite * tarifa.input; // sin cargo aparte: se cobra como input normal

  const total =
    inputNormal * tarifa.input +
    cacheRead * tarifa.cacheRead +
    costoCacheWrite +
    output * tarifa.output;

  return Math.round(total * 1e6) / 1e6;
}
