"use server"

import { getSupabaseClient } from "@/lib/supabase/client"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { gemini } from "@ai-sdk/google"
import { z } from "zod"

// Schema para la respuesta del modelo
const ProofreaderResponseSchema = z.object({
  correcciones: z.array(
    z.object({
      original: z.string().describe("Fragmento del texto original con error"),
      suggestion: z.string().describe("Corrección sugerida para el error"),
      type: z.enum(["spelling", "grammar", "style"]).describe("Tipo de error: spelling | grammar | style"),
      explanation: z.string().describe("Explicación de la corrección"),
    }),
  ),
})

type ProofreaderResponse = z.infer<typeof ProofreaderResponseSchema>

export async function analyzeText(
  text: string,
  selectedModel: { model: string; provider: string },
  organizationId: string,
) {
  try {
    // 1. Obtener la API key según el proveedor y modelo
    const supabase = getSupabaseClient()
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

    // 2. Obtener la configuración de la herramienta "proofreader"
    const { data: toolData, error: toolError } = await supabase
      .from("tools")
      .select("prompts, temperature, top_p, schema")
      .eq("organizationId", organizationId)
      .eq("identity", "proofreader")
      .single()

    // Si no existe, obtener la configuración por defecto
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

      // Usar la configuración por defecto
      const tool = defaultToolData
      return await processText(text, selectedModel, apiKeyData.key, tool)
    }

    // Usar la configuración personalizada
    return await processText(text, selectedModel, apiKeyData.key, toolData)
  } catch (error) {
    console.error("Error en el análisis de texto:", error)
    return {
      success: false,
      error: "Error en el análisis de texto",
      correcciones: [],
    }
  }
}

async function processText(
  text: string,
  selectedModel: { model: string; provider: string },
  apiKey: string,
  tool: any,
) {
  try {
    // 3. Combinar los prompts "Principal" y "Guía de estilo"
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
      "type": "spelling|grammar|style",
      "explanation": "explicación de la corrección"
    }
  ]
}
`

    // 4. Crear la conexión con el proveedor adecuado
    let result
    const temperature = tool.temperature || 0.7
    const top_p = tool.top_p || 0.95

    switch (selectedModel.provider.toLowerCase()) {
      case "openai":
        result = await generateText({
          model: openai(selectedModel.model, { apiKey }),
          prompt: combinedPrompt,
          temperature,
          top_p,
        })
        break
      case "anthropic":
        result = await generateText({
          model: anthropic(selectedModel.model, { apiKey }),
          prompt: combinedPrompt,
          temperature,
          top_p,
        })
        break
      case "google":
        result = await generateText({
          model: gemini(selectedModel.model, { apiKey }),
          prompt: combinedPrompt,
          temperature,
          top_p,
        })
        break
      default:
        throw new Error(`Proveedor no soportado: ${selectedModel.provider}`)
    }

    // 5. Parsear la respuesta
    try {
      // Intentar extraer el JSON de la respuesta
      const textResponse = result.text
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error("No se pudo extraer JSON de la respuesta")
      }

      const jsonResponse = JSON.parse(jsonMatch[0])
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
    default:
      return 1
  }
}
