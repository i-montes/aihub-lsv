import { randomBytes } from "crypto";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import path from "path";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Fotos y piezas de En Vivo. Con `EN_VIVO_BUCKET` van al bucket de Supabase Storage (ver la
 * migración create_en_vivo_bucket.sql); sin él, a `.data/en-vivo` en el disco, que sólo sirve en
 * local. En Vercel sin bucket se falla con un mensaje claro en vez de escribir en un disco que no
 * persiste.
 *
 * Los archivos se sirven por /api/en-vivo/archivo/[id], que exige sesión: ni Canva ni Facebook los
 * bajan por URL, porque las dos subidas van como binario.
 */

const DOS_DIAS_MS = 2 * 24 * 60 * 60 * 1000;
const CARPETA = path.join(process.cwd(), ".data", "en-vivo");
const ID = /^[0-9a-f]{32}\.(png|jpg)$/;

export type TipoArchivo = "png" | "jpg";
const MIME: Record<TipoArchivo, string> = { png: "image/png", jpg: "image/jpeg" };

function bucket(): string | null {
  return process.env.EN_VIVO_BUCKET?.trim() || null;
}

function sinAlmacen(): never {
  throw new Error("Falta EN_VIVO_BUCKET: En Vivo necesita un bucket de Supabase Storage fuera de local.");
}

export function esIdValido(id: string): boolean {
  return ID.test(id);
}

export function tipoDe(id: string): string {
  return MIME[id.endsWith(".png") ? "png" : "jpg"];
}

export async function guardarArchivo(datos: Buffer, tipo: TipoArchivo): Promise<string> {
  const id = `${randomBytes(16).toString("hex")}.${tipo}`;
  const b = bucket();
  if (b) {
    const { error } = await getSupabaseAdmin().storage.from(b).upload(id, datos, { contentType: MIME[tipo] });
    if (error) throw new Error(`No se pudo guardar el archivo: ${error.message}`);
  } else {
    if (process.env.VERCEL) sinAlmacen();
    await mkdir(CARPETA, { recursive: true });
    await writeFile(path.join(CARPETA, id), datos);
  }
  // Sin cron: cada vez que se guarda algo se barre lo viejo, sin esperar.
  void limpiarViejos();
  return id;
}

export async function leerArchivo(id: string): Promise<Buffer | null> {
  if (!esIdValido(id)) return null;
  const b = bucket();
  if (b) {
    const { data, error } = await getSupabaseAdmin().storage.from(b).download(id);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }
  try {
    return await readFile(path.join(CARPETA, id));
  } catch {
    return null;
  }
}

async function limpiarViejos(): Promise<void> {
  try {
    const limite = Date.now() - DOS_DIAS_MS;
    const b = bucket();
    if (b) {
      const storage = getSupabaseAdmin().storage.from(b);
      const { data } = await storage.list("", { limit: 1000, sortBy: { column: "created_at", order: "asc" } });
      const viejos = (data ?? []).filter((f) => f.created_at && new Date(f.created_at).getTime() < limite).map((f) => f.name);
      if (viejos.length) await storage.remove(viejos);
      return;
    }
    for (const nombre of await readdir(CARPETA)) {
      const ruta = path.join(CARPETA, nombre);
      if ((await stat(ruta)).mtimeMs < limite) await unlink(ruta);
    }
  } catch (error) {
    console.error("[en-vivo] no se pudieron borrar los archivos viejos:", error);
  }
}

// --- Marcas ------------------------------------------------------------------

/**
 * Archivos JSON pequeños con nombre fijo (por ejemplo, la marca de una publicación). A diferencia
 * de las imágenes, el nombre lo decide quien llama y `reservarMarca` falla si ya existe: es la
 * forma atómica de "sólo uno a la vez".
 */
const MARCA = /^[a-z]+-[0-9a-f]{64}\.json$/;

function validarMarca(nombre: string): void {
  if (!MARCA.test(nombre)) throw new Error(`Nombre de marca no válido: ${nombre}`);
}

/** Crea la marca sólo si no existe. Devuelve falso si ya estaba. */
export async function reservarMarca(nombre: string, contenido: unknown): Promise<boolean> {
  validarMarca(nombre);
  const datos = Buffer.from(JSON.stringify(contenido));
  const b = bucket();
  if (b) {
    const { error } = await getSupabaseAdmin().storage.from(b).upload(nombre, datos, { contentType: "application/json", upsert: false });
    if (!error) return true;
    const e = error as { statusCode?: string; message?: string };
    if (e.statusCode === "409" || /exist|duplicate/i.test(e.message ?? "")) return false;
    throw new Error(`No se pudo guardar la marca: ${error.message}`);
  }
  if (process.env.VERCEL) sinAlmacen();
  await mkdir(CARPETA, { recursive: true });
  try {
    await writeFile(path.join(CARPETA, nombre), datos, { flag: "wx" });
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
    throw error;
  }
}

/** Reemplaza la marca (exista o no). */
export async function escribirMarca(nombre: string, contenido: unknown): Promise<void> {
  validarMarca(nombre);
  const datos = Buffer.from(JSON.stringify(contenido));
  const b = bucket();
  if (b) {
    const { error } = await getSupabaseAdmin().storage.from(b).upload(nombre, datos, { contentType: "application/json", upsert: true });
    if (error) throw new Error(`No se pudo guardar la marca: ${error.message}`);
    return;
  }
  if (process.env.VERCEL) sinAlmacen();
  await mkdir(CARPETA, { recursive: true });
  await writeFile(path.join(CARPETA, nombre), datos);
}

export async function leerMarca<T>(nombre: string): Promise<T | null> {
  validarMarca(nombre);
  const b = bucket();
  try {
    if (b) {
      const { data, error } = await getSupabaseAdmin().storage.from(b).download(nombre);
      if (error || !data) return null;
      return JSON.parse(await data.text()) as T;
    }
    return JSON.parse(await readFile(path.join(CARPETA, nombre), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function borrarMarca(nombre: string): Promise<void> {
  validarMarca(nombre);
  const b = bucket();
  if (b) {
    await getSupabaseAdmin().storage.from(b).remove([nombre]);
    return;
  }
  await unlink(path.join(CARPETA, nombre)).catch(() => {});
}
