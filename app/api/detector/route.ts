import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, generateText } from 'ai';
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DebugLogger } from "@/lib/logger";
import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import type { FormSchema } from "@/app/dashboard/detector-de-mentiras/constants";
import { formSchema } from "@/app/dashboard/detector-de-mentiras/constants";

// Types
interface AuthResult {
  user: any;
  organizationId: string;
  userData: any;
}

interface ApiKeyResult {
  key: string;
  provider: string;
}

interface ToolConfig {
  prompts: any[];
  temperature: number;
  top_p: number;
  schema?: any;
}

interface ModelConfig {
  provider: string;
  model: string;
}

// Utility Functions
const searchAndReplaceURLText = (text: string, metadata: any) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const meta = metadata?.[url];
    if (meta && meta.complete_text) {
      return `${url} [contenido: ${meta.complete_text}]`;
    }
    return url;
  });
};

// Authentication function
async function authenticateUser(debugLogger: DebugLogger): Promise<AuthResult> {
  await debugLogger.logAuth("Authenticating user", "authenticating");
  const supabase = await getSupabaseRouteHandler();

  const {
    data: { user },
    error: userAuthError,
  } = await supabase.auth.getUser();

  if (userAuthError || !user) {
    await debugLogger.logAuth("Authentication failed", "failed", undefined, {
      message: "No hay usuario autenticado",
      code: "AUTH_FAILED",
      context: { userAuthError },
    });
    await debugLogger.finalize("failed", {
      error: { message: "No hay usuario autenticado", code: "AUTH_FAILED" },
    });
    throw new Error("No hay usuario autenticado");
  }

  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("organizationId, role")
    .eq("id", user.id)
    .single();

  if (userError || !userData?.organizationId) {
    await debugLogger.logAuth(
      "Organization ID not found",
      "missing_organization",
      undefined,
      {
        message: "No se pudo obtener el ID de la organización",
        code: "ORG_ID_NOT_FOUND",
        context: { userError },
      }
    );
    await debugLogger.finalize("failed", {
      error: {
        message: "No se pudo obtener el ID de la organización",
        code: "ORG_ID_NOT_FOUND",
      },
    });
    throw new Error("No se pudo obtener el ID de la organización");
  }

  const organizationId = userData.organizationId;
  await debugLogger.logAuth(
    "User authenticated successfully",
    "authenticated",
    {
      userId: user.id,
      organizationId,
      role: userData.role,
      email: user.email,
    }
  );

  debugLogger.updateContext({ userId: user.id, organizationId });

  return { user, organizationId, userData };
}

// API Key function
async function getApiKey(
  organizationId: string,
  provider: string,
  debugLogger: DebugLogger
): Promise<ApiKeyResult> {
  await debugLogger.logApiKey("Fetching API key", "fetching", {
    provider: provider.toLowerCase() as any,
    status: "fetching",
    hasValue: false,
  });

  const supabase = await getSupabaseRouteHandler();
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from("api_key_table")
    .select("key, provider")
    .eq("organizationId", organizationId)
    .eq("provider", provider.toUpperCase() as any)
    .eq("status", "ACTIVE")
    .single();

  console.log(provider, organizationId)

  if (apiKeyError || !apiKeyData) {
    await debugLogger.logApiKey(
      "API key not found",
      "not_found",
      {
        provider: provider.toLowerCase() as any,
        status: "not_found",
        hasValue: false,
      },
      {
        message: "No se pudo obtener la API key para este proveedor",
        code: "API_KEY_NOT_FOUND",
        context: { apiKeyError },
      }
    );
    await debugLogger.finalize("failed", {
      error: {
        message: "No se pudo obtener la API key para este proveedor",
        code: "API_KEY_NOT_FOUND",
      },
    });
    throw new Error("No se pudo obtener la API key para este proveedor", apiKeyError);
  }

  if (!apiKeyData.key || apiKeyData.key.trim() === "") {
    await debugLogger.logApiKey("API key is empty or invalid", "empty", {
      provider: provider.toLowerCase() as any,
      status: "empty",
      hasValue: false,
    });
    await debugLogger.finalize("failed", {
      error: {
        message: "La API key está vacía o no es válida",
        code: "API_KEY_EMPTY",
      },
    });
    throw new Error("La API key está vacía o no es válida");
  }

  return apiKeyData;
}

