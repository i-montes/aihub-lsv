import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Conexiones de En Vivo con Canva y Facebook, por organización.
 *
 * Viven en `herramienta_conexiones` (migración create_herramienta_conexiones.sql), sólo con rol de
 * servicio: nada de aquí llega al navegador salvo lo que devuelve `estadoConexiones`. Mientras la
 * migración no esté aplicada —en local— se guardan en `.data/en-vivo/conexiones.json`. Si no hay
 * nada guardado, se usan las variables de entorno (CANVA_*, META_PAGE_*), útiles para probar.
 *
 * Los secretos (client secret de Canva, token de página) se cifran con AES-256-GCM y la clave de
 * CONEXIONES_CLAVE (32 bytes en base64) dentro de `guardar`. Sin esa clave nunca van a la base: en
 * Vercel se falla y en local se guardan sólo en el archivo.
 */

export const HERRAMIENTA = "en-vivo";
type Servicio = "CANVA" | "FACEBOOK" | "INSTAGRAM";

export type ConexionCanva = {
  clientId: string;
  clientSecret: string;
  plantillaId: string;
  /** Nombres de los campos de datos de la plantilla. */
  campoTitular: string;
  campoFoto: string;
};

export type ConexionFacebook = {
  pageId: string;
  pageName: string;
  pageToken: string;
  conectadoPor: string | null;
  conectadoEn: string | null;
  estado: "conectado" | "desconectado";
};

/**
 * La cuenta profesional de Instagram vinculada a la página de Facebook. No tiene token propio:
 * se publica con el token de la página (Instagram API with Facebook Login).
 */
export type ConexionInstagram = { igUserId: string; usuario: string; pageId: string };

const ARCHIVO_LOCAL = path.join(process.cwd(), ".data", "en-vivo", "conexiones.json");

// --- Cifrado -----------------------------------------------------------------

function clave(): Buffer | null {
  const valor = process.env.CONEXIONES_CLAVE?.trim();
  if (!valor) return null;
  const k = Buffer.from(valor, "base64");
  if (k.length !== 32) throw new Error("CONEXIONES_CLAVE debe ser de 32 bytes en base64.");
  return k;
}

/** Los campos de `datos` que son secretos y van cifrados. */
const SECRETOS = ["client_secret", "page_token"];

function cifrar(texto: string, k: Buffer): string {
  if (texto.startsWith("gcm:")) return texto; // ya cifrado: no se cifra dos veces
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  const datos = Buffer.concat([c.update(texto, "utf8"), c.final()]);
  return `gcm:${iv.toString("base64")}:${c.getAuthTag().toString("base64")}:${datos.toString("base64")}`;
}

function descifrar(texto: string): string {
  if (!texto.startsWith("gcm:")) return texto;
  const k = clave();
  if (!k) throw new Error("Falta CONEXIONES_CLAVE para leer las conexiones guardadas.");
  const [, iv, tag, datos] = texto.split(":");
  const d = createDecipheriv("aes-256-gcm", k, Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(datos, "base64")), d.final()]).toString("utf8");
}

// --- Lectura y escritura -----------------------------------------------------

type Datos = Record<string, string | null>;
type Local = Record<string, Datos>;
const claveLocal = (org: string, s: Servicio) => `${org}:${HERRAMIENTA}:${s}`;

/**
 * Verdadero si el error de Supabase es porque la tabla todavía no existe. Al leer trae código
 * (42P01); al escribir, PostgREST responde 404 con un error vacío, sin código ni mensaje.
 */
function faltaLaTabla(error: { code?: string; message?: string } | null, status?: number): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /herramienta_conexiones/.test(error.message ?? "") || (status === 404 && !error.code);
}

async function leerLocal(): Promise<Local> {
  try {
    return JSON.parse(await readFile(ARCHIVO_LOCAL, "utf8")) as Local;
  } catch {
    return {};
  }
}

async function leer(org: string, s: Servicio): Promise<Datos | null> {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from("herramienta_conexiones")
    .select("datos")
    .eq("organization_id", org)
    .eq("herramienta", HERRAMIENTA)
    .eq("servicio", s)
    .maybeSingle();
  // En local, una conexión guardada sin clave vive sólo en el archivo aunque la tabla exista.
  if (!error) return (data?.datos as Datos) ?? (process.env.VERCEL ? null : ((await leerLocal())[claveLocal(org, s)] ?? null));
  if (!faltaLaTabla(error)) throw new Error(`No se pudo leer la conexión: ${error.message}`);
  return (await leerLocal())[claveLocal(org, s)] ?? null;
}

async function guardarLocal(org: string, s: Servicio, datos: Datos): Promise<void> {
  const local = await leerLocal();
  local[claveLocal(org, s)] = datos;
  await mkdir(path.dirname(ARCHIVO_LOCAL), { recursive: true });
  await writeFile(ARCHIVO_LOCAL, JSON.stringify(local, null, 2));
}

/**
 * Guarda la conexión. `datos` llega con los secretos en claro (o ya cifrados, si se reescribe lo que
 * había) y aquí se cifran. A la base nunca llega un secreto en claro: sin CONEXIONES_CLAVE, en
 * Vercel falla, y en local se guarda sólo en el archivo, aunque la tabla exista.
 */
