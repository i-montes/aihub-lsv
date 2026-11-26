import path from "path";
import sharp from "sharp";

import { guardarArchivo } from "@/lib/en-vivo/almacen";
import { ALTO, ANCHO } from "@/lib/en-vivo/geometria";

/**
 * La segunda foto de un post (opcional): una "foto de evidencia" (un documento, una captura, otra
 * escena) que va después de la pieza principal, en Facebook y en Instagram.
 *
 * El editor la sube o pega su link. Se normaliza (orientación, tamaño) y se arma sobre el fondo de
 * La Silla con el logo.
 *
 * El diseño sale de la página de evidencia que usa la redacción en Canva (por ejemplo, la página 4
 * de «EnVivo – “Toda denuncia debe ser escuchada”…», DAHaLFLf8yg, leída el 26 de noviembre de
 * 2026): fondo morado #4a4595, el logo de La Silla en crema arriba a la derecha (725, 62; 300x46) y
 * la foto centrada en un marco alto. En ese ejemplo el documento tapaba el logo y lo habían dejado
 * en opacidad 0; aquí el logo queda visible y la foto empieza debajo de él.
 */

const MAXIMO_BYTES = 10 * 1024 * 1024;
const LADO_MAXIMO = 2400;
const CARPETA = path.join(process.cwd(), "lib", "en-vivo", "plantilla");

const FONDO = "#4a4595";
/** El logo dentro de capa.png y en la página de evidencia: el mismo lugar en las dos plantillas. */
const LOGO = { left: 725, top: 62, width: 301, height: 46 };
/** Marco de la foto: debajo del logo, 60 px de margen a los lados y abajo. */
const MARCO = { left: 60, top: LOGO.top + LOGO.height + 40, width: ANCHO - 120, height: ALTO - (LOGO.top + LOGO.height + 40) - 60 };

export type FotoEvidencia = { datos: string; nombre: string } | { url: string };

/** Un link a una foto: sólo http(s), a un host que no sea de la red interna. */
function validarLink(texto: string): URL {
  let u: URL;
  try {
    u = new URL(texto.trim());
  } catch {
    throw new Error("Eso no parece un link a una foto.");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("El link de la foto debe empezar con http o https.");
  const host = u.hostname.toLowerCase();
  const interno =
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host) ||
    host === "::1" ||
    host.startsWith("[");
  if (interno) throw new Error("Ese link no es de una foto pública.");
  return u;
}

async function bajar(link: string): Promise<Buffer> {
  const u = validarLink(link);
  const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
  if (!r.ok) throw new Error(`No se pudo bajar la foto (HTTP ${r.status}).`);
  const tipo = r.headers.get("content-type") ?? "";
  if (!tipo.startsWith("image/")) throw new Error("Ese link no lleva a una imagen. Copia la dirección de la imagen, no la de la página.");
  const largo = Number(r.headers.get("content-length") ?? 0);
  if (largo > MAXIMO_BYTES) throw new Error("La foto pesa demasiado: usa una de menos de 10 MB.");
  const datos = Buffer.from(await r.arrayBuffer());
  if (datos.length > MAXIMO_BYTES) throw new Error("La foto pesa demasiado: usa una de menos de 10 MB.");
  return datos;
}

function deDataUrl(dataUrl: string): Buffer {
  const m = /^data:image\/[a-z+.-]+;base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!m) throw new Error("No se pudo leer la foto: usa un JPG, PNG o WebP.");
  const datos = Buffer.from(m[1], "base64");
  if (datos.length > MAXIMO_BYTES) throw new Error("La foto pesa demasiado: usa una de menos de 10 MB.");
  return datos;
}

/**
 * El logo recortado de la capa fija. Debajo del logo la capa tiene el degradado negro
 * semitransparente; esos píxeles (oscuros) se vuelven transparentes para que no quede un recuadro.
 */
async function logoSinDegradado(): Promise<Buffer> {
  const { data, info } = await sharp(path.join(CARPETA, "capa.png")).extract(LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 70 && data[i + 1] < 70 && data[i + 2] < 70) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** La foto en el diseño de la segunda imagen, guardada en el almacén. Devuelve su id. */
export async function armarEvidencia(foto: FotoEvidencia): Promise<string> {
  const original = "url" in foto ? await bajar(foto.url) : deDataUrl(foto.datos);

  let ajustada: Buffer;
  try {
    ajustada = await sharp(original)
      .rotate()
      .resize({ width: Math.min(MARCO.width, LADO_MAXIMO), height: Math.min(MARCO.height, LADO_MAXIMO), fit: "inside" })
      .png()
      .toBuffer();
  } catch {
    throw new Error("No se pudo leer la foto: usa un JPG, PNG o WebP.");
  }
  const { width = 0, height = 0 } = await sharp(ajustada).metadata();

  const logo = await logoSinDegradado();
  const png = await sharp({ create: { width: ANCHO, height: ALTO, channels: 4, background: FONDO } })
    .composite([
      { input: ajustada, left: MARCO.left + Math.round((MARCO.width - width) / 2), top: MARCO.top + Math.round((MARCO.height - height) / 2) },
      { input: logo, left: LOGO.left, top: LOGO.top },
    ])
    .png()
    .toBuffer();
  return guardarArchivo(png, "png");
}
