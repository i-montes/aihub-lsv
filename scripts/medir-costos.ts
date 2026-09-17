/**
 * Banco de medición de costos, llamada por llamada.
 *
 * Reproduce exactamente la llamada que hace cada herramienta —mismo modelo,
 * mismos prompts de la organización, mismos parámetros, mismo SDK— contra unas
 * API keys dedicadas que no usa nadie más. Así el total que imprime este script
 * se puede comparar contra la consola del proveedor sin ruido de por medio:
 * si cuadran, la contabilidad del hub está bien; si no, la diferencia es
 * medible y no hay que deducirla de promedios.
 *
 * Lo que de verdad se quiere resolver acá: cuánto cobra el proveedor por una
 * generación que FALLA. El AI SDK lanza `NoObjectGeneratedError` cuando la
 * respuesta no encaja en el schema, y ese error trae el `usage` de la llamada.
 * Si trae tokens, el proveedor cobró: eso es lo que explicaría por qué la suma
 * de la base de datos queda por debajo de la factura.
 *
 * Uso (las llaves NUNCA van en el código ni en el repo):
 *   OPENAI_API_KEY=... ANTHROPIC_API_KEY=... \
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... \
 *   npx tsx scripts/medir-costos.ts [corrector|hilos|resumen|detector|todo]
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { calcularCosto } from "../lib/costos";

const ORG = process.env.ORG_ID!; // uuid de la organización cuyos prompts se van a usar
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY!;

const MAX_OUTPUT_TOKENS = 16000; // igual que actions/analyze-text.ts

interface Medicion {
  herramienta: string;
  proveedor: string;
  modelo: string;
  resultado: "completado" | "fallido";
  inputTokens: number | null;
  noCacheTokens: number | null;
  cacheReadTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  finishReason: string | null;
  costo: number | null;
  ms: number;
  detalle?: string;
}

const mediciones: Medicion[] = [];

async function supabase(tabla: string, query: string): Promise<any[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`${tabla}: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Prompts de la organización, los mismos que usa producción */
async function prompts(identity: string): Promise<Record<string, string>> {
  const [tool] = await supabase(
    "tools",
    `select=prompts&organization_id=eq.${ORG}&identity=eq.${identity}`
  );
  if (!tool) throw new Error(`Sin configuración para ${identity}`);
  return Object.fromEntries(
    (tool.prompts ?? []).map((p: any) => [p.title, p.content])
  );
}

function modeloDe(proveedor: string, modelo: string) {
  if (proveedor === "openai") {
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })(modelo);
  }
  return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })(modelo);
}

/**
 * Corre una llamada y la anota, salga bien o mal. El caso interesante es el
 * malo: se saca el `usage` del error para ver si el proveedor la facturó.
 */
async function medir(
  herramienta: string,
  proveedor: string,
  modelo: string,
  llamada: () => Promise<{ usage?: any; finishReason?: string }>,
  detalle?: string
): Promise<void> {
  const inicio = Date.now();
  let usage: any = null;
  let finishReason: string | null = null;
  let resultado: "completado" | "fallido" = "completado";
  let nota = detalle;

  try {
    const r = await llamada();
    usage = r.usage;
    finishReason = r.finishReason ?? null;
  } catch (error) {
    resultado = "fallido";
    if (NoObjectGeneratedError.isInstance(error)) {
      usage = error.usage;
      finishReason = error.finishReason ?? null;
      nota = `${detalle ?? ""} NoObjectGeneratedError: ${error.message}`.trim();
    } else {
      nota = `${detalle ?? ""} ${
        error instanceof Error ? error.message : String(error)
      }`.trim();
    }
  }

  const det = usage?.inputTokenDetails ?? {};
  const medicion: Medicion = {
    herramienta,
    proveedor,
    modelo,
    resultado,
    inputTokens: usage?.inputTokens ?? null,
    noCacheTokens: det.noCacheTokens ?? null,
    cacheReadTokens: det.cacheReadTokens ?? null,
    outputTokens: usage?.outputTokens ?? null,
    reasoningTokens: usage?.outputTokenDetails?.reasoningTokens ?? null,
    finishReason,
    costo: usage
      ? calcularCosto(proveedor, modelo, {
          inputTokens: usage.inputTokens,
          inputNoCacheTokens: det.noCacheTokens,
          outputTokens: usage.outputTokens,
          cachedInputTokens: det.cacheReadTokens,
          cacheWriteTokens: det.cacheWriteTokens,
        })
      : null,
    ms: Date.now() - inicio,
    detalle: nota?.slice(0, 200),
  };
  mediciones.push(medicion);

  const estado = resultado === "completado" ? "OK    " : "FALLÓ ";
  console.log(
    `  ${estado} ${herramienta} · ${modelo}  ` +
      `in=${medicion.inputTokens ?? "—"} out=${medicion.outputTokens ?? "—"} ` +
      `razonamiento=${medicion.reasoningTokens ?? "—"} ` +
      `fin=${finishReason ?? "—"} ` +
      `costo=${medicion.costo === null ? "—" : "$" + medicion.costo.toFixed(6)} ` +
      `(${(medicion.ms / 1000).toFixed(1)}s)`
  );
  if (medicion.detalle) console.log(`         ${medicion.detalle}`);
}

