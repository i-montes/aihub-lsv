import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

import { ANCHO, type Etiqueta } from "@/lib/en-vivo/geometria";

/**
 * La pieza En Vivo armada en el servidor, igual a la plantilla de Canva
 * ("Plantilla EnVivo – app web v2", DAHZ_npj944), sin pasar por Canva.
 *
 * De la plantilla salen, exportados el 25 de noviembre de 2026:
 * - `plantilla/capa.png`: la capa fija (degradado oscuro, logo y etiqueta enVivo), 1080x1350 con
 *   transparencia. Va encima de la foto.
 * - `plantilla/etiqueta.png`: el recuadro de la etiqueta de nombre, 440x100, con la flecha
 *   hacia arriba (los 18 px de arriba). Para las etiquetas que van encima de la cabeza se gira 180°,
 *   como en la plantilla.
 * - Las medidas: el titular va en x 68, desde y 831,6, 931 de ancho, tamaño 110, interlineado 0,94,
 *   color #e4dfd1, fuente MARTIN; la línea base de cada renglón cae un interlineado más abajo que el
 *   anterior. Las etiquetas usan Manrope ExtraBold (nombre) y Regular (cargo), color #3d3d3d; la
 *   línea base cae a 0,95 del tamaño bajo el borde de su caja de texto (medido en la exportación).
 *
 * Fuentes (en `plantilla/fuentes`):
 * - Manrope: Google Fonts, licencia OFL. Instanciada a 400 y 800 desde la variable.
 * - MARTIN (Vocal Type Co., Tré Seals): `MARTIN-Regular.ttf`, el archivo que usa La Silla (lo
 *   entregó la redacción el 26 de noviembre de 2026). Si faltara, el titular cae a Anton (OFL),
 *   escalada para que sus mayúsculas midan lo mismo que las de MARTIN.
 *
 * El texto lo dibuja Pango a través de sharp con el archivo de cada fuente, sin depender de las
 * fuentes del sistema. Pango recorta la imagen a la tinta; para ubicar la línea base sin depender
 * de las letras, cada renglón lleva un "puntal" invisible (ÉgQ,) que fija el alto de la imagen.
 */

const CARPETA = path.join(process.cwd(), "lib", "en-vivo", "plantilla");
const FUENTES = path.join(CARPETA, "fuentes");

const TITULAR = {
  left: 68,
  top: 831.6,
  ancho: 931,
  tamano: 110,
  interlineado: 0.94,
  color: "#e4dfd1",
  maxLineas: 4,
  /** El tamaño baja hasta acá para que el titular quepa en 4 renglones. */
  tamanoMinimo: 76,
  /** Proporción del alto de las mayúsculas de MARTIN respecto a su tamaño (63 px a 110). */
  mayusculasMartin: 0.573,
};
const COLOR_ETIQUETA = "#3d3d3d";
const PUNTAL = "ÉgQ,";

type Fuente = { familia: string; archivo: string; escala: number };

let cacheTitular: Promise<Fuente> | null = null;

/** MARTIN si está el archivo; si no, Anton escalada a la altura de mayúsculas de MARTIN. */
function fuenteTitular(): Promise<Fuente> {
  cacheTitular ??= (async () => {
    const martin = path.join(FUENTES, "MARTIN-Regular.ttf");
    if (existsSync(martin)) {
      return { familia: process.env.EN_VIVO_FAMILIA_TITULAR?.trim() || "MARTIN", archivo: martin, escala: 1 };
    }
    const anton: Fuente = { familia: "Anton", archivo: path.join(FUENTES, "Anton-Regular.ttf"), escala: 1 };
    const alto = (await renglon("H", anton, 110, "#ffffff", false)).alto;
    return { ...anton, escala: (TITULAR.mayusculasMartin * 110) / alto };
  })();
  return cacheTitular;
}

const NOMBRE: Fuente = { familia: "Manrope ExtraBold", archivo: path.join(FUENTES, "Manrope-ExtraBold.ttf"), escala: 1 };
const CARGO: Fuente = { familia: "Manrope", archivo: path.join(FUENTES, "Manrope-Regular.ttf"), escala: 1 };

const escapar = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Un renglón de texto como PNG recortado a la tinta. Con `puntal`, la imagen lleva el puntal
 * invisible a los lados y `base` es la distancia del borde de arriba a la línea base.
 */
