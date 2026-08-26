import { NextRequest, NextResponse } from "next/server";

import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import {
  getYouTubeTranscript,
  isTranscriptError,
  type YoutubeTranscriptResult,
} from "@/lib/youtube/transcript";

/** Máximo de videos que se transcriben en una sola petición */
const MAX_URLS_PER_REQUEST = 5;

/**
 * POST /api/youtube-transcript
 * Recibe `{ urls: string[] }` y devuelve la transcripción de cada video.
 * Los videos que fallen se devuelven con su propio `error`, sin tumbar el resto.
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

    const results: YoutubeTranscriptResult[] = await Promise.all(
      urls
        .filter((url): url is string => typeof url === "string")
        .map((url) => getYouTubeTranscript(url))
    );

    return NextResponse.json({
      success: true,
      results,
      failed: results.filter(isTranscriptError).length,
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
