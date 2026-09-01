import { obtenerAccessToken } from "./service-account";

/**
 * Creación de documentos de Google en la unidad compartida.
 *
 * El documento se sube como HTML y se deja que Drive lo convierta a Google Doc
 * (`mimeType: application/vnd.google-apps.document`). Esa conversión importa
 * las imágenes que vengan como data URL directamente incrustadas en el archivo.
 *
 * La alternativa —crear el Doc vacío y meter las fotos con la Docs API— no
 * sirve aquí: `insertInlineImage` sólo acepta una URL que Google pueda
 * descargar, lo que obligaría a subir cada imagen a Drive y hacerla pública.
 */

const DRIVE_FILES = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
const MIME_DOC = "application/vnd.google-apps.document";
const MIME_CARPETA = "application/vnd.google-apps.folder";

export interface DocumentoCreado {
  id: string;
  url: string;
}

function unidadCompartida(): string {
  const unidad = process.env.DRIVE_UNIDAD;

  if (!unidad) {
    throw new Error(
      "Falta DRIVE_UNIDAD: es el id de la unidad compartida donde se archivan los documentos"
    );
  }

  return unidad;
}

/**
 * Las carpetas por mes se reutilizan entre requests; buscarlas cada vez sería
 * una llamada extra a Drive por cada análisis.
 */
const cacheCarpetas = new Map<string, string>();

/**
 * Devuelve el id de una carpeta dentro de `padreId`, creándola si no existe.
 *
 * Dos análisis simultáneos pueden crear la misma carpeta dos veces. Se acepta:
 * Drive permite nombres repetidos y el costo de una carpeta duplicada un día al
 * mes es menor que el de serializar la escritura.
 */
async function obtenerCarpeta(nombre: string, padreId: string): Promise<string> {
  const claveCache = `${padreId}/${nombre}`;
  const cacheada = cacheCarpetas.get(claveCache);
  if (cacheada) return cacheada;

  const token = await obtenerAccessToken();
  const unidad = unidadCompartida();

  const consulta = [
    `name = '${nombre.replace(/'/g, "\'")}'`,
    `mimeType = '${MIME_CARPETA}'`,
    `'${padreId}' in parents`,
    "trashed = false",
  ].join(" and ");

  const parametros = new URLSearchParams({
    q: consulta,
    driveId: unidad,
    corpora: "drive",
    includeItemsFromAllDrives: "true",
    supportsAllDrives: "true",
    fields: "files(id)",
    pageSize: "1",
  });

  const busqueda = await fetch(`${DRIVE_FILES}?${parametros}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (busqueda.ok) {
    const { files } = (await busqueda.json()) as { files?: { id: string }[] };
    if (files?.[0]?.id) {
      cacheCarpetas.set(claveCache, files[0].id);
      return files[0].id;
    }
  }

  const creacion = await fetch(`${DRIVE_FILES}?supportsAllDrives=true&fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: nombre,
      mimeType: MIME_CARPETA,
      parents: [padreId],
    }),
  });

  if (!creacion.ok) {
    const detalle = await creacion.text();
    throw new Error(
      `No se pudo crear la carpeta "${nombre}" (${creacion.status}): ${detalle.slice(0, 300)}`
    );
  }

  const { id } = (await creacion.json()) as { id: string };
  cacheCarpetas.set(claveCache, id);
  return id;
}

/**
 * Sube el HTML y devuelve el Doc convertido.
 *
 * Va por subida reanudable en vez de multipart porque multipart tiene un tope
 * de 5 MB y el HTML lleva las fotos embebidas en base64: con dos o tres
 * capturas de pantalla ya se pasa.
 */
async function subirComoDocumento(
  nombre: string,
  html: string,
  carpetaId: string
): Promise<DocumentoCreado> {
  const token = await obtenerAccessToken();
  const cuerpo = Buffer.from(html, "utf8");

  const inicio = await fetch(
    `${DRIVE_UPLOAD}?uploadType=resumable&supportsAllDrives=true&fields=id,webViewLink`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "text/html",
        "X-Upload-Content-Length": String(cuerpo.byteLength),
      },
      body: JSON.stringify({
        name: nombre,
        mimeType: MIME_DOC,
        parents: [carpetaId],
      }),
    }
  );

  if (!inicio.ok) {
    const detalle = await inicio.text();
    throw new Error(
      `Drive rechazó el inicio de la subida (${inicio.status}): ${detalle.slice(0, 300)}`
    );
  }

  const destino = inicio.headers.get("location");
  if (!destino) {
    throw new Error("Drive no devolvió la URL de subida reanudable");
  }

  const subida = await fetch(destino, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/html; charset=UTF-8",
    },
    body: cuerpo,
  });

  if (!subida.ok) {
    const detalle = await subida.text();
    throw new Error(
      `Drive rechazó el contenido del documento (${subida.status}): ${detalle.slice(0, 300)}`
    );
  }

  const archivo = (await subida.json()) as { id: string; webViewLink?: string };

  return {
    id: archivo.id,
    url:
      archivo.webViewLink ??
      `https://docs.google.com/document/d/${archivo.id}/edit`,
  };
}

/**
 * Crea un documento en la unidad compartida, dentro de
 * `<subcarpeta>/<AAAA-MM>`.
 *
 * El archivo se agrupa por mes para que la unidad siga siendo navegable después
 * de unos cientos de análisis.
 */
export async function crearDocumento({
  nombre,
  html,
  subcarpeta,
  fecha = new Date(),
}: {
  nombre: string;
  html: string;
  subcarpeta: string;
  fecha?: Date;
}): Promise<DocumentoCreado> {
  const unidad = unidadCompartida();

  const carpetaHerramienta = await obtenerCarpeta(subcarpeta, unidad);
  const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
  const carpetaMes = await obtenerCarpeta(mes, carpetaHerramienta);

  return subirComoDocumento(nombre, html, carpetaMes);
}