async function renglon(texto: string, f: Fuente, tamano: number, color: string, puntal = true, centrado = false) {
  const t = `<span foreground="${color}">${escapar(texto)}</span>`;
  const invisible = (s: string) => `<span fgalpha="1">${escapar(s)}</span>`;
  const marcado = !puntal ? t : centrado ? `${invisible(PUNTAL)}${t}${invisible([...PUNTAL].reverse().join(""))}` : `${t}${invisible(PUNTAL)}`;
  const { data, info } = await sharp({
    text: { text: marcado, font: `${f.familia} ${Math.round(tamano * f.escala * 10) / 10}`, fontfile: f.archivo, rgba: true, dpi: 72 },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { png: data, ancho: info.width, alto: info.height };
}

/** Distancia del borde de arriba de un renglón con puntal a su línea base (la É no baja de la base). */
async function baseDe(f: Fuente, tamano: number): Promise<number> {
  return (await renglon("É", f, tamano, "#ffffff", false)).alto;
}

/**
 * Si el renglón es más ancho que `ancho`, lo reduce en proporción para que quepa. sharp no deja
 * componer una imagen más grande que el fondo, y un texto sin espacios puede serlo.
 */
async function caberEn(texto: string, f: Fuente, tamano: number, color: string, ancho: number, centrado = false) {
  // Se mide sin el puntal invisible: lo que tiene que caber es lo que se ve.
  const visible = (await renglon(texto, f, tamano, "#ffffff", false)).ancho;
  const r = await renglon(texto, f, tamano, color, true, centrado);
  if (visible <= ancho) return { png: r.png, ancho: r.ancho, escala: 1 };
  const escala = ancho / visible;
  const png = await sharp(r.png).resize({ width: Math.max(1, Math.floor(r.ancho * escala)) }).png().toBuffer();
  return { png, ancho: (await sharp(png).metadata()).width ?? 0, escala };
}

/** Nunca más ancho que lo que queda del lienzo: lo que sobra a la derecha es puntal invisible. */
async function hastaElBorde(png: Buffer, maximo: number): Promise<Buffer> {
  const { width = 0, height = 0 } = await sharp(png).metadata();
  return width <= maximo ? png : sharp(png).extract({ left: 0, top: 0, width: maximo, height }).png().toBuffer();
}

/** Parte el titular en renglones que quepan en el ancho, sin cortar palabras. */
async function partir(titular: string, f: Fuente, tamano: number): Promise<string[]> {
  const palabras = titular.toUpperCase().split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  for (const palabra of palabras) {
    const actual = lineas.at(-1);
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (actual && (await renglon(prueba, f, tamano, "#ffffff", false)).ancho > TITULAR.ancho) lineas.push(palabra);
    else if (actual) lineas[lineas.length - 1] = prueba;
    else lineas.push(palabra);
  }
  return lineas;
}

/**
 * La base de la pieza: foto ya recortada (1080x1350) + capa fija + titular. Es lo que hace Canva
 * cuando se usa; las etiquetas van aparte (`dibujarEtiquetas`) para poder moverlas sin rehacer esto.
 */
export async function dibujarBase(fotoRecortada: Buffer, titular: string): Promise<{ png: Buffer; avisos: string[] }> {
  const avisos: string[] = [];
  const capas: sharp.OverlayOptions[] = [{ input: path.join(CARPETA, "capa.png"), top: 0, left: 0 }];

  // Titular: baja de tamaño hasta caber en 4 renglones y en el ancho (una palabra sola, como un
  // link, puede ser más ancha que el renglón).
  const f = await fuenteTitular();
  let tamano = TITULAR.tamano;
  let lineas = await partir(titular, f, tamano);
  const demasiadoAncho = async () => {
    for (const l of lineas) if ((await renglon(l, f, tamano, "#ffffff", false)).ancho > TITULAR.ancho) return true;
    return false;
  };
  while ((lineas.length > TITULAR.maxLineas || (await demasiadoAncho())) && tamano > TITULAR.tamanoMinimo) {
    tamano -= 6;
    lineas = await partir(titular, f, tamano);
  }
  if (lineas.length > TITULAR.maxLineas) {
    avisos.push(`El titular ocupa ${lineas.length} renglones aun con la letra más pequeña: acórtalo para que quepa en ${TITULAR.maxLineas}.`);
  }
  const base = await baseDe(f, tamano);
  let angostado = false;
  for (const [i, linea] of lineas.entries()) {
    const lineaBase = TITULAR.top + (i + 1) * TITULAR.interlineado * tamano;
    // Una palabra que no cabe ni con la letra más pequeña se angosta al ancho del renglón.
    const r = await caberEn(linea, f, tamano, TITULAR.color, TITULAR.ancho);
    angostado ||= r.escala < 1;
    capas.push({ input: await hastaElBorde(r.png, ANCHO - TITULAR.left), left: TITULAR.left, top: Math.round(lineaBase - base * r.escala) });
  }
  if (angostado) avisos.push("Una palabra del titular no cabía en el renglón y se achicó: revisa cómo quedó o cámbiala.");

  const png = await sharp(fotoRecortada).composite(capas).png().toBuffer();
  return { png, avisos };
}

/** Las etiquetas encima de la base: el recuadro de la plantilla (girado si la flecha va abajo) y los dos textos centrados. */
export async function dibujarEtiquetas(base: Buffer, etiquetas: Etiqueta[]): Promise<Buffer> {
  if (!etiquetas.length) return base;
  const capas: sharp.OverlayOptions[] = [];
  const recuadroArriba = await sharp(path.join(CARPETA, "etiqueta.png")).png().toBuffer();
  const recuadroAbajo = await sharp(recuadroArriba).rotate(180).png().toBuffer();
  for (const e of etiquetas) {
    capas.push({ input: e.rotacion === 0 ? recuadroArriba : recuadroAbajo, left: Math.round(e.recuadro.left), top: Math.round(e.recuadro.top) });
    const centro = e.recuadro.left + e.recuadro.width / 2;
    const textos = [
      { texto: e.persona, f: NOMBRE, caja: e.nombre },
      ...(e.cargoTexto ? [{ texto: e.cargo, f: CARGO, caja: e.cargoTexto }] : []),
    ];
    for (const t of textos) {
      if (!t.texto) continue;
      // Un nombre muy largo se angosta al ancho del recuadro, menos un margen.
      const r = await caberEn(t.texto, t.f, t.caja.font_size, COLOR_ETIQUETA, e.recuadro.width - 16, true);
      const lineaBase = t.caja.top + 0.95 * t.caja.font_size;
      capas.push({ input: r.png, left: Math.round(centro - r.ancho / 2), top: Math.round(lineaBase - (await baseDe(t.f, t.caja.font_size)) * r.escala) });
    }
  }
  return sharp(base).composite(capas).png().toBuffer();
}

/** Para avisar en la pantalla que se está usando la fuente de respaldo. */
export function usaFuenteDeRespaldo(): boolean {
  return !existsSync(path.join(FUENTES, "MARTIN-Regular.ttf"));
}
