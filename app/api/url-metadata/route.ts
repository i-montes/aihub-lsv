import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { TwitterResponse, UrlMetadata } from "./types";
import { scrapeWebsite } from "./scraper";



// Función para detectar URLs de Twitter/X
export function isTwitterUrl(url: string): boolean {
  const twitterPatterns = [
    /(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/,
    /(?:t\.co)\/(\w+)/,
  ];
  return twitterPatterns.some((pattern) => pattern.test(url));
}

// Función para extraer tweet ID de URL
function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/);
  return match ? match[1] : null;
}

// Función para obtener datos de Twitter usando RapidAPI
async function getTwitterData(tweetId: string): Promise<TwitterResponse> {
  try {
    const response = await fetch(
      `https://twitter-api45.p.rapidapi.com/tweet.php?id=${tweetId}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
          "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      console.log(await response.text());
      throw new Error(
        `Twitter API error: ${response.status} Twitter ID: ${tweetId}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Twitter data:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { urls }: { urls: string[] } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "Se requiere un array de URLs" },
        { status: 400 }
      );
    }

    const results: UrlMetadata[] = await Promise.all(
      urls.map(async (url) => {
        try {
          // Validar y normalizar URL
          const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

          // Verificar si es una URL de Twitter/X
          const isTwitter = isTwitterUrl(normalizedUrl);

          if (isTwitter) {
            const tweetId = extractTweetId(normalizedUrl);

            if (tweetId) {
              try {
                const twitterData = await getTwitterData(tweetId);

                const images = twitterData?.entities?.media?.filter((item: any) => item.type === "photo") || [];
                const videos = twitterData?.entities?.media?.filter((item: any) => item.type === "video") || [];

                return {
                  url: normalizedUrl,
                  statusCode: 200,
                  isValid: true,
                  isTwitter: true,
                  text: twitterData.text,
                  username: twitterData.author.screen_name,
                  name: twitterData.author.name,
                  author_image: twitterData.author.image,
                  follower_count: twitterData.author.sub_count,
                  like_count: twitterData.likes,
                  retweet_count: twitterData.retweets,
                  creation_date: new Date(twitterData.created_at || ""),
                  media_image:`${images && images.length > 0 ? `Contiene ${images.length} imagen(es)` : ""}`,
                  media_video: `${videos && videos.length > 0 ? `Contiene ${videos.length} video(s)` : ""}`,
                  complete_response: twitterData,
                };
              } catch (twitterError) {
                console.error("Error fetching Twitter data:", twitterError);
                return {
                  url: normalizedUrl,
                  statusCode: 0,
                  isValid: false,
                  isTwitter: true,
                  error: "Twitter API failed",
                };
              }
            }
          }

          // Procesamiento regular para URLs no-Twitter o cuando falla la API de Twitter
          // Realizar solicitud HTTP con timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

          const response = await fetch(normalizedUrl, {
            method: "GET",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const statusCode = response.status;
          const isValid = statusCode === 200;

          if (!isValid) {
            return {
              url: normalizedUrl,
              statusCode,
              isValid: false,
              error: `HTTP ${statusCode}`,
              isTwitter: isTwitter, // Preservar el valor detectado
            };
          }

          // Obtener contenido HTML
          const html = await response.text();
          const dom = new JSDOM(html);
          const document = dom.window.document;

          const result = await scrapeWebsite({ url: normalizedUrl });

          // Extraer metadatos
          const metadata: UrlMetadata = {
            url: normalizedUrl,
            statusCode,
            isValid: true,
            isTwitter: isTwitter, // Preservar el valor detectado
            text: result.text,
            title: result.title,
            description: result.description,
            complete_text: result.text,
          };

          
          let imageUrl = result.imageUrl;
          // Convertir URL relativa a absoluta si es necesario
          if (result.imageUrl && !result.imageUrl.startsWith("http")) {
            try {
              const baseUrl = new URL(normalizedUrl);
              imageUrl = new URL(imageUrl as string, baseUrl.origin).href;
            } catch {
              imageUrl = undefined;
            }
          }

          metadata.image = imageUrl || undefined;

          return metadata;
        } catch (error) {
          console.error(`Error analyzing URL ${url}:`, error);
          const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
          const isTwitterDetected = isTwitterUrl(normalizedUrl);
          return {
            url: normalizedUrl,
            statusCode: 0,
            isValid: false,
            isTwitter: isTwitterDetected, // Preservar detección de Twitter incluso en errores
            error: error instanceof Error ? error.message : "Error desconocido",
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in URL metadata API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
