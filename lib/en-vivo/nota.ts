import * as cheerio from "cheerio";
import { generateText } from "ai";

import type { ContextoModelo } from "@/lib/en-vivo/modelo";
import { PESTANA_RESUMEN, pestanaPrompt } from "@/lib/en-vivo/prompt-base";
import type { Nota } from "@/lib/en-vivo/tipos";
import { MAX_OUTPUT_TOKENS } from "@/lib/proveedores/opciones-modelo";
import { getWordPressConnection, makeWordPressAuthenticatedRequest } from "@/lib/wordpress-oauth";

// Portado de envivo-web (lib/nota.ts). La diferencia: primero se lee por la conexión de WordPress
// de la organización (Ajustes > WordPress), que trae la foto destacada original sin adivinarla
// desde og:image; si no hay conexión o falla, se raspa el HTML público como en envivo-web.

const NAVEGADOR = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const PARRAFOS_POST = 3;
/** Largo máximo del texto del post, sin contar el link. Si los párrafos pasan de aquí, se resumen. */
export const MAX_CARACTERES = 2000;
/** Se le pide al modelo un poco menos, porque no cuenta caracteres exacto. */
const META_RESUMEN = 1850;

const limpiar = (texto: string) => texto.replace(/\s+/g, " ").trim();
const largo = (texto: string) => Array.from(texto).length;

export function validarUrl(url: string): URL {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    throw new Error("Eso no parece un link.");
  }
  if (u.protocol !== "https:" || !/(^|\.)lasillavacia\.com$/.test(u.hostname)) {
    throw new Error("El link debe ser de una nota de lasillavacia.com.");
  }
  return u;
}

/** El último tramo de la ruta, que en WordPress es el slug del post. */
function slugDe(u: URL): string {
  return u.pathname.split("/").filter(Boolean).pop() ?? "";
}

// Un elemento del DOM de cheerio. Sus tipos viven en `domhandler`, que con pnpm no se puede
// importar directo; para recorrer basta con esto.
type Element = { tagName: string };

// Recorre el cuerpo en orden y se detiene en el primer h2. Toma párrafos y listas;
// salta trinos incrustados, scripts, figuras y bloques de publicidad.
function textoHastaIntertitulo($: cheerio.CheerioAPI, cuerpo: Element): string[] {
  const bloques: string[] = [];
  let ultimoEraLista = false;

  const recorrer = (nodo: Element): boolean => {
    for (const hijo of $(nodo as never).children().toArray() as unknown as Element[]) {
      const etiqueta = hijo.tagName.toLowerCase();
      const $hijo = $(hijo as never);
      const clase = $hijo.attr("class") ?? "";
      if (etiqueta === "h2") return true;
      if (etiqueta === "p") {
        const t = limpiar($hijo.text());
        if (t) bloques.push(t);
        ultimoEraLista = false;
      } else if (etiqueta === "ul" || etiqueta === "ol") {
        const items = $hijo
          .children("li")
          .toArray()
          .map((li) => limpiar($(li).text()))
          .filter(Boolean)
          .map((t) => `• ${t}`);
        if (items.length) {
          // Varias listas seguidas (WordPress a veces pone un <ul> por viñeta) van juntas.
          if (ultimoEraLista) bloques[bloques.length - 1] += `\n${items.join("\n")}`;
          else bloques.push(items.join("\n"));
          ultimoEraLista = true;
        }
      } else if ((etiqueta === "div" || etiqueta === "section") && /wp-block-(group|column)/.test(clase)) {
        if (recorrer(hijo)) return true;
      }
    }
    return false;
  };

  recorrer(cuerpo);
  return bloques;
}

type PostWordPress = {
  link?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string; caption?: { rendered?: string }; media_details?: { sizes?: Record<string, { source_url?: string }> } }[];
    "wp:term"?: { name?: string; taxonomy?: string }[][];
  };
};

/** Por la conexión de WordPress de la organización. `null` si no hay conexión o no encuentra el post. */
async function leerPorWordPress(u: URL, organizationId: string): Promise<Nota | null> {
  const conexion = await getWordPressConnection(organizationId);
  if (!conexion.success || !conexion.connection || conexion.connection.connection_type !== "self_hosted") return null;

  const r = await makeWordPressAuthenticatedRequest(
    conexion.connection,
    `/posts?slug=${encodeURIComponent(slugDe(u))}&_embed=wp:featuredmedia,wp:term`,
  );
  const post = (Array.isArray(r.data) ? r.data[0] : null) as PostWordPress | null;
  if (!r.success || !post?.content?.rendered) return null;

  const $ = cheerio.load(`<div class="entry-content">${post.content.rendered}</div>`);
  const parrafos = textoHastaIntertitulo($, $(".entry-content").get(0) as unknown as Element);
  if (!parrafos.length) return null;

  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const fotoAlta = media?.source_url ?? "";
  const etiquetas = (post._embedded?.["wp:term"] ?? [])
    .flat()
    .filter((t) => t.taxonomy === "post_tag")
    .map((t) => t.name)
    .filter(Boolean)
    .join(", ");

  return {
    url: u.toString(),
    titular: limpiar(cheerio.load(post.title?.rendered ?? "").text()),
    fotoAlta,
    foto: media?.media_details?.sizes?.large?.source_url ?? fotoAlta,
    pie: limpiar(cheerio.load(media?.caption?.rendered ?? "").text()),
    etiquetas,
    parrafos,
    fuente: "wordpress",
  };
}

