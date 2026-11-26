import type { ConexionCanva } from "@/lib/en-vivo/conexiones";

/**
 * La pieza en Canva por su API REST (https://www.canva.dev/docs/apps/rest-apis/), con una service
 * app: el token se pide con client credentials, sin que nadie inicie sesión.
 *
 * Flujo: subir la foto ya recortada (binario), autofill de la plantilla de marca con el titular y
 * la foto, export a PNG. Las tres son jobs asíncronos que se consultan hasta que terminan. Las
 * etiquetas no pasan por Canva: la API no mueve elementos (ver dibujo.ts).
 *
 * Endpoints verificados contra la especificación OpenAPI oficial
 * (https://www.canva.dev/sources/connect/api/latest/api.yml) el 25 de noviembre de 2026.
 */

const API = "https://api.canva.com/rest/v1";
const ESPERA_MS = 1500;
const MAXIMO_MS = 90_000;

export class ErrorCanva extends Error {}

const tokens = new Map<string, { token: string; vence: number }>();

/** Token de la service app. Dura 4 horas; se guarda en memoria y se pide otro 5 minutos antes. */
async function token(c: ConexionCanva): Promise<string> {
  const guardado = tokens.get(c.clientId);
  if (guardado && guardado.vence - 5 * 60_000 > Date.now()) return guardado.token;

  const r = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${c.clientId}:${c.clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    throw new ErrorCanva(`Canva no dio el token (${j.error_description ?? j.message ?? `HTTP ${r.status}`}). Revisa la service app.`);
  }
  tokens.set(c.clientId, { token: j.access_token, vence: Date.now() + (j.expires_in ?? 14_400) * 1000 });
  return j.access_token;
}

async function llamar(c: ConexionCanva, metodo: "GET" | "POST", ruta: string, cuerpo?: BodyInit, cabeceras: Record<string, string> = {}) {
  const r = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${await token(c)}`, ...(cuerpo && typeof cuerpo === "string" ? { "Content-Type": "application/json" } : {}), ...cabeceras },
    body: cuerpo,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new ErrorCanva(`Canva: ${j.message ?? j.code ?? `HTTP ${r.status}`}`);
  return j;
}

/** Consulta un job hasta que sale de `in_progress`. */
async function esperar<T extends { status: string; error?: { message?: string; code?: string } }>(
  c: ConexionCanva,
  ruta: string,
  que: string,
): Promise<T> {
  const limite = Date.now() + MAXIMO_MS;
  for (;;) {
    const { job } = (await llamar(c, "GET", ruta)) as { job: T };
    if (job.status === "success") return job;
    if (job.status === "failed") throw new ErrorCanva(`Canva no pudo ${que}: ${job.error?.message ?? job.error?.code ?? "sin detalle"}`);
    if (Date.now() > limite) throw new ErrorCanva(`Canva tardó demasiado en ${que}.`);
    await new Promise((ok) => setTimeout(ok, ESPERA_MS));
  }
}

async function subirFoto(c: ConexionCanva, jpeg: Buffer, nombre: string): Promise<string> {
  const { job } = await llamar(c, "POST", "/asset-uploads", new Uint8Array(jpeg), {
    "Content-Type": "application/octet-stream",
    "Asset-Upload-Metadata": JSON.stringify({ name_base64: Buffer.from(nombre.slice(0, 50)).toString("base64") }),
  });
  const listo = job.status === "success" ? job : await esperar<{ status: string; asset?: { id: string } }>(c, `/asset-uploads/${job.id}`, "subir la foto");
  if (!listo.asset?.id) throw new ErrorCanva("Canva subió la foto pero no devolvió su id.");
  return listo.asset.id;
}

async function rellenar(c: ConexionCanva, titular: string, assetId: string, titulo: string) {
  const { job } = await llamar(
    c,
    "POST",
    "/autofills",
    JSON.stringify({
      type: "create_from_brand_template",
      brand_template_id: c.plantillaId,
      title: titulo.slice(0, 255),
      data: {
        [c.campoTitular]: { type: "text", text: titular },
        [c.campoFoto]: { type: "image", asset_id: assetId },
      },
    }),
  );
  const listo = await esperar<{ status: string; result?: { design?: { id: string; urls?: { edit_url?: string } } } }>(
    c,
    `/autofills/${job.id}`,
    "rellenar la plantilla",
  );
  const diseno = listo.result?.design;
  if (!diseno?.id) throw new ErrorCanva("Canva rellenó la plantilla pero no devolvió el diseño.");
  return { id: diseno.id, editUrl: diseno.urls?.edit_url ?? null };
}

async function exportar(c: ConexionCanva, disenoId: string): Promise<Buffer> {
  const { job } = await llamar(c, "POST", "/exports", JSON.stringify({ design_id: disenoId, format: { type: "png", width: 1080, lossless: true } }));
  const listo = await esperar<{ status: string; urls?: string[] }>(c, `/exports/${job.id}`, "exportar el PNG");
  const url = listo.urls?.[0];
  if (!url) throw new ErrorCanva("Canva exportó pero no devolvió el archivo.");
  // La URL vale 24 horas: se baja ya y se guarda en el almacén.
  const r = await fetch(url);
  if (!r.ok) throw new ErrorCanva(`No se pudo bajar el PNG de Canva (HTTP ${r.status}).`);
  return Buffer.from(await r.arrayBuffer());
}

/** Foto recortada + titular → PNG de la plantilla, sin etiquetas. */
export async function armarEnCanva(c: ConexionCanva, fotoRecortada: Buffer, titular: string, nombre: string) {
  const assetId = await subirFoto(c, fotoRecortada, `envivo-${nombre}`);
  const diseno = await rellenar(c, titular, assetId, `EnVivo – ${titular}`);
  const png = await exportar(c, diseno.id);
  return { png, diseno };
}

/** Para "Probar" en Ajustes: los campos de datos de la plantilla. */
export async function camposDePlantilla(c: ConexionCanva): Promise<Record<string, { type: string }>> {
  const { dataset } = await llamar(c, "GET", `/brand-templates/${encodeURIComponent(c.plantillaId)}/dataset`);
  return dataset ?? {};
}