// Tool Configuration function
async function getToolConfig(
  organizationId: string,
  debugLogger: DebugLogger
): Promise<ToolConfig> {
  await debugLogger.logToolConfig("Fetching tool configuration", "fetching", {
    identity: "detector",
    isCustom: false,
    promptsCount: 0,
  });

  const supabase = await getSupabaseRouteHandler();
  const { data: toolData, error: toolError } = await supabase
    .from("tools")
    .select("prompts, temperature, top_p, schema")
    .eq("organization_id", organizationId)
    .eq("identity", "detector")
    .single();

  let tool;
  if (toolError) {
    await debugLogger.logToolConfig(
      "Using default tool configuration",
      "using_default",
      { identity: "detector", isCustom: false, promptsCount: 0 }
    );
    const { data: defaultToolData, error: defaultToolError } = await supabase
      .from("default_tools")
      .select("prompts, temperature, top_p, schema")
      .eq("identity", "detector")
      .single();

    if (defaultToolError || !defaultToolData) {
      await debugLogger.logToolConfig(
        "Tool configuration not found",
        "not_found",
        undefined,
        {
          message: "No se pudo obtener la configuración de la herramienta",
          code: "TOOL_CONFIG_NOT_FOUND",
          context: { defaultToolError },
        }
      );
      await debugLogger.finalize("failed", {
        error: {
          message: "No se pudo obtener la configuración de la herramienta",
          code: "TOOL_CONFIG_NOT_FOUND",
        },
      });
      throw new Error("No se pudo obtener la configuración de la herramienta");
    }

    tool = defaultToolData;
  } else {
    await debugLogger.logToolConfig(
      "Custom tool configuration found",
      "found_custom",
      {
        identity: "detector",
        isCustom: true,
        promptsCount: toolData.prompts?.length || 0,
        temperature: toolData.temperature,
        topP: toolData.top_p,
        hasSchema: !!toolData.schema,
        promptTitles: toolData.prompts?.map((p: any) => p.title) || [],
      }
    );
    tool = toolData;
  }

  return tool;
}

// Generate prompt function
function generatePrompt(validatedData: FormSchema): string {
  const links_desinformacion = searchAndReplaceURLText(
    validatedData.disinformation.text,
    validatedData.disinformation.metadata
  );

  const links_verificacion = searchAndReplaceURLText(
    validatedData.verification.text,
    validatedData.verification.metadata
  );

  return `
INSUMOS PARA EL TITULAR Y EL PÁRRAFO INICIAL:

Imágenes de la desinformación que circula: ${
    validatedData.disinformation.images.length > 0
      ? `${validatedData.disinformation.images.length} imágenes adjuntas (etiquetadas como "desinformacion")`
      : "No proporcionadas"
  }

Enlaces de la desinformación que circula:
${links_desinformacion || "No proporcionados"}

¿De qué trata?
${validatedData.disinformation.description}

Calificación: ${validatedData.rating}

INSUMOS PARA VERIFICACIÓN Y EVIDENCIAS:

Métodos de verificación con sus enlaces:
${links_verificacion || "No proporcionados"}

Imágenes de verificación: ${
    validatedData.verification.images.length > 0
      ? `${validatedData.verification.images.length} imágenes adjuntas (etiquetadas como "verificacion")`
      : "No proporcionadas"
  }

CONTEXTO ADICIONAL:
${validatedData.additional_context.text || "No proporcionado"}`;
}



// Función para generar análisis con un modelo específico
async function generateAnalysis(
  modelConfig: { provider: string; model: string },
  systemPrompt: string,
  userPrompt: string,
  toolConfig: ToolConfig,
  apiKey: string,
  debugLogger: DebugLogger,
  validatedData?: any
) {
  debugLogger.info("Iniciando generación de análisis", {
    provider: modelConfig.provider,
    model: modelConfig.model,
  });

  const temperature = toolConfig.temperature;
  const top_p = toolConfig.top_p;

  // Preparar el contenido del mensaje
  const messageContent: any[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: userPrompt,
        },
      ],
    },
  ];

  // Añadir imágenes de desinformación si existen
  if (validatedData?.disinformation?.images?.length > 0) {
    messageContent[0].content.push({
      type: "text",
      text: "--- IMÁGENES DE DESINFORMACIÓN ---",
    });

    // Añadir cada imagen de desinformación
    for (const img of validatedData.disinformation.images) {
      if (img && img.preview && img.mimeType) {
        try {
          messageContent[0].content.push({
            type: "image",
            source: {
              type: "base64",
              data: img.preview,
            },
          });
        } catch (imgError) {
          console.error("Error al procesar imagen de desinformación:", imgError);
        }
      }
    }
  }

  // Añadir imágenes de verificación si existen
  if (validatedData?.verification?.images?.length > 0) {
    messageContent[0].content.push({
      type: "text",
      text: "--- IMÁGENES DE VERIFICACIÓN Y EVIDENCIAS ---",
    });

    // Añadir cada imagen de verificación
    for (const img of validatedData.verification.images) {
      if (img && img.preview && img.mimeType) {
        try {
          messageContent[0].content.push({
            type: "image",
            source: {
              type: "base64",
              data: img.preview,
            },
          });
        } catch (imgError) {
          console.error("Error al procesar imagen de verificación:", imgError);
        }
      }
    }
  }

  switch (modelConfig.provider.toLowerCase()) {
    case "openai":
      debugLogger.info("Usando proveedor OpenAI");
      const openai = createOpenAI({ apiKey });
      return generateText({
        model: openai(modelConfig.model),
        system: systemPrompt,
        messages: convertToCoreMessages(messageContent),
        temperature,
        topP: top_p,
      });

    case "anthropic":
      debugLogger.info("Usando proveedor Anthropic");
      const anthropic = createAnthropic({ apiKey });
      return generateText({
        model: anthropic(modelConfig.model),
        system: systemPrompt,
        messages: convertToCoreMessages(messageContent),
        temperature,
        topP: top_p,
        headers: {
          "anthropic-dangerous-direct-browser-access": "true",
          "anthropic-version": "2023-06-01",
        },
      });

    case "google":
      debugLogger.info("Usando proveedor Google");
      const google = createGoogleGenerativeAI({ apiKey });
      return generateText({
        model: google(modelConfig.model),
        system: systemPrompt,
        messages: convertToCoreMessages(messageContent),
        temperature,
        topP: top_p,
      });

    default:
      const errorMsg = `Proveedor no soportado: ${modelConfig.provider}`;
      debugLogger.error(errorMsg);
      throw new Error(errorMsg);
  }
}

