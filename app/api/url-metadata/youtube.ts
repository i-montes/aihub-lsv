// Clientes de la API interna (innertube) de YouTube. ANDROID es el más confiable
// para obtener las pistas de subtítulos desde el servidor.
const INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const INNERTUBE_CLIENTS = [
  { clientName: "ANDROID", clientVersion: "20.10.38" },
  { clientName: "IOS", clientVersion: "20.10.4" },
  { clientName: "WEB", clientVersion: "2.20240726.00.00" },
];

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^&\s]+)/,
  /youtube\.com\/shorts\/([^&\s]+)/,
];

/**
 * Detecta si una URL apunta a un video de YouTube (incluidos shorts y youtu.be)
 */
export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Extrae el ID del video de los distintos formatos de URL de YouTube
 */
export function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Decodifica las entidades HTML que aparecen en los subtítulos
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCharCode(Number.parseInt(n)));
}

// Convierte el XML de timedtext (<p t d>...<s>...</s></p>) en texto plano
function parseTimedText(xml: string): string {
  const paragraphs = [...xml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)];
  return paragraphs
    .map((m) => {
      let inner = m[1];
      // Los subtítulos automáticos dividen el texto en segmentos <s>
      if (inner.includes("<s")) {
        inner = [...inner.matchAll(/<s[^>]*>([\s\S]*?)<\/s>/g)]
          .map((x) => x[1])
          .join("");
      }
      return decodeEntities(inner.replace(/<[^>]+>/g, "")).trim();
    })
    .filter(Boolean)
    .join(" ");
}

// Obtiene las pistas de subtítulos disponibles usando la API interna de YouTube
async function getCaptionTracks(videoId: string): Promise<any[]> {
  for (const client of INNERTUBE_CLIENTS) {
    try {
      const res = await fetch(
        `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: { client: { ...client, hl: "es" } },
            videoId,
          }),
        }
      );
      const data = await res.json();
      const tracks =
        data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      if (tracks.length > 0) return tracks;
    } catch {
      // Probar con el siguiente cliente
    }
  }

  // Fallback: extraer las pistas desde el HTML de la página del video
  try {
    const res = await fetch(
      `https://www.youtube.com/watch?v=${videoId}&hl=es`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          "Accept-Language": "es-ES,es;q=0.9",
        },
      }
    );
    const html = await res.text();
    const match = html.match(/"captionTracks":(\[.*?\])/);
    if (match) return JSON.parse(match[1]);
  } catch {
    // Sin pistas disponibles
  }

  return [];
}

// Obtiene la transcripción priorizando español, luego inglés, luego cualquiera
async function fetchTranscript(videoId: string): Promise<string | null> {
  const tracks = await getCaptionTracks(videoId);
  if (tracks.length === 0) return null;

  const pick =
    tracks.find((t: any) => t.languageCode?.startsWith("es")) ||
    tracks.find((t: any) => t.languageCode?.startsWith("en")) ||
    tracks[0];

  if (!pick?.baseUrl) return null;

  const xml = await (await fetch(pick.baseUrl)).text();
  const text = parseTimedText(xml);
  return text.length > 0 ? text : null;
}

// Formatea la duración ISO 8601 a algo legible en español
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return isoDuration;

  const hours = match[1] ? Number.parseInt(match[1]) : 0;
  const minutes = match[2] ? Number.parseInt(match[2]) : 0;
  const seconds = match[3] ? Number.parseInt(match[3]) : 0;

  let formatted = "";
  if (hours > 0) formatted += `${hours} hora${hours !== 1 ? "s" : ""} `;
  if (minutes > 0) formatted += `${minutes} minuto${minutes !== 1 ? "s" : ""} `;
  if (seconds > 0) formatted += `${seconds} segundo${seconds !== 1 ? "s" : ""}`;

  return formatted.trim();
}

const formatNumber = (num: number): string => num.toLocaleString("es-ES");

const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * Arma el bloque de texto con toda la información recopilada del video.
 * Es lo que se inyecta en el prompt como contenido del enlace.
 */
