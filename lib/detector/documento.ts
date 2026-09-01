import { marked } from "marked";

import type { FormSchema } from "@/app/dashboard/detector-de-mentiras/constants";
import { getRatingPromptValue } from "@/app/dashboard/detector-de-mentiras/constants";

/**
 * Arma el documento de revisión del Detector de mentiras.
 *
 * La fila de `analytics_detector` sirve para consultar y agregar; este
 * documento sirve para que una persona lea un análisis completo —insumos,
 * fotos, prompt y salidas— sin tener que reconstruirlo desde el JSON.
 *
 * Las imágenes van incrustadas como data URL: Drive las convierte en imágenes
 * reales del Doc al importar el HTML. La alternativa, la Docs API, sólo acepta
 * imágenes por URL pública, lo que obligaría a exponer las capturas.
 */

/** Resultado de un modelo, con lo necesario para documentarlo */
export interface SalidaModelo {
  proveedor: string;
  modelo: string;
  texto: string;
  tiempoMs: number;
  uso?: {
    inputTokens?: number | null;
    outputTokens?: number | null;
    totalTokens?: number | null;
    reasoningTokens?: number | null;
    cachedInputTokens?: number | null;
  } | null;
}

/**
 * Topes para no chocar contra los límites de Google Docs.
 *
 * Un Doc admite ~1.020.000 caracteres de texto; pasarse hace que Drive rechace
 * la conversión con un 400 seco. Los binarios de las imágenes no cuentan para
 * ese límite (se vuelven objetos de imagen), pero sí para el tamaño del archivo
 * que se convierte, así que van con su propio tope.
 *
 * Los valores dejan margen de sobra: un análisis normal no llega ni al 10%.
 */
const TOPE_PROMPT = 200_000;
const TOPE_SALIDA = 150_000;
const TOPE_TRANSCRIPCION = 20_000;
const TOPE_EXTRACTO_ENLACE = 1_500;
/** ~20 MB de imágenes ya es un análisis con muchas capturas */
const TOPE_BYTES_IMAGENES = 20 * 1024 * 1024;

/** Recorta dejando constancia, para que nadie lea un texto truncado sin saberlo */
function recortar(texto: string, tope: number): string {
  if (texto.length <= tope) return texto;

  const sobrantes = (texto.length - tope).toLocaleString("es-CO");
  return `${texto.slice(0, tope)}\n\n[...] Recortado para que quepa en un documento de Google: se omitieron ${sobrantes} caracteres.`;
}

const escapar = (valor: unknown): string =>
  String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Convierte el markdown que devuelve el modelo en HTML para el Doc */
const desdeMarkdown = (texto: string): string => {
  if (!texto?.trim()) return "<p><em>Sin contenido</em></p>";

  try {
    return marked.parse(texto, { async: false }) as string;
  } catch {
    // Con el markdown roto es preferible un Doc con el texto plano que ningún Doc.
    return `<pre>${escapar(texto)}</pre>`;
  }
};

/** Texto del usuario como párrafos, respetando los saltos de línea */
const comoParrafos = (texto: string): string => {
  if (!texto?.trim()) return "<p><em>No proporcionado</em></p>";

  return texto
    .split(/\n{2,}/)
    .map((bloque) => `<p>${escapar(bloque).replace(/\n/g, "<br/>")}</p>`)
    .join("");
};