/** Raspando el HTML público, como envivo-web. */
async function leerPorHtml(u: URL): Promise<Nota> {
  const r = await fetch(u, { headers: { "User-Agent": NAVEGADOR, "Accept-Language": "es-CO,es" } });
  if (!r.ok) throw new Error(`No se pudo abrir la nota (HTTP ${r.status}).`);
  const $ = cheerio.load(await r.text());

  const meta = (selector: string) => limpiar($(selector).attr("content") ?? "");
  const titular = (meta('meta[property="og:title"]') || limpiar($("h1").first().text())).replace(
    /\s*[-|–]\s*La Silla Vac[ií]a\s*$/i,
    "",
  );
  const foto = meta('meta[property="og:image"]');
  const cuerpo = $(".entry-content").first().get(0) as unknown as Element | undefined;
  if (!titular || !cuerpo) throw new Error("No encontré el titular o el cuerpo de la nota.");

  const parrafos = textoHastaIntertitulo($, cuerpo);
  if (!parrafos.length) throw new Error("La nota no tiene texto antes del primer intertítulo.");

  return {
    url: u.toString(),
    titular,
    foto,
    fotoAlta: foto.split("?")[0],
    pie: limpiar($(".entry-content figure figcaption, figure.post-thumbnail figcaption, .featured-image-single figcaption").first().text()),
    etiquetas: meta('meta[name="parsely-tags"]'),
    parrafos,
    fuente: "html",
  };
}

export async function leerNota(url: string, organizationId: string): Promise<Nota> {
  const u = validarUrl(url);
  try {
    const nota = await leerPorWordPress(u, organizationId);
    if (nota) return nota;
  } catch (error) {
    console.error("[en-vivo] no se pudo leer la nota por WordPress; se raspa el HTML:", error);
  }
  return leerPorHtml(u);
}

// Último recurso si no hay resumen que quepa: corta en el último final de frase antes del máximo.
function recortar(texto: string): string {
  const corto = Array.from(texto).slice(0, MAX_CARACTERES).join("");
  const fin = [...corto.matchAll(/[.!?…]["”»)]?(?=\s|$)/g)].at(-1);
  return (fin ? corto.slice(0, fin.index! + fin[0].length) : corto).trim();
}

async function resumir(texto: string, titular: string, ctx: ContextoModelo): Promise<string> {
  const instrucciones = pestanaPrompt(ctx.pestanas, PESTANA_RESUMEN);
  let pedido = `${instrucciones}

Titular de la nota: ${titular}
Tiene ${largo(texto)} caracteres. Déjalo en unos ${META_RESUMEN} y nunca en más de ${MAX_CARACTERES}.

<texto>
${texto}
</texto>`;
  let resumen = "";
  for (let intento = 0; intento < 2; intento++) {
    const r = await generateText({
      model: ctx.model,
      prompt: pedido,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      providerOptions: ctx.providerOptions,
    });
    ctx.registrar(r.usage);
    resumen = r.text.trim();
    if (largo(resumen) <= MAX_CARACTERES) return resumen;
    pedido = `${pedido}

Tu respuesta anterior quedó de ${largo(resumen)} caracteres:
<respuesta>
${resumen}
</respuesta>
Recórtala a unos ${META_RESUMEN}, con las mismas reglas.`;
  }
  return recortar(resumen);
}

/**
 * El post: los tres primeros párrafos tal cual (sin pasar del primer intertítulo) y, al final, el
 * link de la nota. Si pasan de MAX_CARACTERES, el modelo los resume y `aviso` se lo dice al editor.
 */
export async function textoPost(nota: Nota, ctx: ContextoModelo, alResumir?: () => void): Promise<{ texto: string; aviso: string }> {
  const original = nota.parrafos.slice(0, PARRAFOS_POST).join("\n\n");
  const n = largo(original);
  if (n <= MAX_CARACTERES) return { texto: `${original}\n\n${nota.url}`, aviso: "" };

  alResumir?.();
  let cuerpo: string;
  let aviso: string;
  try {
    cuerpo = await resumir(original, nota.titular, ctx);
    aviso = `Los tres primeros párrafos tenían ${n} caracteres; el texto del post es un resumen de ${largo(cuerpo)}. Revísalo antes de publicar.`;
  } catch (e) {
    console.error("[en-vivo] no se pudo resumir el texto del post:", e);
    cuerpo = recortar(original);
    aviso = `Los tres primeros párrafos tenían ${n} caracteres y no se pudieron resumir; el texto se cortó en la última frase que cabe (${largo(cuerpo)}). Revísalo antes de publicar.`;
  }
  return { texto: `${cuerpo}\n\n${nota.url}`, aviso };
}