// ── Corrector de textos ─────────────────────────────────────────────────────
const SchemaCorrector = z.object({
  correcciones: z.array(
    z.object({
      original: z.string().describe("Fragmento del texto original con error"),
      suggestion: z.string().describe("Corrección sugerida para el error"),
      type: z
        .enum(["spelling", "grammar", "style", "punctuation"])
        .describe("Tipo de error: spelling | grammar | style | punctuation"),
      explanation: z.string().describe("Explicación de la corrección"),
    })
  ),
});

async function corrector(texto: string, etiqueta: string) {
  const p = await prompts("proofreader");
  const combinedPrompt = `
${p["Principal"]}

GUÍA DE ESTILO:
${p["Guia de estilo"]}

TEXTO A ANALIZAR:
${texto}

FORMATO DE RESPUESTA:
Debes responder con un objeto JSON que contenga un array de correcciones con el siguiente formato:
{
  "correcciones": [
    {
      "original": "fragmento con error",
      "suggestion": "corrección sugerida",
      "type": "spelling|grammar|style|punctuation",
      "explanation": "explicación de la corrección"
    },
    ...
  ]
}
`;

  await medir("corrector", "openai", "gpt-5.6-terra", () =>
    generateObject({
      model: modeloDe("openai", "gpt-5.6-terra"),
      schema: SchemaCorrector,
      prompt: combinedPrompt,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      providerOptions: {
        openai: { reasoningEffort: "medium", textVerbosity: "medium", store: false },
      },
    }), etiqueta);

  await medir("corrector", "anthropic", "claude-opus-4-8", () =>
    generateObject({
      model: modeloDe("anthropic", "claude-opus-4-8"),
      schema: SchemaCorrector,
      prompt: combinedPrompt,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    }), etiqueta);
}

// ── Generador de hilos ──────────────────────────────────────────────────────
const SchemaHilos = z.object({
  threads: z.array(z.string().describe("Contenido del hilo")),
});

async function hilos(texto: string) {
  const p = await prompts("threads_generator");
  const combinado = `${p["Principal"]}\n\n${p["Tesis"] ?? ""}\n\nTEXTO:\n${texto}`;

  for (const [proveedor, modelo] of [
    ["openai", "gpt-5.6-terra"],
    ["anthropic", "claude-opus-4-8"],
  ] as const) {
    await medir("hilos", proveedor, modelo, () =>
      generateObject({
        model: modeloDe(proveedor, modelo),
        schema: SchemaHilos,
        prompt: combinado,
      }));
  }
}

// ── Detector de mentiras ────────────────────────────────────────────────────
async function detector(texto: string) {
  const p = await prompts("detector");
  for (const [proveedor, modelo] of [
    ["openai", "gpt-5.6-terra"],
    ["anthropic", "claude-opus-4-8"],
  ] as const) {
    await medir("detector", proveedor, modelo, () =>
      generateText({
        model: modeloDe(proveedor, modelo),
        system: p["Principal"],
        messages: [{ role: "user", content: texto }],
        providerOptions:
          proveedor === "openai"
            ? { openai: { reasoningEffort: "high", textVerbosity: "high", store: false } }
            : { anthropic: { effort: "high" } },
      }));
  }
}

// ── Resúmenes: selección con el modelo mini + redacción con el principal ────
async function resumen(articulos: string) {
  const p = await prompts("resume");
  const SchemaSeleccion = z.object({
    selected: z.array(
      z.object({ link: z.string(), title: z.string(), reason: z.string() })
    ),
  });

  for (const [proveedor, mini, principal] of [
    ["openai", "gpt-4o-mini-2024-07-18", "gpt-5.6-terra"],
    ["anthropic", "claude-haiku-4-5-20251001", "claude-opus-4-8"],
  ] as const) {
    await medir("resumen (selección, modelo mini)", proveedor, mini, () =>
      generateObject({
        model: modeloDe(proveedor, mini),
        schema: SchemaSeleccion,
        prompt: `${p["Selección"]}\n\nLista de noticias disponibles::\n${articulos}\n\nSelecciona entre 1 y 5 noticias.`,
        maxRetries: 5,
      }));

    await medir("resumen (redacción)", proveedor, principal, () =>
      generateText({
        model: modeloDe(proveedor, principal),
        prompt: `INSTRUCCIONES:\n${p["Principal"]}\n\nARTICULOS SELECCIONADOS:\n${articulos}`,
      }));
  }
}

