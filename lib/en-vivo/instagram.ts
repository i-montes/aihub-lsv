import sharp from "sharp";

import { guardarArchivo } from "@/lib/en-vivo/almacen";
import type { ConexionFacebook, ConexionInstagram } from "@/lib/en-vivo/conexiones";
import { llamarGraph, pruebaAppSecret } from "@/lib/en-vivo/facebook";
import { urlPublica } from "@/lib/en-vivo/publico";

/**
 * Publicar la pieza en el Instagram vinculado a la página, con el token de la página (Instagram
 * API with Facebook Login: https://developers.facebook.com/docs/instagram-platform/content-publishing).
 *
 * 1. Instagram sólo acepta JPEG: cada PNG se convierte y se guarda.
 * 2. Instagram baja las imágenes por URL (no hay subida binaria para imágenes): se le dan enlaces
 *    públicos firmados que vencen en una hora. En local tienen que salir por el túnel, y el túnel
 *    tiene que ser público.
 * 3. Una imagen: un contenedor, se espera a que quede FINISHED y se publica. Dos o más (la pieza y
 *    la segunda foto): un contenedor por imagen como ítem de carrusel, y un contenedor CAROUSEL con
 *    el texto que los junta en ese orden.
 */

const ESPERA_MS = 2000;
const MAXIMO_MS = 120_000;

export { textoInstagram } from "@/lib/en-vivo/texto-instagram";

async function esperarListo(id: string, token: string, firma: Record<string, string>) {
  const limite = Date.now() + MAXIMO_MS;
  for (;;) {
    const { status_code } = await llamarGraph("GET", id, { fields: "status_code", access_token: token, ...firma });
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") {
      throw new Error(`Instagram no pudo procesar la imagen (${status_code}). Revisa que el enlace público se pueda abrir desde internet.`);
    }
    if (Date.now() > limite) throw new Error("Instagram tardó demasiado en procesar la imagen.");
    await new Promise((ok) => setTimeout(ok, ESPERA_MS));
  }
}

async function urlJpeg(png: Buffer, origenPublico: string): Promise<string> {
  const jpeg = await sharp(png).flatten({ background: "#000000" }).toColorspace("srgb").jpeg({ quality: 92 }).toBuffer();
  return urlPublica(origenPublico, await guardarArchivo(jpeg, "jpg"));
}

export async function publicarEnInstagram(
  fb: ConexionFacebook,
  ig: ConexionInstagram,
  pngs: Buffer[],
  caption: string,
  origenPublico: string,
): Promise<{ mediaId: string; link: string }> {
  const token = fb.pageToken;
  const firma = pruebaAppSecret(token);
  const urls = await Promise.all(pngs.map((png) => urlJpeg(png, origenPublico)));

  let contenedor: string;
  if (urls.length === 1) {
    contenedor = (await llamarGraph("POST", `${ig.igUserId}/media`, { image_url: urls[0], caption, access_token: token, ...firma })).id;
  } else {
    const items: string[] = [];
    for (const image_url of urls) {
      const item = (await llamarGraph("POST", `${ig.igUserId}/media`, { image_url, is_carousel_item: "true", access_token: token, ...firma })).id;
      await esperarListo(item, token, firma);
      items.push(item);
    }
    contenedor = (
      await llamarGraph("POST", `${ig.igUserId}/media`, { media_type: "CAROUSEL", children: items.join(","), caption, access_token: token, ...firma })
    ).id;
  }
  await esperarListo(contenedor, token, firma);

  const publicado = await llamarGraph("POST", `${ig.igUserId}/media_publish`, { creation_id: contenedor, access_token: token, ...firma });
  let link = `https://www.instagram.com/${ig.usuario.replace(/^@/, "")}/`;
  try {
    link = (await llamarGraph("GET", publicado.id, { fields: "permalink", access_token: token, ...firma })).permalink ?? link;
  } catch {
    // Ya se publicó; el link al perfil también sirve.
  }
  return { mediaId: publicado.id, link };
}