/**
 * POST /api/detector
 * Recibe y valida datos del formulario del detector de mentiras
 * Retorna un stream de texto usando AI SDK
 */
export async function POST(request: NextRequest) {
  try {
    const debugLogger = new DebugLogger({
      toolIdentity: "detector",
      source: "detector",
    });

    // Parsear el body de la request
    const body = await request.json();

    // Validar los datos contra el schema
    const validatedData = formSchema.parse(body);

    debugLogger.info("Validacion del formulario completada:", validatedData);

    // 1. Autenticar usuario
    const { organizationId } = await authenticateUser(debugLogger);

    // 2. Obtener configuración de herramienta
    const toolConfig = await getToolConfig(organizationId, debugLogger);

    debugLogger.info("Configuración de herramienta obtenida", {
      temperature: toolConfig.temperature,
      top_p: toolConfig.top_p,
      promptsCount: Array.isArray(toolConfig.prompts) ? toolConfig.prompts.length : 0,
    });

    // 3. Generar prompt
    const prompt = generatePrompt(validatedData);
    const filterPrincipalPrompt = toolConfig.prompts?.find((prompt) => prompt?.title?.toLowerCase() === "principal") || "";
    const systemPrompt = filterPrincipalPrompt.content || "";
    
    debugLogger.info("Prompt combinado generado", {
      systemPromptLength: systemPrompt.length,
      userPromptLength: prompt.length
    });

    // 4. Lógica de comparación vs análisis simple
    if (validatedData.compare && validatedData.model_to_compare_1 && validatedData.selectedModel) {
      debugLogger.info("Modo comparación activado", {
        model1: validatedData.model_to_compare_1,
        model2: validatedData.selectedModel,
      });

      // Obtener API keys para ambos modelos
      const apiKey1 = await getApiKey(organizationId, validatedData.model_to_compare_1.provider, debugLogger);
      const apiKey2 = await getApiKey(organizationId, validatedData.selectedModel.provider, debugLogger);

      // Generar análisis con ambos modelos de forma simultánea
      const [result1, result2] = await Promise.all([
        generateAnalysis(validatedData.model_to_compare_1, systemPrompt, prompt, toolConfig, apiKey1.key, debugLogger, validatedData),
        generateAnalysis(validatedData.selectedModel, systemPrompt, prompt, toolConfig, apiKey2.key, debugLogger, validatedData),
      ]);

      // Retornar respuesta JSON con ambos resultados
      return NextResponse.json({
        success: true,
        generated1: result2.text,
        generated2: result1.text,
        model1: validatedData.selectedModel,
        model2: validatedData.model_to_compare_1,
      });
    } else {
      debugLogger.info("Modo análisis simple", {
        model: validatedData.selectedModel,
      });

      // Análisis simple con un solo modelo
      const apiKey = await getApiKey(organizationId, validatedData.selectedModel?.provider || "", debugLogger);
      const result = await generateAnalysis(
        validatedData.selectedModel || { provider: "", model: "" },
        systemPrompt,
        prompt,
        toolConfig,
        apiKey.key,
        debugLogger,
        validatedData
      );

      // Retornar respuesta JSON
      return NextResponse.json({
        success: true,
        generated: result.text
      });
    }
  } catch (error) {
    console.error("Error en POST /api/detector:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        generated: ""
      },
      { status: 500 }
    );
  }
}