const formatearMs = (ms: number): string =>
  ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`;

/**
 * Separa los adjuntos entre los que se pueden pegar como foto y los que no.
 *
 * Un PDF no se puede incrustar en un Doc, así que de esos sólo queda
 * constancia del nombre.
 */
function clasificarAdjuntos(archivos: any[]) {
  const imagenes: any[] = [];
  const documentos: any[] = [];

  for (const archivo of archivos ?? []) {
    const preview: string | undefined = archivo?.preview;
    if (preview?.startsWith("data:image/")) imagenes.push(archivo);
    else documentos.push(archivo);
  }

  return { imagenes, documentos };
}

/**
 * Adjuntos de una sección: fotos incrustadas y PDFs listados.
 *
 * `presupuesto` lleva la cuenta de los bytes de imagen ya gastados entre las
 * dos secciones del documento; las que no quepan se listan por nombre en vez de
 * incrustarse, para que Drive no rechace la conversión.
 */
function seccionAdjuntos(archivos: any[], presupuesto: { restante: number }): string {
  const { imagenes, documentos } = clasificarAdjuntos(archivos);

  if (imagenes.length === 0 && documentos.length === 0) {
    return "<p><em>Sin archivos adjuntos</em></p>";
  }

  const partes: string[] = [];
  const omitidas: string[] = [];

  for (const imagen of imagenes) {
    const peso: number = imagen.preview.length;

    if (peso > presupuesto.restante) {
      omitidas.push(imagen.name ?? "adjunto");
      continue;
    }

    presupuesto.restante -= peso;
    partes.push(
      `<p><img src="${escapar(imagen.preview)}" alt="${escapar(imagen.name ?? "adjunto")}" /></p>`,
      `<p><small>${escapar(imagen.name ?? "adjunto")}</small></p>`,
    );
  }

  if (omitidas.length > 0) {
    const lista = omitidas.map((nombre) => `<li>${escapar(nombre)}</li>`).join("");
    partes.push(
      `<p><small><strong>Estas imágenes no se incrustaron porque el documento habría superado el tamaño que Google admite:</strong></small></p><ul>${lista}</ul>`,
    );
  }

  if (documentos.length > 0) {
    const lista = documentos
      .map(
        (doc) =>
          `<li>${escapar(doc.name ?? "documento")} (PDF, no se puede incrustar en un Doc)</li>`,
      )
      .join("");
    partes.push(`<ul>${lista}</ul>`);
  }

  return partes.join("");
}

/** Enlaces de una sección, con el contenido que se extrajo de cada uno */
function seccionEnlaces(texto: string, metadata: any): string {
  if (!texto?.trim()) return "<p><em>No proporcionados</em></p>";

  const entradas = Object.entries(metadata ?? {});
  if (entradas.length === 0) return comoParrafos(texto);

  const filas = entradas
    .map(([url, meta]: [string, any]) => {
      const titulo = meta?.title ? escapar(meta.title) : escapar(url);

      const completo = meta?.complete_text ? String(meta.complete_text) : "";
      const extracto = completo
        ? `<p><small>${escapar(completo.slice(0, TOPE_EXTRACTO_ENLACE))}${
            completo.length > TOPE_EXTRACTO_ENLACE ? "…" : ""
          }</small></p>`
        : "";

      const estado =
        meta?.isValid === false
          ? "<p><small><strong>No se pudo leer este enlace.</strong></small></p>"
          : "";

      return `<li><a href="${escapar(url)}">${titulo}</a>${estado}${extracto}</li>`;
    })
    .join("");

  return `<ul>${filas}</ul>`;
}

/** Transcripciones de YouTube aportadas como contexto */
function seccionTranscripciones(
  transcripciones: FormSchema["additional_context"]["transcripts"],
): string {
  const lista = transcripciones ?? [];
  if (lista.length === 0) return "<p><em>Ninguna</em></p>";

  return lista
    .map((video) => {
      const aviso = video.hasTranscript
        ? ""
        : "<p><small><strong>Este video no tenía subtítulos: sólo se incluyó información del video.</strong></small></p>";

      return `<h4>${escapar(video.title || video.url)}</h4>
<p><small>${escapar(video.channel)} · <a href="${escapar(video.url)}">${escapar(video.url)}</a></small></p>
${aviso}
${comoParrafos(recortar(video.text ?? "", TOPE_TRANSCRIPCION))}`;
    })
    .join("");
}

/** Fila de la tabla de métricas de un modelo */
function filaModelo(etiqueta: string, salida: SalidaModelo | null): string {
  if (!salida) {
    return `<tr><td>${escapar(etiqueta)}</td><td colspan="4"><em>No se ejecutó</em></td></tr>`;
  }

  const uso = salida.uso ?? {};

  return `<tr>
<td>${escapar(etiqueta)}</td>
<td>${escapar(salida.proveedor)} · ${escapar(salida.modelo)}</td>
<td>${escapar(formatearMs(salida.tiempoMs))}</td>
<td>${escapar(uso.inputTokens ?? "—")} / ${escapar(uso.outputTokens ?? "—")}</td>
<td>${escapar(uso.totalTokens ?? "—")}</td>
</tr>`;
}

/** Sección con la salida completa de un modelo */
function seccionSalida(etiqueta: string, salida: SalidaModelo | null): string {
  if (!salida) return "";

  return `<h2>${escapar(etiqueta)} — ${escapar(salida.proveedor)} · ${escapar(salida.modelo)}</h2>
<p><small>${escapar(formatearMs(salida.tiempoMs))} · ${escapar(
    salida.uso?.totalTokens ?? "—",
  )} tokens · ${escapar(salida.texto.length)} caracteres</small></p>
${desdeMarkdown(recortar(salida.texto, TOPE_SALIDA))}`;
}

/** Construye el HTML completo del documento de revisión */
export function construirHtmlDocumento({
  datos,
  promptUsuario,
  salida1,
  salida2,
  usuarioEmail,
  fecha = new Date(),
}: {
  datos: FormSchema;
  promptUsuario: string;
  salida1: SalidaModelo | null;
  salida2: SalidaModelo | null;
  usuarioEmail?: string | null;
  fecha?: Date;
}): string {
  const modo = salida2 ? "Comparación de dos modelos" : "Análisis simple";

  // Compartido entre las dos secciones: el tope es del documento, no de cada una.
  const presupuestoImagenes = { restante: TOPE_BYTES_IMAGENES };

  return `<html><head><meta charset="utf-8" /></head><body>
