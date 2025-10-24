'use server'

import { DebugLogger, DebugLogTypes } from "@/lib/logger";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { ExamplesTesis } from "./examples/tesis";
import { ExamplesInvestigacion } from "./examples/investigacion";
import { ExamplesLista } from "./examples/lista";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AnalyticsGeneradorHilosService} from "@/lib/analytics";

const ThreadsSchema = z.object({
  threads: z.array(z.string().describe("Contenido del hilo")),
});

export async function threadsGenerator(
  title: string,
  text: string,
  format: "tesis" | "investigacion" | "lista",
  selectedModel: { model: string; provider: string },
  link: string
): Promise<{
  success: boolean;
  error?: string;
  threads: string[];
  logs: DebugLogTypes[];
 analitics_id?: string | number;
}> {
  const debugLogger = new DebugLogger({
    toolIdentity: "thread-generator",
    source: "generate-threads-action"
  });

  try {
    debugLogger.info("Iniciando generación de hilos", {
      title,
      textLength: text.length,
      format,
      selectedModel,
      link
    });

    // 1. Obtener la información del usuario autenticado de forma segura
    await debugLogger.logAuth("Authenticating user", "authenticating");
    const supabase = await getSupabaseServer();

    // Usar getUser() en lugar de getSession() para mayor seguridad
    const {
      data: { user },
      error: userAuthError,
    } = await supabase.auth.getUser();

    if (userAuthError || !user) {
      await debugLogger.logAuth("Authentication failed", "failed", undefined, {
        message: "No hay usuario autenticado",
        code: "AUTH_FAILED",
        context: { userAuthError }
      });
      await debugLogger.finalize("failed", {
        error: { message: "No hay usuario autenticado", code: "AUTH_FAILED" }
      });
      throw new Error("No hay usuario autenticado");
    }

    // Obtener el ID de la organización
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("organizationId, role")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.organizationId) {
      await debugLogger.logAuth("Organization ID not found", "missing_organization", undefined, {
        message: "No se pudo obtener el ID de la organización",
        code: "ORG_ID_NOT_FOUND",
        context: { userError }
      });
      await debugLogger.finalize("failed", {
        error: { message: "No se pudo obtener el ID de la organización", code: "ORG_ID_NOT_FOUND" }
      });
      throw new Error("No se pudo obtener el ID de la organización");
    }

    const organizationId = userData.organizationId;
    await debugLogger.logAuth("User authenticated successfully", "authenticated", {
      userId: user.id,
      organizationId,
      role: userData.role,
      email: user.email
    });
    
    // Update logger context
    debugLogger.updateContext({ userId: user.id, organizationId });

    // 2. Obtener la API key para el proveedor seleccionado
    await debugLogger.logApiKey("Fetching API key", "fetching", { provider: selectedModel.provider as any, status: "fetching", hasValue: false });
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_key_table")
      .select("key, provider")
      .eq("organizationId", organizationId)
      .eq("provider", selectedModel.provider)
      .eq("status", "ACTIVE")
      .single();

    if (apiKeyError || !apiKeyData) {
      await debugLogger.logApiKey("API key not found", "not_found", { provider: selectedModel.provider as any, status: "not_found", hasValue: false }, {
        message: "No se pudo obtener la API key para este proveedor",
        code: "API_KEY_NOT_FOUND",
        context: { apiKeyError }
      });
      await debugLogger.finalize("failed", { error: { message: "No se pudo obtener la API key para este proveedor", code: "API_KEY_NOT_FOUND" } });
      return {
        success: false,
        error: "No se pudo obtener la API key para este proveedor",
        threads: [],
        logs: debugLogger.getSerializableLogs(),
      };
    }

    // Verificar que la clave API no esté vacía
    if (!apiKeyData.key || apiKeyData.key.trim() === "") {
      await debugLogger.logApiKey("API key is empty or invalid", "empty", { provider: selectedModel.provider as any, status: "empty", hasValue: false });
      await debugLogger.finalize("failed", { error: { message: "La API key está vacía o no es válida", code: "API_KEY_EMPTY" } });
      return {
        success: false,
        error: "La API key está vacía o no es válida",
        threads: [],
        logs: debugLogger.getSerializableLogs(),
      };
    }

    await debugLogger.logApiKey("API key retrieved successfully", "found", { provider: selectedModel.provider as any, status: "active", hasValue: true });

    // 3. Obtener la configuración de la herramienta "threads_generator"
    await debugLogger.logToolConfig("Fetching tool configuration", "fetching", { identity: "thread-generator", isCustom: false, promptsCount: 0 });
    const { data: toolData, error: toolError } = await supabase
      .from("tools")
      .select("prompts, temperature, top_p, schema")
      .eq("organization_id", organizationId)
      .eq("identity", "threads_generator")
      .single();

    // Si no existe, obtener la configuración por defecto
    let tool;
    if (toolError) {
      await debugLogger.logToolConfig("Using default tool configuration", "using_default", { identity: "thread-generator", isCustom: false, promptsCount: 0 });
      const { data: defaultToolData, error: defaultToolError } = await supabase
        .from("default_tools")
        .select("prompts, temperature, top_p, schema")
        .eq("identity", "threads_generator")
        .single();

      if (defaultToolError || !defaultToolData) {
        await debugLogger.logToolConfig("Tool configuration not found", "not_found", undefined, { message: "No se pudo obtener la configuración de la herramienta", code: "TOOL_CONFIG_NOT_FOUND", context: { defaultToolError } });
        await debugLogger.finalize("failed", { error: { message: "No se pudo obtener la configuración de la herramienta", code: "TOOL_CONFIG_NOT_FOUND" } });
        return {
          success: false,
          error: "No se pudo obtener la configuración de la herramienta",
          threads: [],
          logs: debugLogger.getSerializableLogs(),
        };
      }

      tool = defaultToolData;
    } else {
      await debugLogger.logToolConfig("Custom tool configuration found", "found_custom", { identity: "thread-generator", isCustom: true, promptsCount: toolData.prompts?.length || 0, temperature: toolData.temperature, topP: toolData.top_p, hasSchema: !!toolData.schema, promptTitles: toolData.prompts?.map((p: any) => p.title) || [] });
      tool = toolData;
    }

    const prompts = tool.prompts;
    const principalPrompt =
      prompts.find((prompt: any) => prompt.title === "Principal") || "";
    const formatPrompt =
      prompts.find((prompt: any) => prompt.title.toLowerCase() === format) ||
      "";

    const examples =
      format === "tesis"
        ? ExamplesTesis
        : format === "investigacion"
        ? ExamplesInvestigacion
        : ExamplesLista;

    // Combinar los prompts
    const combinedPrompt = `
INSTRUCCIONES GENERALES:
${principalPrompt.content}

INSTRUCCIONES ESPECIFICAS PARA EL FORMATO "${format}":
${formatPrompt.content}

EJEMPLOS DE HILOS SIMILARES:
${examples}

CREA UN HILO DE TWITTER A PARTIR DEL SIGUIENTE TEXTO:
TÍTULO: 
${title}

LINK DEL ARTÍCULO:
${link}

ARTÍCULO:
${text}

FORMATO DE RESPUESTA:
Debes responder con un objeto JSON que contenga un array de hilos con el siguiente formato:
{
  "threads": [
    "hilo 1",
		"hilo 2",
		"hilo 3",
		// ...
  ]
}

INSTRUCCIONES ADICIONALES:
- Cada hilo debe ser breve y conciso, idealmente de 280 caracteres o menos.
- Genera un hilo de Twitter/X siguiendo estrictamente las instrucciones. Incluye la URL proporcionada en el hilo.
`;

    // 5. Crear la conexión con el proveedor adecuado
    let result;
    const temperature = tool.temperature;
    const top_p = tool.top_p;
    const apiKey = apiKeyData.key;

    debugLogger.info(
      `Iniciando generación con modelo: ${selectedModel.model} (${selectedModel.provider})`
    );
    debugLogger.info(
      `Parámetros - Temperature: ${temperature}, Top P: ${top_p}, Provider: ${selectedModel.provider}, Model: ${selectedModel.model}, Format: ${format}`
    );

    debugLogger.info(combinedPrompt);

    switch (selectedModel.provider.toLowerCase()) {
      case "openai":
        debugLogger.info("Configurando conexión con OpenAI");
        // Crear una instancia de OpenAI con la API key
        const openai = createOpenAI({
          apiKey: apiKey,
        });

        result = await generateObject({
          model: openai(selectedModel.model),
          prompt: combinedPrompt,
          schema: ThreadsSchema,
          temperature,
          topP: top_p
        });
        break;
      case "anthropic":
        debugLogger.info("Configurando conexión con Anthropic");
        // Crear una instancia de Anthropic con la API key
        const anthropic = createAnthropic({
          apiKey: apiKey,
        });

        result = await generateObject({
          model: anthropic(selectedModel.model),
          prompt: combinedPrompt,
          schema: ThreadsSchema,
          temperature,
          topP: top_p,
          headers: {
            "anthropic-dangerous-direct-browser-access": "true",
            "anthropic-version": "2023-06-01", // Asegurarse de usar la versión correcta
          },
        });
        break;
      case "google":
        debugLogger.info("Configurando conexión con Google");
        // Crear una instancia de Google con la API key
        const google = createGoogleGenerativeAI({
          apiKey: apiKey,
        });

        result = await generateObject({
          model: google(selectedModel.model),
          prompt: combinedPrompt,
          schema: ThreadsSchema,
          temperature,
          topP: top_p,
        });
        break;
      default:
        await debugLogger.finalize("failed", { error: { message: `Proveedor no soportado: ${selectedModel.provider}`, code: "UNSUPPORTED_PROVIDER" } });
        throw new Error(`Proveedor no soportado: ${selectedModel.provider}`);
    }

    await debugLogger.finalize("completed", {
      model: { provider: selectedModel.provider as any, model: selectedModel.model, temperature: tool.temperature, topP: tool.top_p },
      metrics: {
        inputLength: combinedPrompt.length,
        outputLength: (result?.object?.threads?.join("\n") || "").length,
        processingTime: 0
      },
      template: undefined,
      inputSources: ["text"]
    });
    const metricas = {
      session_id: debugLogger.getSessionId(),
      user_id: user.id,
      organization_id: organizationId,
      contenido_original: text,
      numero_tweets_generados: result?.object?.threads?.length || 0,
      longitud_total_caracteres: result?.object?.threads?.join("").length || 0,
      longitud_promedio_por_tweet: result?.object?.threads?.length ? Math.round((result?.object?.threads?.join("").length || 0) / result.object.threads.length) : 0,
      modelo_utilizado: `${selectedModel.provider}:${selectedModel.model}`,
      formato_salida: format,
      timestamp: new Date(),
      tweets_copiados_individualmente: 0, // No se puede obtener aquí
      uso_copiar_todo: false, // No se puede obtener aquí
      uso_buscar_wordpress: !!link, // Si hay link, asumimos que se usó WordPress
      feedback_like: null, // No se puede obtener aquí
      feedback_rank_like: null, // No se puede obtener aquí
      input_tokens: result?.usage?.promptTokens || null,
      output_tokens: result?.usage?.completionTokens || null,
      total_tokens: result?.usage?.totalTokens || null,
      reasoning_tokens: null, // No disponible en este contexto
      cached_input_tokens: null, // No disponible en este contexto
      tiempo_generacion: debugLogger.getDuration(), // Se podría calcular si se guarda el tiempo de inicio
      reintentos_necesarios: null, // No se puede obtener aquí
      tweets_exceden_limite: result?.object?.threads?.filter(tweet => tweet.length > 280).length || 0,
    }
    const analitics= new AnalyticsGeneradorHilosService(metricas);
    await analitics.save();
    return {
      success: true,
      threads: result?.object?.threads || [],
      logs: debugLogger.getSerializableLogs(),
      analitics_id: analitics.schema.id

    };
  } catch (error: any) {
    debugLogger.error("[THREADS_GENERATOR] Error en el procesamiento del texto:", error);
    return {
      success: false,
      error: "Error en el procesamiento del texto",
      threads: [],
      logs: debugLogger.getSerializableLogs(),
    };
  }
}