function formatVideoInformation(
  videoInfo: any,
  channelInfo: any | null,
  comments: { author: string; text: string; likeCount: number }[],
  transcription: string | null
): string {
  let summary = `INFORMACIÓN DEL VIDEO DE YOUTUBE:

Título: ${videoInfo.snippet.title}
Canal: ${videoInfo.snippet.channelTitle}
Fecha de publicación: ${formatDate(videoInfo.snippet.publishedAt)}
`;

  if (videoInfo.contentDetails?.duration) {
    summary += `Duración: ${formatDuration(videoInfo.contentDetails.duration)}\n`;
  }

  if (videoInfo.statistics) {
    const { viewCount, likeCount, commentCount } = videoInfo.statistics;
    if (viewCount) summary += `Vistas: ${formatNumber(Number.parseInt(viewCount))}\n`;
    if (likeCount) summary += `Likes: ${formatNumber(Number.parseInt(likeCount))}\n`;
    if (commentCount)
      summary += `Comentarios: ${formatNumber(Number.parseInt(commentCount))}\n`;
  }

  summary += `
Descripción:
${videoInfo.snippet.description || "No hay descripción disponible."}
`;

  if (channelInfo) {
    summary += `
INFORMACIÓN DEL CANAL:
Nombre: ${channelInfo.snippet.title}
`;

    const { subscriberCount, videoCount } = channelInfo.statistics || {};
    if (subscriberCount)
      summary += `Suscriptores: ${formatNumber(Number.parseInt(subscriberCount))}\n`;
    if (videoCount)
      summary += `Total de videos: ${formatNumber(Number.parseInt(videoCount))}\n`;

    if (channelInfo.snippet.description) {
      const desc = channelInfo.snippet.description;
      summary += `Descripción: ${desc.length > 200 ? desc.substring(0, 200) + "..." : desc}\n`;
    }
  }

  if (comments.length > 0) {
    summary += `\nCOMENTARIOS DESTACADOS:\n`;
    comments.forEach((comment, index) => {
      const cleanText = comment.text.replace(/<[^>]*>?/gm, "");
      summary += `${index + 1}. ${comment.author}: ${cleanText.substring(0, 200)}${
        cleanText.length > 200 ? "..." : ""
      }\n`;
    });
  }

  if (transcription) {
    summary += `\nTRANSCRIPCIÓN DEL VIDEO:\n${transcription}\n`;
  } else {
    summary += `\nTRANSCRIPCIÓN: No disponible para este video. YouTube no proporciona subtítulos para este contenido.\n`;
  }

  summary += `\nURL del video: https://www.youtube.com/watch?v=${videoInfo.id}`;

  return summary;
}

export interface YouTubeMetadata {
  title?: string;
  description?: string;
  image?: string;
  /** Texto completo (info del video + transcripción) para inyectar en el prompt */
  complete_text: string;
  /** Advertencia cuando no hubo subtítulos disponibles */
  warning?: string;
  /** ID del video, para identificarlo sin volver a parsear la URL */
  videoId?: string;
  /** Nombre del canal */
  channel?: string;
  /** Duración del video en segundos (0 si no se pudo determinar) */
  durationSeconds?: number;
  /** true si se pudo extraer la transcripción real de los subtítulos */
  hasTranscript?: boolean;
}

/** Convierte una duración ISO 8601 (ej. "PT1H2M19S") a segundos */
function isoDurationToSeconds(duration: string): number {
  const match = duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h || 0) * 3600 + Number(m || 0) * 60 + Number(s || 0);
}

/**
 * Obtiene información del video de YouTube y su transcripción.
 * Si no hay subtítulos, devuelve igualmente los datos del video para que el
 * modelo tenga contexto, junto con una advertencia.
 */
export async function getYouTubeMetadata(
  url: string
): Promise<YouTubeMetadata> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("URL de video de YouTube inválida");
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY no está configurada");
  }

  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
  );

  if (!videoRes.ok) {
    throw new Error(`Error al consultar la API de YouTube: ${videoRes.status}`);
  }

  const videoData = await videoRes.json();
  if (!videoData.items || videoData.items.length === 0) {
    throw new Error("Video no encontrado. Verifica que la URL sea correcta.");
  }

  const videoInfo = videoData.items[0];

  // La info del canal y los comentarios son opcionales: si fallan, seguimos
  const [channelInfo, comments] = await Promise.all([
    fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${videoInfo.snippet.channelId}&key=${apiKey}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.items?.[0] ?? null)
      .catch(() => null),
    fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=5&order=relevance&key=${apiKey}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data) =>
          data?.items?.map((item: any) => ({
            author: item.snippet.topLevelComment.snippet.authorDisplayName,
            text: item.snippet.topLevelComment.snippet.textDisplay,
            likeCount: item.snippet.topLevelComment.snippet.likeCount,
          })) ?? []
      )
      .catch(() => []),
  ]);

  let transcription: string | null = null;
  try {
    transcription = await fetchTranscript(videoId);
  } catch (error) {
    console.error("Error al obtener la transcripción de YouTube:", error);
  }

  return {
    title: videoInfo.snippet.title,
    description: videoInfo.snippet.description,
    image:
      videoInfo.snippet.thumbnails?.high?.url ||
      videoInfo.snippet.thumbnails?.default?.url,
    videoId,
    channel: videoInfo.snippet.channelTitle,
    durationSeconds: isoDurationToSeconds(
      videoInfo.contentDetails?.duration ?? ""
    ),
    hasTranscript: Boolean(transcription),
    complete_text: formatVideoInformation(
      videoInfo,
      channelInfo,
      comments,
      transcription
    ),
    warning: transcription
      ? undefined
      : "Los subtítulos están deshabilitados o no disponibles para este video. Se incluyó solo la información del video.",
  };
}
