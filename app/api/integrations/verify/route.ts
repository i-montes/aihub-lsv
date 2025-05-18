import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types.ts"

type ApiKeyProvider = Database["public"]["Enums"]["provider_ai"]

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { key, provider } = body as { key: string; provider: ApiKeyProvider }

  if (!key || !provider) {
    return errorResponse("Key and provider are required", 400)
  }

  try {
    // Simulate API key verification
    // In a real implementation, you would call the provider's API to verify the key
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    let valid = false
    let models: string[] = []

    // Simple validation based on key format and length
    // In a real implementation, you would make an actual API call to verify
    switch (provider) {
      case "OPENAI":
        valid = key.startsWith("sk-") && key.length > 20
        models = valid ? ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"] : []
        break
      case "GOOGLE":
        valid = key.length > 15
        models = valid ? ["gemini-pro", "gemini-pro-vision", "claude-3-opus"] : []
        break
      case "PERPLEXITY":
        valid = key.startsWith("pplx-") && key.length > 20
        models = valid ? ["llama-3-70b", "mixtral-8x7b", "sonar-small-online"] : []
        break
      default:
        return errorResponse(`Unsupported provider: ${provider}`, 400)
    }

    return successResponse({
      valid,
      models: valid ? models : undefined,
      message: valid
        ? `${provider} API key is valid`
        : `Invalid ${provider} API key format. Please check and try again.`,
    })
  } catch (error: any) {
    console.error(`Error verifying ${provider} API key:`, error)
    return errorResponse(error.message || `Error verifying ${provider} API key`, 500)
  }
})
