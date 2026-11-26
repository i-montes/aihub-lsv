import { createHmac } from "crypto";

import type { ConexionFacebook } from "@/lib/en-vivo/conexiones";

/**
 * Facebook: "Iniciar sesión con Facebook" para que un admin conecte la página, y publicar.
 *
 * Conectar usa el flujo de servidor de Facebook Login
 * (https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow): código →
 * token de usuario → token de larga duración → /me/accounts. El token de página que sale de un
 * token de usuario largo no tiene fecha de vencimiento; es lo mismo que hacía a mano
 * `publicar_facebook.py extender` en envivo-web.
 *
 * Publicar es como en envivo-web (lib/facebook.ts): la foto se sube sin publicar y el post se crea
 * en /feed con la foto adjunta. La foto va como archivo, no por URL, porque el almacén no es
 * público. Las llamadas con token van firmadas con appsecret_proof cuando hay META_APP_SECRET.
 */

const GRAPH = () => `https://graph.facebook.com/${process.env.META_GRAPH_VERSION?.trim() || "v24.0"}`;
/**
 * Los de la página, más los de Instagram: con el mismo login se publica en la cuenta profesional
 * vinculada a la página (Instagram API with Facebook Login), sin otro inicio de sesión.
 */
export const PERMISOS = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "business_management",
  "instagram_basic",
  "instagram_content_publish",
];

export class ErrorMeta extends Error {
  constructor(
    mensaje: string,
    public codigo?: number,
    public subcodigo?: number,
  ) {
    super(mensaje);
  }
  /** Token muerto o sin rol en la página: hay que reconectar (códigos 190 y 492 de Graph). */
  get hayQueReconectar() {
    return this.codigo === 190 || this.subcodigo === 492 || this.codigo === 492;
  }
}

function app() {
  const id = process.env.META_APP_ID?.trim();
  const secreto = process.env.META_APP_SECRET?.trim();
  if (!id || !secreto) throw new Error("Faltan META_APP_ID y META_APP_SECRET para conectar con Facebook.");
  return { id, secreto };
}

function prueba(token: string): Record<string, string> {
  const secreto = process.env.META_APP_SECRET?.trim();
  return secreto ? { appsecret_proof: createHmac("sha256", secreto).update(token).digest("hex") } : {};
}

async function llamar(metodo: "GET" | "POST", ruta: string, datos: Record<string, string> | FormData) {
  let url = `${GRAPH()}/${ruta}`;
  const init: RequestInit = { method: metodo };
  if (metodo === "GET") url += `?${new URLSearchParams(datos as Record<string, string>)}`;
  else init.body = datos instanceof FormData ? datos : new URLSearchParams(datos);
  const r = await fetch(url, init);
  const j = await r.json().catch(() => ({ error: { message: `HTTP ${r.status}` } }));
  if (j.error) throw new ErrorMeta(`Facebook: ${j.error.message}`, j.error.code, j.error.error_subcode);
  return j;
}

// --- Conectar ----------------------------------------------------------------

export const COOKIE_STATE = "en_vivo_fb_state";

/**
 * La dirección con la que el navegador ve el Hub. Detrás de un túnel (devtunnels de VS Code) la
 * petición le llega a Next como `localhost:3000`, así que se usa META_REDIRECT_BASE o, si no, el
 * host reenviado por el proxy.
 */
export function origenPublico(cabeceras: Headers, origenInterno: string): string {
  const configurado = process.env.META_REDIRECT_BASE?.trim().replace(/\/$/, "");
  if (configurado) return configurado;
  const host = cabeceras.get("x-forwarded-host");
  return host ? `${cabeceras.get("x-forwarded-proto") ?? "https"}://${host}` : origenInterno;
}

/** El callback tiene que coincidir exacto con el registrado en la app de Meta. */
export function redirectUri(origen: string): string {
  return `${origen}/api/en-vivo/facebook/callback`;
}

export function urlDeLogin(state: string, redirectUri: string): string {
  const { id } = app();
  const version = process.env.META_GRAPH_VERSION?.trim() || "v24.0";
  const q = new URLSearchParams({ client_id: id, redirect_uri: redirectUri, state, response_type: "code", scope: PERMISOS.join(",") });
  return `https://www.facebook.com/${version}/dialog/oauth?${q}`;
}

