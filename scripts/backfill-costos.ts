/**
 * Rellena el costo de las generaciones que quedaron con `costo` en NULL.
 *
 * Las columnas de costo se crearon el 2026-09-07; toda fila anterior quedó sin
 * costo aunque el proveedor sí la facturó. Los tokens de esas filas sí se
 * guardaron, así que el costo se puede reconstruir exactamente.
 *
 * Esto existe en vez de una migración en SQL a propósito: reusa
 * `calcularCosto` de lib/costos.ts, que es el mismo código que corre en
 * producción y el mismo que se verificó contra las consolas de los
 * proveedores. Una función equivalente escrita en plpgsql sería una segunda
 * copia de la tabla de precios, y dos copias terminan diciendo cosas distintas.
 *
 * Por defecto NO escribe nada: imprime qué haría. Para aplicarlo hay que pasar
 * `--aplicar`, y antes de tocar una sola fila guarda un respaldo en JSON con el
 * estado previo, para poder devolverse.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/backfill-costos.ts [--aplicar]
 */

import { writeFileSync } from "node:fs";

import { calcularCosto } from "../lib/costos";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const ANON = process.env.SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APLICAR = process.argv.includes("--aplicar");

/**
 * Cada tabla se lee con la llave que tiene permiso sobre ella: analytics_detector
 * tiene RLS y sólo la abre la service role; las otras tres no tienen RLS y sus
 * grants son para el rol anónimo/autenticado.
 */
const TABLAS = [
  { tabla: "analytics_corrector_de_textos", llave: () => ANON, doble: false },
  { tabla: "analytics_generador_de_hilos", llave: () => ANON, doble: false },
  { tabla: "analytics_generador_de_resumenes", llave: () => ANON, doble: false },
  { tabla: "analytics_detector", llave: () => SERVICE, doble: true },
] as const;

async function rest(
  tabla: string,
  llave: string,
  query: string,
  init?: RequestInit
): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?${query}`, {
    ...init,
    headers: {
      apikey: llave,
      Authorization: `Bearer ${llave}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
  });
  const texto = await res.text();
  if (!res.ok) throw new Error(`${tabla}: ${res.status} ${texto}`);
  return texto ? JSON.parse(texto) : null;
}

/** "ANTHROPIC:claude-opus-4-8" y "claude-opus-4-8" son la misma cosa */
function partirModelo(valor: string | null): {
  proveedor: string | null;
  modelo: string | null;
} {
  if (!valor) return { proveedor: null, modelo: null };
  const partes = valor.split(":");
  const modelo = partes[partes.length - 1];
  if (partes.length > 1) {
    return { proveedor: partes[0].toLowerCase(), modelo };
  }
  // Sin prefijo: el proveedor sale del nombre del modelo.
  const proveedor = modelo.startsWith("gpt-")
    ? "openai"
    : modelo.startsWith("claude-")
    ? "anthropic"
    : modelo.startsWith("gemini-")
    ? "google"
    : null;
  return { proveedor, modelo };
}

interface Cambio {
  tabla: string;
  id: string;
  created_at: string;
  modelo: string;
  antes: Record<string, unknown>;
  despues: Record<string, unknown>;
  costo: number;
}

const cambios: Cambio[] = [];
const sinPrecio: { tabla: string; id: string; modelo: string | null }[] = [];

async function revisarTablaSimple(tabla: string, llave: string) {
  const filas = await rest(
    tabla,
    llave,
    "select=id,created_at,modelo_utilizado,costo,input_tokens,output_tokens," +
      "cached_input_tokens,cache_write_tokens&costo=is.null&input_tokens=not.is.null"
  );

  for (const f of filas) {
    const { proveedor, modelo } = partirModelo(f.modelo_utilizado);
    const costo = proveedor
      ? calcularCosto(proveedor, modelo!, {
          inputTokens: f.input_tokens,
          outputTokens: f.output_tokens,
          cachedInputTokens: f.cached_input_tokens,
          cacheWriteTokens: f.cache_write_tokens,
        })
      : null;

    if (costo === null) {
      sinPrecio.push({ tabla, id: f.id, modelo: f.modelo_utilizado });
      continue;
    }
    cambios.push({
      tabla,
      id: f.id,
      created_at: f.created_at,
      modelo: modelo!,
      antes: { costo: null },
      despues: { costo },
      costo,
    });
  }
}

