'use server'

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { DebugLogger } from "@/lib/logger";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AnalyticsCorrectorDeTextosService} from "@/lib/analytics";
import { create } from "domain";

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
    })
  ),
});

export async function analyzeText(
  text: string,
  selectedModel: { model: string; provider: string }
) {
  // Definir valores por defecto para temperature y top_p
  let temperature = 0.7;
  let top_p = 0.9;

  // Inicializar logger con contexto específico de proofreader
  const debugLogger = new DebugLogger({
    toolIdentity: "proofreader",
    source: "analyze-text-action",
  });

  try {
    debugLogger.info("Iniciando análisis de texto", {
      textLength: text.length,
      selectedModel,
    });

    // 1. Obtener la información del usuario autenticado de forma segura
    debugLogger.info("Obteniendo información del usuario autenticado");
    const supabase = await getSupabaseServer();

    // Usar getUser() en lugar de getSession() para mayor seguridad
    const {
      data: { user },
      error: userAuthError,
    } = await supabase.auth.getUser();

    if (userAuthError || !user) {
      // Log del error de autenticación
      await debugLogger.logAuth("Authentication failed", "failed", undefined, {
        message: userAuthError?.message || "No user authenticated",
        code: userAuthError?.code || "AUTH_ERROR",
        context: { userAuthError },
      });

      // Finalizar con estado fallido
      await debugLogger.finalize("failed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          temperature,
          topP: top_p,
        },
        error: {
          message: "No hay usuario autenticado",
          code: "AUTH_ERROR",
        },
      });

      throw new Error("No hay usuario autenticado");
    }

    const { data: profile, error: profileError } = await supabase

      .from("profiles")
      .select("organizationId, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      await debugLogger.logAuth("Authentication failed", "failed", undefined, {
        message: userAuthError?.message || "No user authenticated",
        code: userAuthError?.code || "AUTH_ERROR",
        context: { userAuthError },
      });

      // Finalizar con estado fallido
      await debugLogger.finalize("failed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          temperature,
          topP: top_p,
        },
        error: {
          message: "No hay usuario autenticado",
          code: "AUTH_ERROR",
        },
      });

      throw new Error("No hay usuario autenticado");
    }

    // Log exitoso de autenticación
    await debugLogger.logAuth(
      "User authenticated successfully",
      "authenticated",
      {
        userId: user.id,
        organizationId: profile.organizationId,
        email: user.email,
      }
    );

    // Actualizar contexto del logger con información del usuario
    debugLogger.updateContext({
      userId: user.id,
      organizationId: profile?.organizationId,
    });

    debugLogger.info("Usuario autenticado correctamente", { userId: user.id });

    // Obtener el ID de la organización
    debugLogger.info("Obteniendo información del perfil del usuario");
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("organizationId, role")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.organizationId) {
      debugLogger.error("Error al obtener el perfil del usuario", userError);
      throw new Error("No se pudo obtener el ID de la organización");
    }

    const organizationId = userData.organizationId;
    debugLogger.info("Perfil del usuario obtenido", {
      organizationId,
      role: userData.role,
    });

    // 2. Obtener la API key para el proveedor seleccionado
    debugLogger.info("Obteniendo API key para el proveedor", {
      provider: selectedModel.provider,
    });
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_key_table")
      .select("key, provider")
      .eq("organizationId", organizationId)
      .eq("provider", selectedModel.provider)
      .eq("status", "ACTIVE")
      .single();

    if (apiKeyError || !apiKeyData) {
      await debugLogger.logApiKey(
        "API key not found",
        "not_found",
        {
          provider: selectedModel.provider as any,
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
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          temperature,
          topP: top_p,
        },
        error: {
          message: "No se pudo obtener la API key para este proveedor",
          code: "API_KEY_NOT_FOUND",
        },
      });

      return {
        success: false,
        error: "No se pudo obtener la API key para este proveedor",
        correcciones: [],
        debugLogs: debugLogger.getLogs(),
      };
    }

    // Verificar que la clave API no esté vacía
    if (!apiKeyData.key || apiKeyData.key.trim() === "") {
      await debugLogger.logApiKey(
        "API key is empty",
        "empty",
        {
          provider: selectedModel.provider as any,
          status: "empty",
          hasValue: false,
        },
        {
          message: "La API key está vacía o no es válida",
          code: "API_KEY_EMPTY",
        }
      );

      await debugLogger.finalize("failed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          temperature,
          topP: top_p,
        },
        error: {
          message: "La API key está vacía o no es válida",
          code: "API_KEY_EMPTY",
        },
      });

      return {
        success: false,
        error: "La API key está vacía o no es válida",
        correcciones: [],
        debugLogs: debugLogger.getLogs(),
      };
    }

    await debugLogger.logApiKey("API key retrieved successfully", "found", {
      provider: selectedModel.provider as any,
      status: "found",
      hasValue: true,
    });

    debugLogger.info("API key obtenida correctamente", {
      provider: apiKeyData.provider,
    });

    // 3. Obtener la configuración de la herramienta "proofreader"
    debugLogger.info("Obteniendo configuración de la herramienta proofreader");
    const { data: toolData, error: toolError } = await supabase
      .from("tools")
      .select("prompts, temperature, top_p, schema")
      .eq("organization_id", organizationId)
      .eq("identity", "proofreader")
      .single();

    // Si no existe, obtener la configuración por defecto
    let tool;
    if (toolError) {
      await debugLogger.logToolConfig(
        "Using default tool configuration",
        "using_default",
        {
          identity: "proofreader",
          isCustom: false,
          promptsCount: 0,
          temperature: undefined,
          topP: undefined,
          hasSchema: false,
        }
      );

      debugLogger.warn(
        "No se encontró configuración personalizada, usando configuración por defecto"
      );
      const { data: defaultToolData, error: defaultToolError } = await supabase
        .from("default_tools")
        .select("prompts, temperature, top_p, schema")
        .eq("identity", "proofreader")
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

        return {
          success: false,
          error: "No se pudo obtener la configuración de la herramienta",
          correcciones: [],
          debugLogs: debugLogger.getLogs(),
        };
      }

      tool = defaultToolData;
    } else {
      await debugLogger.logToolConfig(
        "Custom tool configuration found",
        "found_custom",
        {
          identity: "proofreader",
          isCustom: true,
          promptsCount: toolData.prompts?.length || 0,
          temperature: toolData.temperature,
          topP: toolData.top_p,
          hasSchema: !!toolData.schema,
          promptTitles: toolData.prompts?.map((p: any) => p.title) || [],
        }
      );

      tool = toolData;
      debugLogger.info("Configuración personalizada obtenida");
    }

    debugLogger.info("Configuración de herramienta obtenida", {
      temperature: tool.temperature,
      top_p: tool.top_p,
      promptsCount: tool.prompts?.length || 0,
    });

    // 4. Combinar los prompts "Principal" y "Guía de estilo"
    debugLogger.info("Procesando prompts");
    const prompts = tool.prompts || [];
    let principalPrompt = "";
    let styleGuidePrompt = "";

    // Buscar los prompts por título
    for (const prompt of prompts) {
      if (prompt.title === "Principal") {
        principalPrompt = prompt.content;
        debugLogger.info("Prompt principal encontrado");
      } else if (prompt.title === "Guia de estilo") {
        styleGuidePrompt = prompt.content;
        debugLogger.info("Guía de estilo encontrada");
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
    },
    ...
  ]
}
`;

    debugLogger.info(combinedPrompt);

    // 5. Crear la conexión con el proveedor adecuado
    debugLogger.info("Iniciando generación de texto con el modelo", {
      provider: selectedModel.provider,
      model: selectedModel.model,
    });

    let result;
    const temperature = tool.temperature;
    const top_p = tool.top_p;
    const apiKey = apiKeyData.key;

    switch (selectedModel.provider.toLowerCase()) {
      case "openai":
        debugLogger.info("Usando proveedor OpenAI");
        const openai = createOpenAI({
          apiKey: apiKey,
        });

        result = await generateText({
          model: openai(selectedModel.model),
          prompt: combinedPrompt,
          temperature,
          topP: top_p,
        });
        break;
      case "anthropic":
        debugLogger.info("Usando proveedor Anthropic");
        const anthropic = createAnthropic({
          apiKey: apiKey,
        });

        result = await generateText({
          model: anthropic(selectedModel.model),
          prompt: combinedPrompt,
          temperature,
          topP: top_p,
          headers: {
            "anthropic-dangerous-direct-browser-access": "true",
            "anthropic-version": "2023-06-01", // Asegurarse de usar la versión correcta
          },
        });
        break;
      case "google":
        debugLogger.info("Usando proveedor Google");
        const google = createGoogleGenerativeAI({
          apiKey: apiKey,
        });

        result = await generateText({
          model: google(selectedModel.model),
          prompt: combinedPrompt,
          temperature,
          topP: top_p,
        });
        break;
      default:
        const errorMsg = `Proveedor no soportado: ${selectedModel.provider}`;
        debugLogger.error(errorMsg);

        await debugLogger.finalize("failed", {
          error: {
            message: errorMsg,
            code: "UNSUPPORTED_PROVIDER",
          },
        });

        throw new Error(errorMsg);
    }

    debugLogger.info("Texto generado exitosamente", {
      responseLength: result.text.length,
      usage: result.usage,
    });

    // 6. Parsear la respuesta
    debugLogger.info("Iniciando parseo de la respuesta");
    try {
      // Intentar extraer el JSON de la respuesta
      const textResponse = result.text;
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        const parseError = {
          message: "No se pudo extraer JSON de la respuesta",
          code: "JSON_PARSE_ERROR",
          context: { textResponse },
        };

        await debugLogger.finalize("failed", {
          error: parseError,
        });

        debugLogger.error("No se pudo extraer JSON de la respuesta", {
          textResponse,
        });
        throw new Error("No se pudo extraer JSON de la respuesta");
      }

      debugLogger.info("JSON extraído de la respuesta");
      const jsonResponse = JSON.parse(jsonMatch[0]);

      // Intentar normalizar los tipos antes de validar
      if (
        jsonResponse.correcciones &&
        Array.isArray(jsonResponse.correcciones)
      ) {
        debugLogger.info(
          `Normalizando ${jsonResponse.correcciones.length} correcciones`
        );
        jsonResponse.correcciones = jsonResponse.correcciones.map(
          (correccion: any) => {
            // Normalizar el tipo si no es uno de los permitidos
            if (
              correccion.type &&
              !["spelling", "grammar", "style", "punctuation"].includes(
                correccion.type
              )
            ) {
              const originalType = correccion.type;
              // Asignar un tipo por defecto basado en heurísticas simples
              if (
                correccion.type.includes("punt") ||
                correccion.type.includes("punct")
              ) {
                correccion.type = "punctuation";
              } else if (correccion.type.includes("gram")) {
                correccion.type = "grammar";
              } else if (
                correccion.type.includes("spell") ||
                correccion.type.includes("ort")
              ) {
                correccion.type = "spelling";
              } else {
                correccion.type = "style";
              }
              debugLogger.info(
                `Tipo normalizado: ${originalType} -> ${correccion.type}`
              );
            }
            return correccion;
          }
        );
      }

      debugLogger.info("Validando respuesta con schema");
      const validatedResponse = ProofreaderResponseSchema.parse(jsonResponse);

      // Añadir IDs a las correcciones para facilitar su manejo en el frontend
      const correcciones = validatedResponse.correcciones.map(
        (correccion, index) => ({
          ...correccion,
          id: `correction-${index}`,
          startIndex: 0, // Estos valores se calcularán en el frontend
          endIndex: 0,
        })
      );

      debugLogger.info(
        `Análisis completado exitosamente con ${correcciones.length} correcciones`
      );

      // Preparar resultados de análisis para el log
      const analysisResults = correcciones.reduce((acc: any[], corr: any) => {
        const existing = acc.find((r) => r.type === corr.type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            type: corr.type,
            count: 1
          });
        }
        return acc;
      }, []);

      // Finalizar con éxito
      const metrics ={
        session_id: debugLogger.getSessionId(),
        user_id: user.id,
        organization_id: profile.organizationId,
        texto_original: text,
        longitud_caracteres: text.length,
        total_sugerencias_generadas: correcciones.length,
        tiempo_de_analisis: debugLogger.getDuration(),
        created_at: new Date(),
        updated_at: new Date(),
        modelo_utilizado: selectedModel.model,
        uso_copiar_texto: false,
        total_tokens: result.usage?.totalTokens,
        input_tokens: result.usage?.promptTokens,
        output_tokens: result.usage?.completionTokens,
      }
      const analitics= new AnalyticsCorrectorDeTextosService(metrics);
      await analitics.save();
      const analitics_id = analitics.schema.id;
      await debugLogger.finalize("completed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          temperature,
          topP: top_p,
        },
        metrics: {
          inputLength: text.length,
          outputLength: result.text.length,
          tokensUsed: result.usage?.totalTokens,
          processingTime: debugLogger.getDuration(),
          itemsProcessed: correcciones.length,
        },
        results: analysisResults,
        inputData: {
          type: "text",
          length: text.length,
          language: "es",
        },
      });

      return {
        success: true,
        correcciones,
        debugLogs: debugLogger.getLogs(),
        analitics_id
      };
    } catch (error) {
      console.error("Error al analizar el texto:", error);
      await debugLogger.finalize("failed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          temperature,
          topP: top_p,
        },
        error: {
          message: "Error al procesar la respuesta del modelo",
          code: "RESPONSE_PARSE_ERROR",
          context: { error },
        },
      });

      debugLogger.error("Error al parsear la respuesta", error);
      return {
        success: false,
        error: "Error al procesar la respuesta del modelo",
        correcciones: [],
        debugLogs: debugLogger.getLogs(),
      };
    }
  } catch (error) {
    await debugLogger.finalize("failed", {
      model: {
        provider: selectedModel.provider as any,
        model: selectedModel.model,
        temperature,
        topP: top_p,
      },
      error: {
        message: "Error en el procesamiento del texto",
        code: "PROCESSING_ERROR",
        context: { error },
      },
    });

    debugLogger.error("Error en el procesamiento del texto", error);
    return {
      success: false,
      error: "Error en el procesamiento del texto",
      correcciones: [],
      debugLogs: debugLogger.getLogs(),
    };
  }
}