export type PaginaDisponible = { id: string; name: string; access_token: string; tasks?: string[] };

/** Código → token largo de usuario → páginas que puede administrar, con permiso de crear contenido. */
export async function canjearCodigo(code: string, redirectUri: string) {
  const { id, secreto } = app();
  const corto = await llamar("GET", "oauth/access_token", { client_id: id, client_secret: secreto, redirect_uri: redirectUri, code });
  const largo = await llamar("GET", "oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: id,
    client_secret: secreto,
    fb_exchange_token: corto.access_token,
  });
  const tokenUsuario: string = largo.access_token;

  const permisos = await llamar("GET", "me/permissions", { access_token: tokenUsuario, ...prueba(tokenUsuario) });
  const concedidos: string[] = (permisos.data ?? []).filter((p: { status: string }) => p.status === "granted").map((p: { permission: string }) => p.permission);
  if (!concedidos.includes("pages_manage_posts")) {
    throw new Error("No se concedió el permiso para publicar en la página (pages_manage_posts). Vuelve a conectar y acéptalo.");
  }

  const cuentas = await llamar("GET", "me/accounts", { fields: "id,name,access_token,tasks", access_token: tokenUsuario, ...prueba(tokenUsuario) });
  const paginas = ((cuentas.data ?? []) as PaginaDisponible[]).filter((p) => !p.tasks || p.tasks.includes("CREATE_CONTENT"));
  return { paginas, scopes: concedidos };
}

/** Verifica que el token de página sea válido y no venza (expires_at 0). */
export async function verificarTokenDePagina(token: string): Promise<{ valido: boolean; vence: boolean }> {
  const { id, secreto } = app();
  const r = await llamar("GET", "debug_token", { input_token: token, access_token: `${id}|${secreto}` });
  return { valido: !!r.data?.is_valid, vence: !!r.data?.expires_at };
}

/** La cuenta profesional de Instagram vinculada a la página, o `null` si no tiene. */
export async function cuentaInstagram(pageId: string, pageToken: string): Promise<{ id: string; usuario: string } | null> {
  const r = await llamar("GET", pageId, { fields: "instagram_business_account{id,username}", access_token: pageToken, ...prueba(pageToken) });
  const cuenta = r.instagram_business_account;
  return cuenta?.id ? { id: cuenta.id, usuario: cuenta.username ? `@${cuenta.username}` : cuenta.id } : null;
}

/** Para los módulos de otras redes de Meta (Instagram): la misma llamada, el mismo manejo de errores. */
export { llamar as llamarGraph, prueba as pruebaAppSecret };

// --- Publicar ----------------------------------------------------------------

/**
 * Sube el PNG sin publicar y crea el post en /feed con la foto adjunta, como un post normal de
 * texto e imagen. Publicar directo en /photos lo deja en "Fotos subidas con el celular".
 */
export async function publicar(c: ConexionFacebook, pngs: Buffer[], texto: string, nombre: string): Promise<{ postId: string; link: string }> {
  const firma = prueba(c.pageToken);
  // Cada foto se sube sin publicar; el post las lleva adjuntas en este orden (la pieza y, si hay,
  // la segunda foto).
  const fotos: string[] = [];
  for (const [i, png] of pngs.entries()) {
    const form = new FormData();
    form.set("published", "false");
    form.set("access_token", c.pageToken);
    for (const [k, v] of Object.entries(firma)) form.set(k, v);
    form.set("source", new Blob([new Uint8Array(png)], { type: "image/png" }), `${nombre}${i ? `-${i + 1}` : ""}.png`);
    fotos.push((await llamar("POST", `${c.pageId}/photos`, form)).id as string);
  }

  const adjuntas = Object.fromEntries(fotos.map((id, i) => [`attached_media[${i}]`, JSON.stringify({ media_fbid: id })]));
  const res = await llamar("POST", `${c.pageId}/feed`, {
    message: texto,
    ...adjuntas,
    access_token: c.pageToken,
    ...firma,
  });
  const postId: string = res.id;
  let link = `https://www.facebook.com/${postId}`;
  try {
    link = (await llamar("GET", postId, { fields: "permalink_url", access_token: c.pageToken, ...firma })).permalink_url ?? link;
  } catch {
    // El post ya salió; el link genérico también sirve.
  }
  return { postId, link };
}
