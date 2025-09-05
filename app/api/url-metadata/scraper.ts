"use server"

import { load } from "cheerio"

// Interfaces para tipado de la función scrapeWebsite
interface ScrapeWebsiteParams {
  url: string
}

interface ScrapeWebsiteResponse {
  text?: string
  title?: string
  description?: string
  imageUrl?: string
  url?: string
  error?: string
  isPdf?: boolean
}

export async function scrapeWebsite({ url }: ScrapeWebsiteParams): Promise<ScrapeWebsiteResponse> {
  try {
    if (!url) {
      return { error: "URL no proporcionada" }
    }

    // Validar que la URL sea válida
    try {
      new URL(url)
    } catch (e) {
      return { error: "URL inválida" }
    }

    // Verificar si la URL es un PDF basado en la extensión
    const isPdfByExtension = url.toLowerCase().endsWith(".pdf")

    // Si es un PDF por extensión, devolver un mensaje informativo
    if (isPdfByExtension) {
      return {
        text: "Este enlace apunta a un documento PDF. El contenido no puede ser extraído automáticamente. Por favor, descargue y revise el documento manualmente.",
        title: "Documento PDF",
        url,
        isPdf: true,
      }
    }

    // Configurar opciones de fetch con un timeout y headers más completos
    const fetchOptions = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 15000, // 15 segundos de timeout
      next: { revalidate: 0 }, // No cachear la respuesta
    }

    // Hacer la solicitud a la URL con manejo de errores mejorado
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))

      // Verificar si el tipo de contenido indica que es un PDF
      const contentType = response.headers.get("content-type") || ""
      if (contentType.includes("application/pdf")) {
        return {
          text: "Este enlace apunta a un documento PDF. El contenido no puede ser extraído automáticamente. Por favor, descargue y revise el documento manualmente.",
          title: "Documento PDF",
          url,
          isPdf: true,
        }
      }

      if (!response.ok) {
        throw new Error(`Error al obtener la página: ${response.status}`)
      }

      const html = await response.text()

      // Usar cheerio para extraer el texto con manejo de errores mejorado
      try {
        const $ = load(html)

        // Eliminar elementos no deseados
        $("script, style, nav, footer, header, aside, .ads, .comments, .sidebar").remove()

        // Extraer título usando meta tags og:title, twitter:title y title
        let title = "Sin título"
        try {
          const ogTitle = $("meta[property='og:title']").attr("content")
          const twitterTitle = $("meta[name='twitter:title']").attr("content")
          const pageTitle = $("title").text().trim()
          
          title = ogTitle || twitterTitle || pageTitle || "Sin título"
        } catch (titleError) {
          console.warn("Error al extraer el título:", titleError)
        }

        // Extraer descripción usando meta tags og:description, twitter:description y meta description
        let description: string | undefined
        try {
          const ogDescription = $("meta[property='og:description']").attr("content")
          const twitterDescription = $("meta[name='twitter:description']").attr("content")
          const metaDescription = $("meta[name='description']").attr("content")
          
          description = ogDescription || twitterDescription || metaDescription || undefined
        } catch (descriptionError) {
          console.warn("Error al extraer la descripción:", descriptionError)
        }

        // Extraer imagen usando meta tags og:image, twitter:image y primera imagen
        let imageUrl: string | undefined
        try {
          const ogImage = $("meta[property='og:image']").attr("content")
          const twitterImage = $("meta[name='twitter:image']").attr("content")
          const firstImg = $("img").first().attr("src")
          
          imageUrl = ogImage || twitterImage || firstImg || undefined
        } catch (imageError) {
          console.warn("Error al extraer la imagen:", imageError)
        }

        // Intentar encontrar el contenido principal con múltiples estrategias
        let mainContent = ""

        // Estrategia 1: Extraer párrafos
        try {
          const paragraphs: string[] = []
          $("p").each(function () {
            const paragraphText = $(this).text().trim()
            if (paragraphText) {
              paragraphs.push(paragraphText)
            }
          })

          if (paragraphs.length > 0) {
            mainContent = paragraphs.join("\n\n")
          }
        } catch (paragraphError) {
          console.warn("Error al extraer párrafos:", paragraphError)
        }

        // Estrategia 2: Si no hay párrafos, intentar con selectores comunes
        if (!mainContent) {
          try {
            const selectors = [
              "article",
              "main",
              ".content",
              ".article",
              ".post",
              "#content",
              "#main",
              '[role="main"]',
              ".main-content",
              ".article-content",
              ".post-content",
            ]

            for (const selector of selectors) {
              if ($(selector).length > 0) {
                // Usar el elemento con más texto
                let bestElement = $(selector).first()
                let maxLength = bestElement.text().length

                $(selector).each(function () {
                  const length = $(this).text().length
                  if (length > maxLength) {
                    maxLength = length
                    bestElement = $(this)
                  }
                })

                mainContent = bestElement.text()
                break
              }
            }
          } catch (selectorError) {
            console.warn("Error al usar selectores comunes:", selectorError)
          }
        }

        // Estrategia 3: Si todo lo demás falla, usar el body
        if (!mainContent) {
          try {
            mainContent = $("body").text()
          } catch (bodyError) {
            console.warn("Error al extraer texto del body:", bodyError)
          }
        }

        // Si aún no tenemos contenido, extraer texto directamente del HTML
        if (!mainContent) {
          mainContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        }

        // Limpiar el texto (mantener saltos de línea pero eliminar espacios extra)
        mainContent = mainContent.replace(/\s+/g, " ").trim()

        // Si el contenido es demasiado corto, podría ser un error
        if (mainContent.length < 50) {
          // Intentar una extracción más agresiva
          mainContent = $("body").text().replace(/\s+/g, " ").trim()
        }

        return {
          text: mainContent,
          title,
          description,
          imageUrl,
          url,
        }
      } catch (cheerioError) {
        console.error("Error al procesar HTML con Cheerio:", cheerioError)

        // Fallback: extraer texto directamente del HTML
        const strippedText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()

        return {
          text: strippedText.substring(0, 5000) + (strippedText.length > 5000 ? "..." : ""),
          title: "Contenido extraído",
          description: undefined,
          imageUrl: undefined,
          url,
        }
      }
    } catch (fetchError: any) {
      console.error("Error al hacer fetch:", fetchError)

      // Manejar errores específicos
      if (fetchError.name === "AbortError") {
        return {
          error:
            "La solicitud excedió el tiempo límite. El sitio podría estar bloqueando solicitudes automatizadas o ser muy lento.",
        }
      }

      // Para sitios que bloquean scraping, ofrecer un mensaje útil
      return {
        error: `No se pudo acceder al contenido de la página. El sitio podría tener protecciones contra scraping o requerir JavaScript. Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      }
    }
  } catch (generalError) {
    console.error("Error general en scrapeWebsite:", generalError)
    return {
      error: `Error al procesar la URL: ${generalError instanceof Error ? generalError.message : String(generalError)}`,
    }
  }
}