/**
 * Fuerza el fallo que se ve en producción: la respuesta se corta antes de
 * completar el objeto y el AI SDK lanza NoObjectGeneratedError. Lo que importa
 * medir es si ese error trae `usage` — o sea, si el proveedor cobró la llamada
 * que el hub hoy no registra en ninguna parte.
 */
async function fallos(texto: string) {
  const p = await prompts("proofreader");
  const combinedPrompt = `
${p["Principal"]}

GUÍA DE ESTILO:
${p["Guia de estilo"]}

TEXTO A ANALIZAR:
${texto}
`;

  for (const [proveedor, modelo] of [
    ["openai", "gpt-5.6-terra"],
    ["anthropic", "claude-opus-4-8"],
  ] as const) {
    await medir(
      "corrector (fallo forzado)",
      proveedor,
      modelo,
      () =>
        generateObject({
          model: modeloDe(proveedor, modelo),
          schema: SchemaCorrector,
          prompt: combinedPrompt,
          // El tope real es 16000; con 64 la respuesta se trunca a la fuerza.
          maxOutputTokens: 64,
          maxRetries: 0,
        }),
      "truncado a propósito (maxOutputTokens=64)"
    );
  }
}

function resumenFinal() {
  console.log("\n" + "=".repeat(78));
  const total = mediciones.reduce((s, m) => s + (m.costo ?? 0), 0);
  const fallidas = mediciones.filter((m) => m.resultado === "fallido");
  const cobradoEnFallos = fallidas.reduce((s, m) => s + (m.costo ?? 0), 0);

  console.log(`Llamadas: ${mediciones.length} (${fallidas.length} fallidas)`);
  console.log(`TOTAL calculado por el hub: $${total.toFixed(6)}`);
  if (fallidas.length) {
    console.log(
      `De eso, en llamadas FALLIDAS: $${cobradoEnFallos.toFixed(6)} ` +
        `— gasto que hoy no queda en ninguna fila de la base de datos.`
    );
  }
  console.log("\nPor proveedor (para comparar contra cada consola):");
  for (const prov of ["openai", "anthropic"]) {
    const m = mediciones.filter((x) => x.proveedor === prov);
    if (!m.length) continue;
    console.log(
      `  ${prov.padEnd(10)} llamadas=${m.length} ` +
        `input=${m.reduce((s, x) => s + (x.inputTokens ?? 0), 0)} ` +
        `output=${m.reduce((s, x) => s + (x.outputTokens ?? 0), 0)} ` +
        `costo=$${m.reduce((s, x) => s + (x.costo ?? 0), 0).toFixed(6)}`
    );
  }
  console.log("=".repeat(78));
  console.log(JSON.stringify(mediciones, null, 2));
}

async function main() {
  const que = process.argv[2] ?? "corrector";
  console.log(`Inicio: ${new Date().toISOString()}  —  midiendo: ${que}\n`);

  // Un texto real de producción, para que la medición no sea con un juguete.
  const [fila] = await supabase(
    "analytics_corrector_de_textos",
    "select=texto_original,input_tokens,output_tokens,costo,modelo_utilizado" +
      "&order=created_at.desc&limit=1&texto_original=not.is.null"
  );
  const texto: string = fila?.texto_original ?? "";
  console.log(
    `Texto de prueba: ${texto.length} caracteres. La última corrida real de ` +
      `ese texto (${fila?.modelo_utilizado}) costó $${fila?.costo} ` +
      `(in=${fila?.input_tokens} out=${fila?.output_tokens})\n`
  );

  if (que === "corrector" || que === "todo") await corrector(texto, "texto real de producción");
  if (que === "hilos" || que === "todo") await hilos(texto);
  if (que === "detector" || que === "todo") await detector(texto);
  if (que === "resumen" || que === "todo") await resumen(texto);
  if (que === "fallos" || que === "todo") await fallos(texto);

  resumenFinal();
  console.log(`\nFin: ${new Date().toISOString()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
