import { NextRequest, NextResponse } from "next/server";

import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import {
  extractVideoId,
  getYouTubeMetadata,
  isYouTubeUrl,
} from "@/app/api/url-metadata/youtube";

/** Máximo de videos que se transcriben en una sola petición */
const MAX_URLS_PER_REQUEST = 5;

interface TranscriptResult {
  url: string;
  videoId?: string;
  title?: string;
  channel?: string;
  durationSeconds?: number;
  thumbnail?: string;
  /** Info del video + transcripción, tal como se inyecta en el prompt */
  text?: string;
  /** true si se obtuvieron los subtítulos reales */
  hasTranscript?: boolean;
  /** Aviso cuando no hubo subtítulos y solo se incluyó la info del video */
  warning?: string;
  error?: string;
}

/**
 * POST /api/youtube-transcript
 * Recibe `{ urls: string[] }` y devuelve, por cada video, la información del
 * video junto con su transcripción.
 *
 * Si YouTube no entrega los subtítulos, no se falla: se devuelve igualmente la
 * información del video (datos, canal y comentarios destacados) con un
 * `warning`, que es el mismo comportamiento del detector de referencia.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteHandler();
    const {
      data: { user },
      error: userAuthError,
    } = await supabase.auth.getUser();

    if (userAuthError || !user) {
      return NextResponse.json(
        { success: false, error: "No hay usuario autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const urls: unknown = body?.urls;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: "Se requiere un array de URLs" },
        { status: 400 }
      );
    }

    if (urls.length > MAX_URLS_PER_REQUEST) {
      return NextResponse.json(
        {
          success: false,
          error: `Puedes transcribir un máximo de ${MAX_URLS_PER_REQUEST} videos a la vez`,
        },
        { status: 400 }
      );
    }

    const results: TranscriptResult[] = await Promise.all(
      urls
        .filter((url): url is string => typeof url === "string")
        .map(async (rawUrl): Promise<TranscriptResult> => {
          const url = rawUrl.trim();

          if (!isYouTubeUrl(url)) {
            return { url, error: "La URL no es de un video de YouTube" };
          }

          try {
            const video = await getYouTubeMetadata(url);

            return {
              url,
              videoId: video.videoId ?? extractVideoId(url) ?? undefined,
              title: video.title,
              channel: video.channel,
              durationSeconds: video.durationSeconds ?? 0,
              thumbnail: video.image,
              text: video.complete_text,
              hasTranscript: video.hasTranscript,
              warning: video.warning,
            };
          } catch (error) {
            return {
              url,
              error:
                error instanceof Error ? error.message : "Error desconocido",
            };
          }
        })
    );

    return NextResponse.json({
      success: true,
      results,
      failed: results.filter((result) => result.error).length,
    });
  } catch (error) {
    console.error("Error en POST /api/youtube-transcript:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
