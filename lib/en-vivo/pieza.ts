import { createHash } from "crypto";
import sharp from "sharp";

import { esIdValido, guardarArchivo, leerArchivo } from "@/lib/en-vivo/almacen";
import { armarEnCanva } from "@/lib/en-vivo/canva";
import { conexionCanva } from "@/lib/en-vivo/conexiones";
import { dibujarBase, dibujarEtiquetas } from "@/lib/en-vivo/plantilla";
import { analizarFoto, fotoDeLaNota, fotoSubida, lienzoVacio, recortarAlLienzo } from "@/lib/en-vivo/foto";
import { ALTO, componerConAjustes, SIN_AJUSTES } from "@/lib/en-vivo/geometria";
import type { ContextoModelo } from "@/lib/en-vivo/modelo";
import { leerNota, textoPost } from "@/lib/en-vivo/nota";
import type { Nota, Pieza } from "@/lib/en-vivo/tipos";

export type Progreso = (paso: string) => void;

const slug = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "pieza";

const num = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(v, min), max) : 0);
const txt = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const lista = <T>(v: unknown, max: number, f: (x: any) => T): T[] => (Array.isArray(v) ? v.slice(0, max).map(f) : []);
const idOk = (v: unknown) => (typeof v === "string" && esIdValido(v) ? v : null);

/**
 * La pieza que manda el navegador (en /cambios), limpia: largos y números acotados, ids de archivo
 * válidos, y el tamaño de la foto leído del archivo guardado, no el que dice el navegador. Con
 * medidas falsas, sharp falla con errores raros; así se trabaja siempre con las reales.
 */
export async function piezaConfiable(p: Pieza): Promise<Pieza> {
  let foto: Pieza["foto"] = null;
  const archivo = idOk(p.foto?.archivo);
  if (archivo) {
    const datos = await leerArchivo(archivo);
    if (!datos) throw new Error("Se perdió la foto guardada: vuelve a generar la pieza.");
    const { width, height } = await sharp(datos).metadata();
    if (!width || !height) throw new Error("No se pudo leer la foto guardada: vuelve a generar la pieza.");
    foto = { archivo, ancho: width, alto: height, nombre: txt(p.foto?.nombre, 200) };
  }
  const cabezas = lista(p.cabezas, 20, (c) => ({ x1: num(c?.x1, 0, 1), y1: num(c?.y1, 0, 1), x2: num(c?.x2, 0, 1), y2: num(c?.y2, 0, 1) }));
  const base = idOk(p.base?.archivo);
  return {
    ...p,
    url: txt(p.url, 1000),
    titularNota: txt(p.titularNota, 400),
    titular: txt(p.titular, 300),
    texto: txt(p.texto, 5000),
    foto,
    cabezas,
    etiquetas: lista(p.etiquetas, 10, (e) => ({ indice: Math.trunc(num(e?.indice, 0, 19)), persona: txt(e?.persona, 80), cargo: txt(e?.cargo, 120) })).filter(
      (e) => e.indice < cabezas.length,
    ),
    ajustes: {
      foto: { dx: num(p.ajustes?.foto?.dx, -ALTO, ALTO), dy: num(p.ajustes?.foto?.dy, -ALTO, ALTO) },
      etiquetas: lista(p.ajustes?.etiquetas, 20, (a) => ({ indice: Math.trunc(num(a?.indice, 0, 19)), dx: num(a?.dx, -ALTO, ALTO), dy: num(a?.dy, -ALTO, ALTO) })),
    },
    base: base ? { archivo: base, huella: txt(p.base?.huella, 64), avisos: lista(p.base?.avisos, 10, (a) => txt(a, 300)) } : null,
    imagen: idOk(p.imagen),
    motor: p.motor === "canva" ? "canva" : "plantilla",
    diseno: p.diseno && typeof p.diseno.id === "string" ? { id: txt(p.diseno.id, 100), editUrl: typeof p.diseno.editUrl === "string" ? txt(p.diseno.editUrl, 500) : null } : null,
    avisos: lista(p.avisos, 20, (a) => txt(a, 300)),
    avisosGeometria: lista(p.avisosGeometria, 20, (a) => txt(a, 300)),
  };
}

/**
 * De una pieza (parámetros) a su imagen. La base (foto, capa fija y titular) sólo se rehace si
 * cambió la foto, el encuadre o el titular; si sólo cambiaron las etiquetas, se redibujan sobre la
 * base guardada.
 *
 * La base se arma en el servidor con la plantilla de la casa (plantilla.ts). Canva sólo se usa si
 * la organización configuró una service app en Ajustes; es el plan B, no el camino normal.
 */
