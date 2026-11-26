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
