import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

/**
 * POST /api/integrations/verify
 * Verifica si una clave API es válida realizando una consulta real a la API del proveedor
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteHandler()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { key, provider } = body

    if (!key || !provider) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificación real de la clave API según el proveedor
    let isValid = false
    let models: string[] = []
    let error = null

    try {
      if (provider === "OPENAI") {
        // Verificar clave de OpenAI consultando la lista de modelos
        const response = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          isValid = true
          // Filtrar solo los modelos GPT relevantes
          models = data.data
            .filter(
              (model: any) =>
                model.id.includes("gpt-") &&
                !model.id.includes("instruct") &&
                !model.id.includes("0301") &&
                !model.id.includes("0314"),
            )
            .map((model: any) => model.id)

          // Asegurar que los modelos principales estén incluidos
          const mainModels = ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"]
          mainModels.forEach((model) => {
            if (!models.includes(model) && model === "gpt-4o") {
              models.push(model)
            }
          })
        } else {
          const errorData = await response.json()
          error = errorData.error?.message || "Error al verificar la clave de OpenAI"
        }
      } else if (provider === "GOOGLE") {
        // Verificar clave de Google (Gemini) consultando los modelos
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          isValid = true
          // Filtrar solo los modelos Gemini
          models = data.models
            .filter((model: any) => model.name.includes("gemini"))
            .map((model: any) => model.name.replace("models/", ""))

          if (models.length === 0) {
            // Si no se encontraron modelos Gemini, incluir los principales
            models = ["gemini-pro", "gemini-pro-vision"]
          }
        } else {
          const errorData = await response.json()
          error = errorData.error?.message || "Error al verificar la clave de Google"
        }
      } else if (provider === "PERPLEXITY") {
        // Verificar clave de Perplexity con una consulta simple
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "pplx-7b-online",
            messages: [{ role: "system", content: "Verify API key" }],
            max_tokens: 1,
          }),
        })

        if (response.ok) {
          isValid = true
          // Perplexity no tiene un endpoint para listar modelos, así que usamos una lista predefinida
          models = [
            "pplx-7b-online",
            "pplx-70b-online",
            "pplx-7b-chat",
            "pplx-70b-chat",
            "llama-3-sonar-small-online",
            "llama-3-sonar-medium-online",
          ]
        } else {
          const errorData = await response.json()
          error = errorData.error?.message || "Error al verificar la clave de Perplexity"
        }
      }
    } catch (err: any) {
      console.error(`Error al verificar la clave API de ${provider}:`, err)
      error = err.message || `Error al conectar con la API de ${provider}`
    }

    if (isValid) {
      return NextResponse.json({ valid: true, models })
    } else {
      return NextResponse.json({
        valid: false,
        error: error || `La clave API de ${provider} no es válida`,
      })
    }
  } catch (error: any) {
    console.error("Error en la ruta /api/integrations/verify:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        valid: false,
        message: error.message,
      },
      { status: 500 },
    )
  }
}