export async function armar(pieza: Pieza, organizationId: string, progreso: Progreso): Promise<Pieza> {
  const pedidas = pieza.etiquetas;
  const g = pieza.foto
    ? componerConAjustes(pieza.foto.ancho, pieza.foto.alto, pieza.cabezas, pedidas, pieza.ajustes)
    : null;
  const encuadre = g?.encuadre ?? null;
  const ubicadas = g?.etiquetas ?? [];

  const huella = createHash("sha256")
    .update(JSON.stringify([pieza.foto?.archivo ?? null, encuadre, pieza.titular]))
    .digest("hex")
    .slice(0, 16);

  let { base, motor, diseno } = pieza;
  let fondo = base?.huella === huella ? await leerArchivo(base.archivo) : null;

  if (!fondo) {
    const recorte = pieza.foto && encuadre ? await recortarAlLienzo(pieza.foto, encuadre) : await lienzoVacio();
    const canva = await conexionCanva(organizationId);
    if (canva) {
      progreso("Armando la pieza en Canva");
      const r = await armarEnCanva(canva, recorte, pieza.titular, slug(pieza.titularNota));
      fondo = r.png;
      motor = "canva";
      diseno = r.diseno;
      base = { archivo: await guardarArchivo(fondo, "png"), huella, avisos: [] };
    } else {
      progreso("Armando la pieza con la plantilla");
      const r = await dibujarBase(recorte, pieza.titular);
      fondo = r.png;
      motor = "plantilla";
      diseno = null;
      base = { archivo: await guardarArchivo(fondo, "png"), huella, avisos: r.avisos };
    }
  }

  progreso("Poniendo las etiquetas");
  const final = await dibujarEtiquetas(fondo, ubicadas);
  const imagen = await guardarArchivo(final, "png");

  return { ...pieza, encuadre, ubicadas, base, imagen, motor, diseno, avisosGeometria: [...(g?.avisos ?? []), ...(base?.avisos ?? [])] };
}

export type PedidoGenerar = {
  url: string;
  /** Foto propia del editor, como data URL. Si no viene, se usa la de la nota. */
  foto?: { datos: string; nombre: string } | null;
  /** Texto ya editado, para "cambiar foto" sin perder lo que el editor escribió. */
  texto?: string | null;
};

/** Pieza nueva desde el link. `alLeer` recibe la nota y el texto apenas están, antes de la imagen. */
export async function generar(
  pedido: PedidoGenerar,
  organizationId: string,
  ctx: ContextoModelo,
  progreso: Progreso,
  alLeer: (nota: Nota, texto: string) => void,
): Promise<Pieza> {
  progreso("Leyendo la nota");
  const nota = await leerNota(pedido.url, organizationId);

  const avisos: string[] = [];
  let texto = pedido.texto?.trim() || "";
  if (!texto) {
    const t = await textoPost(nota, ctx, () => progreso("Resumiendo el texto del post"));
    texto = t.texto;
    if (t.aviso) avisos.push(t.aviso);
  }
  alLeer(nota, texto);

  progreso(pedido.foto ? "Preparando tu foto" : "Bajando la foto de la nota");
  // Una foto propia describe otra escena: el pie de la nota ya no aplica.
  const foto = pedido.foto ? await fotoSubida(pedido.foto.datos, pedido.foto.nombre) : await fotoDeLaNota(nota);
  const notaParaFoto = pedido.foto ? { ...nota, pie: "" } : nota;

  let cabezas: Pieza["cabezas"] = [];
  let etiquetas: Pieza["etiquetas"] = [];
  if (foto) {
    progreso("Mirando quién sale en la foto");
    const a = await analizarFoto(foto, notaParaFoto, nota.parrafos.join("\n\n"), ctx);
    cabezas = a.cabezas;
    etiquetas = a.etiquetas;
    if (a.motivo) avisos.push(a.motivo);
  } else {
    avisos.push("No se pudo bajar la foto de la nota: sube una.");
  }

  const pieza: Pieza = {
    url: nota.url,
    titularNota: nota.titular,
    titular: nota.titular,
    texto,
    foto,
    cabezas,
    etiquetas,
    ajustes: SIN_AJUSTES,
    encuadre: null,
    ubicadas: [],
    base: null,
    imagen: null,
    motor: "plantilla",
    diseno: null,
    avisos,
    avisosGeometria: [],
  };
  return armar(pieza, organizationId, progreso);
}