<h1>Detector de mentiras — ${escapar(getRatingPromptValue(datos.rating))}</h1>
<p><small>${escapar(
    fecha.toLocaleString("es-CO", { timeZone: "America/Bogota" }),
  )}${usuarioEmail ? ` · ${escapar(usuarioEmail)}` : ""} · ${escapar(modo)}</small></p>

<h2>Modelos</h2>
<table>
<tr><th>Rol</th><th>Modelo</th><th>Tiempo</th><th>Tokens in/out</th><th>Total</th></tr>
${filaModelo("Principal", salida1)}
${filaModelo("Comparación", salida2)}
</table>

<h2>Desinformación que circula</h2>
<h3>¿De qué trata?</h3>
${comoParrafos(datos.disinformation.description)}
<h3>Calificación</h3>
<p>${escapar(getRatingPromptValue(datos.rating))}</p>
<h3>Enlaces</h3>
${seccionEnlaces(datos.disinformation.text, datos.disinformation.metadata)}
<h3>Archivos</h3>
${seccionAdjuntos(datos.disinformation.images, presupuestoImagenes)}

<h2>Verificación y evidencias</h2>
<h3>Métodos de verificación y enlaces</h3>
${seccionEnlaces(datos.verification.text, datos.verification.metadata)}
<h3>Archivos</h3>
${seccionAdjuntos(datos.verification.images, presupuestoImagenes)}

<h2>Contexto adicional</h2>
${seccionEnlaces(datos.additional_context.text, datos.additional_context.metadata)}
<h3>Videos de YouTube</h3>
${seccionTranscripciones(datos.additional_context.transcripts)}

${seccionSalida("Resultado", salida1)}
${seccionSalida("Resultado del modelo de comparación", salida2)}

<h2>Prompt enviado al modelo</h2>
<p><small>Es el mensaje de usuario tal como lo recibieron los modelos, ya con el contenido de los enlaces incrustado. No incluye el prompt de sistema, que vive en la configuración de la herramienta.</small></p>
<pre>${escapar(recortar(promptUsuario, TOPE_PROMPT))}</pre>
</body></html>`;
}

/**
 * Versión del formulario apta para guardar en `input_completo`.
 *
 * Quita los data URL de los adjuntos —cada uno pesa hasta 5 MB y multiplicaría
 * el tamaño de la fila— y deja sólo con qué se corrió. Las fotos se ven en el
 * documento de Drive.
 */
export function resumirEntrada(datos: FormSchema) {
  const resumirArchivos = (archivos: any[]) =>
    (archivos ?? []).map((archivo) => ({
      nombre: archivo?.name ?? null,
      tamano: archivo?.size ?? null,
      tipo: archivo?.type ?? null,
      mimeType: archivo?.mimeType ?? null,
    }));

  return {
    rating: datos.rating,
    compare: datos.compare,
    disinformation: {
      description: datos.disinformation.description,
      text: datos.disinformation.text,
      metadata: datos.disinformation.metadata ?? null,
      archivos: resumirArchivos(datos.disinformation.images),
    },
    verification: {
      text: datos.verification.text,
      metadata: datos.verification.metadata ?? null,
      archivos: resumirArchivos(datos.verification.images),
    },
    additional_context: {
      text: datos.additional_context.text,
      metadata: datos.additional_context.metadata ?? null,
      transcripts: (datos.additional_context.transcripts ?? []).map((video) => ({
        videoId: video.videoId,
        url: video.url,
        title: video.title,
        channel: video.channel,
        durationSeconds: video.durationSeconds,
        hasTranscript: video.hasTranscript,
        text: video.text,
      })),
    },
  };
}

/** Cuenta los insumos, para las columnas numero_* de la tabla */
export function contarInsumos(datos: FormSchema) {
  const archivos = [
    ...(datos.disinformation.images ?? []),
    ...(datos.verification.images ?? []),
  ];
  const { imagenes, documentos } = clasificarAdjuntos(archivos);

  const enlaces = new Set(
    [
      datos.disinformation.metadata,
      datos.verification.metadata,
      datos.additional_context.metadata,
    ].flatMap((metadata) => Object.keys(metadata ?? {})),
  );

  return {
    numero_imagenes: imagenes.length,
    numero_pdfs: documentos.length,
    numero_enlaces: enlaces.size,
    numero_transcripciones: (datos.additional_context.transcripts ?? []).length,
  };
}

/** Nombre del archivo en Drive: legible y ordenable por fecha */
export function nombreDocumento(datos: FormSchema, fecha = new Date()): string {
  const marca = fecha.toISOString().slice(0, 16).replace("T", " ").replace(":", "h");

  const asunto = (datos.disinformation.description ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 70);

  return `${marca} · ${getRatingPromptValue(datos.rating)} · ${asunto || "sin descripción"}`;
}
