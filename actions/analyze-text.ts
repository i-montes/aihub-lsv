import { getSupabaseClient } from "@/lib/supabase/client"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

// Schema para la respuesta del modelo
const ProofreaderResponseSchema = z.object({
  correcciones: z.array(
    z.object({
      original: z.string().describe("Fragmento del texto original con error"),
      suggestion: z.string().describe("Corrección sugerida para el error"),
      type: z
        .enum(["spelling", "grammar", "style", "punctuation"])
        .describe("Tipo de error: spelling | grammar | style | punctuation"),
      explanation: z.string().describe("Explicación de la corrección"),
    }),
  ),
})

type ProofreaderResponse = z.infer<typeof ProofreaderResponseSchema>

export async function analyzeText(text: string, selectedModel: { model: string; provider: string }) {
  try {
    // 1. Obtener la información del usuario autenticado de forma segura
    const supabase = getSupabaseClient()

    // Usar getUser() en lugar de getSession() para mayor seguridad
    const {
      data: { user },
      error: userAuthError,
    } = await supabase.auth.getUser()

    if (userAuthError || !user) {
      console.error("Error de autenticación:", userAuthError)
      throw new Error("No hay usuario autenticado")
    }

    // Obtener el ID de la organización
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("organizationId, role")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.organizationId) {
      console.error("Error al obtener el perfil del usuario:", userError)
      throw new Error("No se pudo obtener el ID de la organización")
    }

    const organizationId = userData.organizationId

    // 2. Obtener la API key para el proveedor seleccionado
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_key_table")
      .select("key, provider")
      .eq("organizationId", organizationId)
      .eq("provider", selectedModel.provider)
      .eq("status", "ACTIVE")
      .single()

    if (apiKeyError || !apiKeyData) {
      console.error("Error al obtener la API key:", apiKeyError)
      return {
        success: false,
        error: "No se pudo obtener la API key para este proveedor",
        correcciones: [],
      }
    }

    // Verificar que la clave API no esté vacía
    if (!apiKeyData.key || apiKeyData.key.trim() === "") {
      console.error("La API key está vacía o no es válida")
      return {
        success: false,
        error: "La API key está vacía o no es válida",
        correcciones: [],
      }
    }

    // 3. Obtener la configuración de la herramienta "proofreader"
    const { data: toolData, error: toolError } = await supabase
      .from("tools")
      .select("prompts, temperature, top_p, schema")
      .eq("organizationId", organizationId)
      .eq("identity", "proofreader")
      .single()

    // Si no existe, obtener la configuración por defecto
    let tool
    if (toolError) {
      const { data: defaultToolData, error: defaultToolError } = await supabase
        .from("default_tools")
        .select("prompts, temperature, top_p, schema")
        .eq("identity", "proofreader")
        .single()

      if (defaultToolError || !defaultToolData) {
        console.error("Error al obtener la configuración de la herramienta:", defaultToolError)
        return {
          success: false,
          error: "No se pudo obtener la configuración de la herramienta",
          correcciones: [],
        }
      }

      tool = defaultToolData
    } else {
      tool = toolData
    }

    // 4. Combinar los prompts "Principal" y "Guía de estilo"
    const prompts = tool.prompts || []
    let principalPrompt = ""
    let styleGuidePrompt = ""

    // Buscar los prompts por título
    for (const prompt of prompts) {
      if (prompt.title === "Principal") {
        principalPrompt = prompt.content
      } else if (prompt.title === "Guia de estilo") {
        styleGuidePrompt = prompt.content
      }
    }

    // Combinar los prompts
    const combinedPrompt = `
${principalPrompt}

GUÍA DE ESTILO:
${styleGuidePrompt}

TEXTO A ANALIZAR:
${text}

FORMATO DE RESPUESTA:
Debes responder con un objeto JSON que contenga un array de correcciones con el siguiente formato:
{
  "correcciones": [
    {
      "original": "fragmento con error",
      "suggestion": "corrección sugerida",
      "type": "spelling|grammar|style|punctuation",
      "explanation": "explicación de la corrección"
    }
  ]
}

IMPORTANTE: El campo "type" SOLO puede tener uno de estos valores: "spelling", "grammar", "style" o "punctuation".
`

    // 5. Crear la conexión con el proveedor adecuado
    let result
    const temperature = tool.temperature || 0.7
    const top_p = tool.top_p || 0.95
    const apiKey = apiKeyData.key

    switch (selectedModel.provider.toLowerCase()) {
      case "openai":
        // Crear una instancia de OpenAI con la API key
        const openai = createOpenAI({
          apiKey: apiKey,
        })

        result = await generateText({
          model: openai(selectedModel.model),
          prompt: combinedPrompt,
          temperature,
          top_p,
        })
        break
      case "anthropic":
        // Crear una instancia de Anthropic con la API key
        const anthropic = createAnthropic({
          apiKey: apiKey,
        })

        result = await generateText({
          model: anthropic(selectedModel.model),
          prompt: combinedPrompt,
          temperature,
          top_p,
        })
        break
      case "google":
        // Crear una instancia de Google con la API key
        const google = createGoogleGenerativeAI({
          apiKey: apiKey,
        })

        result = await generateText({
          model: google(selectedModel.model),
          prompt: combinedPrompt,
          temperature,
          top_p,
        })
        break
      default:
        throw new Error(`Proveedor no soportado: ${selectedModel.provider}`)
    }

    // 6. Parsear la respuesta
    try {
      // Intentar extraer el JSON de la respuesta
      const textResponse = result.text
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error("No se pudo extraer JSON de la respuesta")
      }

      const jsonResponse = JSON.parse(jsonMatch[0])

      // Intentar normalizar los tipos antes de validar
      if (jsonResponse.correcciones && Array.isArray(jsonResponse.correcciones)) {
        jsonResponse.correcciones = jsonResponse.correcciones.map((correccion) => {
          // Normalizar el tipo si no es uno de los permitidos
          if (correccion.type && !["spelling", "grammar", "style", "punctuation"].includes(correccion.type)) {
            // Asignar un tipo por defecto basado en heurísticas simples
            if (correccion.type.includes("punt") || correccion.type.includes("punct")) {
              correccion.type = "punctuation"
            } else if (correccion.type.includes("gram")) {
              correccion.type = "grammar"
            } else if (correccion.type.includes("spell") || correccion.type.includes("ort")) {
              correccion.type = "spelling"
            } else {
              correccion.type = "style"
            }
          }
          return correccion
        })
      }

      const validatedResponse = ProofreaderResponseSchema.parse(jsonResponse)

      // Añadir IDs a las correcciones para facilitar su manejo en el frontend
      const correcciones = validatedResponse.correcciones.map((correccion, index) => ({
        ...correccion,
        id: `correction-${index}`,
        severity: getSeverity(correccion.type),
        startIndex: 0, // Estos valores se calcularán en el frontend
        endIndex: 0,
      }))

      return {
        success: true,
        correcciones,
      }
    } catch (error) {
      console.error("Error al parsear la respuesta:", error)
      return {
        success: false,
        error: "Error al procesar la respuesta del modelo",
        correcciones: [],
      }
    }
  } catch (error) {
    console.error("Error en el procesamiento del texto:", error)
    return {
      success: false,
      error: "Error en el procesamiento del texto",
      correcciones: [],
    }
  }
}

// Función auxiliar para asignar severidad según el tipo de error
function getSeverity(type: string): number {
  switch (type) {
    case "spelling":
      return 1
    case "grammar":
      return 2
    case "style":
      return 3
    case "punctuation":
      return 2 // Asignamos la misma severidad que grammar
    default:
      return 1
  }
}