async function guardar(org: string, s: Servicio, datos: Datos, userId: string | null): Promise<void> {
  const k = clave();
  const enClaro = SECRETOS.some((c) => datos[c] && !datos[c]!.startsWith("gcm:"));
  if (enClaro && !k) {
    if (process.env.VERCEL) throw new Error("Falta CONEXIONES_CLAVE: sin ella no se pueden guardar los tokens. Configúrala en Vercel.");
    console.warn("[en-vivo] sin CONEXIONES_CLAVE: la conexión se guarda sin cifrar sólo en .data/en-vivo/conexiones.json");
    await guardarLocal(org, s, datos);
    return;
  }
  const cifrados: Datos = { ...datos };
  if (k) for (const c of SECRETOS) if (cifrados[c]) cifrados[c] = cifrar(cifrados[c]!, k);

  const { error, status } = await (getSupabaseAdmin() as any).from("herramienta_conexiones").upsert({
    organization_id: org,
    herramienta: HERRAMIENTA,
    servicio: s,
    datos: cifrados,
    actualizado_por: userId,
    updated_at: new Date().toISOString(),
  });
  if (!error) return;
  if (!faltaLaTabla(error, status)) throw new Error(`No se pudo guardar la conexión: ${error.message ?? `HTTP ${status}`}`);
  if (process.env.VERCEL) throw new Error("Falta la tabla herramienta_conexiones: aplica la migración.");
  await guardarLocal(org, s, cifrados);
}

// --- Canva -------------------------------------------------------------------

export async function conexionCanva(org: string): Promise<ConexionCanva | null> {
  const d = await leer(org, "CANVA");
  const env = process.env;
  const clientId = d?.client_id ?? env.CANVA_CLIENT_ID;
  const secreto = d?.client_secret ? descifrar(d.client_secret) : env.CANVA_CLIENT_SECRET;
  const plantillaId = d?.plantilla_id ?? env.CANVA_PLANTILLA_ID;
  if (!clientId || !secreto || !plantillaId) return null;
  return {
    clientId,
    clientSecret: secreto,
    plantillaId,
    campoTitular: d?.campo_titular ?? env.CANVA_CAMPO_TITULAR ?? "titular",
    campoFoto: d?.campo_foto ?? env.CANVA_CAMPO_FOTO ?? "foto",
  };
}

export async function guardarConexionCanva(org: string, userId: string, c: ConexionCanva): Promise<void> {
  await guardar(
    org,
    "CANVA",
    {
      client_id: c.clientId,
      client_secret: c.clientSecret,
      plantilla_id: c.plantillaId,
      campo_titular: c.campoTitular,
      campo_foto: c.campoFoto,
    },
    userId,
  );
}

// --- Facebook ----------------------------------------------------------------

export async function conexionFacebook(org: string): Promise<ConexionFacebook | null> {
  const d = await leer(org, "FACEBOOK");
  if (d?.page_id && d.page_token) {
    return {
      pageId: d.page_id,
      pageName: d.page_name ?? d.page_id,
      pageToken: descifrar(d.page_token),
      conectadoPor: d.conectado_por ?? null,
      conectadoEn: d.conectado_en ?? null,
      estado: d.estado === "desconectado" ? "desconectado" : "conectado",
    };
  }
  // Respaldo para probar en local con el token de envivo-web.
  const env = process.env;
  if (env.META_PAGE_ID && env.META_PAGE_TOKEN) {
    return { pageId: env.META_PAGE_ID, pageName: env.META_PAGE_ID, pageToken: env.META_PAGE_TOKEN, conectadoPor: null, conectadoEn: null, estado: "conectado" };
  }
  return null;
}

export async function guardarConexionFacebook(
  org: string,
  userId: string,
  c: { pageId: string; pageName: string; pageToken: string; scopes: string[] },
): Promise<void> {
  await guardar(
    org,
    "FACEBOOK",
    {
      page_id: c.pageId,
      page_name: c.pageName,
      page_token: c.pageToken,
      scopes: c.scopes.join(","),
      conectado_por: userId,
      conectado_en: new Date().toISOString(),
      estado: "conectado",
    },
    userId,
  );
}

/** Marca la conexión como caída (token inválido, rol perdido) sin borrar la página. */
export async function marcarFacebookDesconectado(org: string): Promise<void> {
  const d = await leer(org, "FACEBOOK");
  if (!d) return;
  await guardar(org, "FACEBOOK", { ...d, estado: "desconectado" }, null);
}

// --- Instagram ---------------------------------------------------------------

export async function conexionInstagram(org: string): Promise<ConexionInstagram | null> {
  const d = await leer(org, "INSTAGRAM");
  if (!d?.ig_user_id || !d.page_id) return null;
  return { igUserId: d.ig_user_id, usuario: d.usuario ?? d.ig_user_id, pageId: d.page_id };
}

/** Se guarda al conectar Facebook; `null` la borra (la página ya no tiene Instagram vinculado). */
export async function guardarConexionInstagram(org: string, userId: string, c: ConexionInstagram | null): Promise<void> {
  await guardar(org, "INSTAGRAM", c ? { ig_user_id: c.igUserId, usuario: c.usuario, page_id: c.pageId } : {}, userId);
}

/** Lo que puede ver el navegador: estado, sin secretos. */
export async function estadoConexiones(org: string) {
  const [canva, facebook, instagram] = await Promise.all([conexionCanva(org), conexionFacebook(org), conexionInstagram(org)]);
  return {
    canva: canva ? { configurada: true, plantillaId: canva.plantillaId } : { configurada: false as const },
    facebook: facebook
      ? { conectada: facebook.estado === "conectado", pagina: facebook.pageName, conectadoEn: facebook.conectadoEn }
      : { conectada: false as const },
    // Instagram publica con el token de la página: sólo sirve si Facebook sigue conectado a esa página.
    instagram:
      instagram && facebook?.estado === "conectado" && facebook.pageId === instagram.pageId
        ? { conectada: true as const, usuario: instagram.usuario }
        : { conectada: false as const },
    facebookLoginDisponible: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
  };
}
