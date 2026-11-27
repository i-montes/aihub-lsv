import sharp from "sharp";
import { generateObject } from "ai";
import { z } from "zod";

import { guardarArchivo, leerArchivo } from "@/lib/en-vivo/almacen";
import { ALTO, ANCHO, type Caja, type Encuadre } from "@/lib/en-vivo/geometria";
import type { ContextoModelo } from "@/lib/en-vivo/modelo";
import { PESTANA_FOTO, pestanaPrompt } from "@/lib/en-vivo/prompt-base";
import type { EtiquetaPedida, Nota, Pieza } from "@/lib/en-vivo/tipos";
import { MAX_OUTPUT_TOKENS } from "@/lib/proveedores/opciones-modelo";

// Portado de envivo-web (lib/foto.ts y lib/fotos.ts). La foto se normaliza una vez (orientación
// EXIF, tamaño) y se guarda: el modelo la mira en esas mismas proporciones y el recorte final sale
// de ella, así que las coordenadas siempre coinciden.

/** Tope de la foto guardada, de la que sale el recorte de 1080x1350. */
const LADO_MAXIMO = 2400;
/** Lo que mira el modelo: suficiente para ubicar cabezas y barato en tokens. */
const LADO_VISTA = 1200;
/** Bytes que puede traer una foto subida por el editor (ya reducida en el navegador). */
const MAXIMO_SUBIDA = 4 * 1024 * 1024;
/** Bytes que puede pesar la foto destacada de la nota (la original de WordPress, sin reducir). */
const MAXIMO_NOTA = 25 * 1024 * 1024;

export type FotoPreparada = NonNullable<Pieza["foto"]>;

async function normalizar(original: Buffer, nombre: string): Promise<FotoPreparada> {
  const { data, info } = await sharp(original)
    .rotate() // respeta la orientación EXIF, como Canva
    .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer({ resolveWithObject: true });
  const archivo = await guardarArchivo(data, "jpg");
  return { archivo, ancho: info.width, alto: info.height, nombre };
}

/** El cuerpo de la respuesta, o `null` si pasa de `maximo` bytes (deja de leer en ese momento). */
async function leerHasta(r: Response, maximo: number): Promise<Buffer | null> {
  if (!r.body) return null;
  const partes: Uint8Array[] = [];
  let total = 0;
  const lector = r.body.getReader();
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.length;
    if (total > maximo) {
      await lector.cancel().catch(() => {});
      return null;
    }
    partes.push(value);
  }
  return Buffer.concat(partes);
}

/** La foto destacada de la nota, en alta si se puede. `null` si no se pudo bajar ninguna. */
export async function fotoDeLaNota(nota: Nota): Promise<FotoPreparada | null> {
  for (const url of [...new Set([nota.fotoAlta, nota.foto])].filter(Boolean)) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(20_000) });
      if (!r.ok || !(r.headers.get("content-type") ?? "").startsWith("image/")) continue;
      if (Number(r.headers.get("content-length") ?? 0) > MAXIMO_NOTA) continue;
      const datos = await leerHasta(r, MAXIMO_NOTA);
      if (!datos) continue;
      return await normalizar(datos, decodeURIComponent(url.split("/").pop() ?? "foto"));
    } catch {
      continue;
    }
  }
  return null;
}

/** Una foto que sube el editor, como data URL. */
export async function fotoSubida(dataUrl: string, nombre: string): Promise<FotoPreparada> {
  const m = /^data:image\/[a-z+.-]+;base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!m) throw new Error("No se pudo leer la foto: usa un JPG, PNG o WebP.");
  const original = Buffer.from(m[1], "base64");
  if (original.length > MAXIMO_SUBIDA) throw new Error("La foto pesa demasiado: usa una de menos de 4 MB.");
  try {
    return await normalizar(original, nombre || "foto");
  } catch {
    throw new Error("No se pudo leer la foto: usa un JPG, PNG o WebP.");
  }
}

const Analisis = z.object({
  cabezas: z.array(z.object({ x1: z.number(), y1: z.number(), x2: z.number(), y2: z.number() })),
  etiquetas: z.array(z.object({ indice: z.number(), persona: z.string(), cargo: z.string() })),
  motivo: z.string(),
});

/**
 * Dónde están las cabezas y a quién se etiqueta. Las cabezas vuelven en fracciones de la foto,
 * que es como las usa la geometría.
 */
export async function analizarFoto(
  foto: FotoPreparada,
  nota: Nota,
  texto: string,
  ctx: ContextoModelo,
): Promise<{ cabezas: Caja[]; etiquetas: EtiquetaPedida[]; motivo: string }> {
  const original = await leerArchivo(foto.archivo);
  if (!original) throw new Error("Se perdió la foto guardada: vuelve a generar.");
  const { data: vista, info } = await sharp(original)
    .resize({ width: LADO_VISTA, height: LADO_VISTA, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer({ resolveWithObject: true });

  const instrucciones = pestanaPrompt(ctx.pestanas, PESTANA_FOTO);
  const { object, usage } = await generateObject({
    model: ctx.model,
    schema: Analisis,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: ctx.providerOptions,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", image: vista, mediaType: "image/jpeg" },
          {
            type: "text",
            text: `${instrucciones}

La imagen mide ${info.width}x${info.height} píxeles.

Titular: ${nota.titular}
Nombre del archivo de la foto: ${foto.nombre}
Pie de foto: ${nota.pie || "(no tiene)"}
Etiquetas de la nota: ${nota.etiquetas || "(no tiene)"}

Texto de la nota:
<texto>
${texto.slice(0, 4000)}
</texto>`,
          },
        ],
      },
    ],
  });
  ctx.registrar(usage);

  const cabezas = object.cabezas
    .map((c) => ({
      x1: Math.max(0, c.x1) / info.width,
      y1: Math.max(0, c.y1) / info.height,
      x2: Math.min(info.width, c.x2) / info.width,
      y2: Math.min(info.height, c.y2) / info.height,
    }))
    .filter((c) => c.x2 > c.x1 && c.y2 > c.y1);
  const etiquetas = object.etiquetas
    .filter((e) => e.persona.trim() && cabezas[e.indice])
    .slice(0, 2)
    .map((e) => ({ indice: e.indice, persona: e.persona.trim(), cargo: e.cargo.trim().slice(0, 30) }));

  return { cabezas, etiquetas, motivo: object.motivo };
}

/**
 * El recorte de la foto al lienzo (1080x1350), con el encuadre que calculó la geometría. Así a
 * Canva le llega la foto ya encuadrada sobre la cara y no recorta por su cuenta.
 */
export async function recortarAlLienzo(foto: FotoPreparada, e: Encuadre): Promise<Buffer> {
  const original = await leerArchivo(foto.archivo);
  if (!original) throw new Error("Se perdió la foto guardada: vuelve a generar.");
  const width = Math.round(e.width);
  const height = Math.round(e.height);
  const left = Math.min(Math.max(Math.round(-e.left), 0), width - ANCHO);
  const top = Math.min(Math.max(Math.round(-e.top), 0), height - ALTO);
  return sharp(original)
    .resize({ width, height, fit: "fill" })
    .extract({ left, top, width: ANCHO, height: ALTO })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/** Lienzo gris, para notas sin foto. */
export async function lienzoVacio(): Promise<Buffer> {
  return sharp({ create: { width: ANCHO, height: ALTO, channels: 3, background: "#3a3a3a" } }).jpeg().toBuffer();
}