async function revisarDetector(llave: string) {
  const tabla = "analytics_detector";
  const filas = await rest(
    tabla,
    llave,
    "select=id,created_at,proveedor_1,modelo_1,costo_1,input_tokens_1,output_tokens_1," +
      "cached_input_tokens_1,cache_write_tokens_1,proveedor_2,modelo_2,costo_2," +
      "input_tokens_2,output_tokens_2,cached_input_tokens_2,cache_write_tokens_2,costo_total"
  );

  for (const f of filas) {
    const despues: Record<string, unknown> = {};
    const antes: Record<string, unknown> = {};
    let costoFila = 0;
    let modelos: string[] = [];

    for (const i of ["1", "2"] as const) {
      const proveedor: string | null = f[`proveedor_${i}`];
      if (!proveedor) continue;
      if (f[`costo_${i}`] !== null) continue; // ya tiene costo
      if (f[`input_tokens_${i}`] === null) continue; // no consumió nada

      const costo = calcularCosto(proveedor, f[`modelo_${i}`], {
        inputTokens: f[`input_tokens_${i}`],
        outputTokens: f[`output_tokens_${i}`],
        cachedInputTokens: f[`cached_input_tokens_${i}`],
        cacheWriteTokens: f[`cache_write_tokens_${i}`],
      });

      if (costo === null) {
        sinPrecio.push({ tabla, id: f.id, modelo: f[`modelo_${i}`] });
        continue;
      }
      antes[`costo_${i}`] = null;
      despues[`costo_${i}`] = costo;
      costoFila += costo;
      modelos.push(f[`modelo_${i}`]);
    }

    if (!Object.keys(despues).length) continue;

    // costo_total = costo_1 + costo_2, con lo que ya estuviera guardado.
    const c1 = (despues["costo_1"] as number) ?? f.costo_1 ?? null;
    const c2 = (despues["costo_2"] as number) ?? f.costo_2 ?? 0;
    if (c1 !== null) {
      antes["costo_total"] = f.costo_total;
      despues["costo_total"] = Math.round((c1 + c2) * 1e6) / 1e6;
    }

    cambios.push({
      tabla,
      id: f.id,
      created_at: f.created_at,
      modelo: modelos.join(" + "),
      antes,
      despues,
      costo: costoFila,
    });
  }
}

async function main() {
  console.log(
    APLICAR
      ? "MODO APLICAR: se van a escribir los cambios.\n"
      : "MODO SECO: no se escribe nada. Usa --aplicar para escribir.\n"
  );

  for (const t of TABLAS) {
    if (t.doble) await revisarDetector(t.llave());
    else await revisarTablaSimple(t.tabla, t.llave());
  }

  const porTabla = new Map<string, { n: number; usd: number }>();
  for (const c of cambios) {
    const e = porTabla.get(c.tabla) ?? { n: 0, usd: 0 };
    e.n++;
    e.usd += c.costo;
    porTabla.set(c.tabla, e);
  }

  console.log("Filas a rellenar:");
  for (const [tabla, e] of porTabla) {
    console.log(`  ${tabla.padEnd(36)} ${String(e.n).padStart(4)} filas  $${e.usd.toFixed(4)}`);
  }
  const total = cambios.reduce((s, c) => s + c.costo, 0);
  console.log(`  ${"TOTAL".padEnd(36)} ${String(cambios.length).padStart(4)} filas  $${total.toFixed(4)}\n`);

  if (sinPrecio.length) {
    console.log(
      `${sinPrecio.length} filas quedan sin costo porque su modelo no está en la ` +
        `tabla de precios (se dejan en NULL, no se inventa un cero):`
    );
    for (const s of sinPrecio.slice(0, 10)) {
      console.log(`  ${s.tabla} ${s.id} modelo=${s.modelo}`);
    }
    console.log();
  }

  console.log("Muestra de lo que se escribiría (primeras 5):");
  for (const c of cambios.slice(0, 5)) {
    console.log(
      `  ${c.created_at?.slice(0, 10)} ${c.tabla.replace("analytics_", "")} ` +
        `${c.modelo} → ${JSON.stringify(c.despues)}`
    );
  }

  if (!APLICAR) {
    console.log("\nNada escrito.");
    return;
  }

  const respaldo = `backfill-respaldo-${Date.now()}.json`;
  writeFileSync(respaldo, JSON.stringify(cambios, null, 2), "utf-8");
  console.log(`\nRespaldo del estado previo en ${respaldo}`);

  let escritas = 0;
  for (const c of cambios) {
    const llave = c.tabla === "analytics_detector" ? SERVICE : ANON;
    await rest(c.tabla, llave, `id=eq.${encodeURIComponent(c.id)}`, {
      method: "PATCH",
      body: JSON.stringify(c.despues),
    });
    escritas++;
    if (escritas % 10 === 0) console.log(`  ${escritas}/${cambios.length}`);
  }
  console.log(`\nListo: ${escritas} filas actualizadas.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
