"use server";

import { DebugLogger, DebugLogTypes } from "@/lib/logger";
import { getSupabaseServer } from "@/lib/supabase/server";
import { MINI_MODELS } from "@/lib/utils";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export type WordPressPost = {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  link: string;
  date: string;
};

type GenerateResumeParams = {
  manual: boolean;
  content?: WordPressPost[];
  selectedModel: { model: string; provider: string };
  startDate?: string;
  endDate?: string;
};

export default async function generateResume({
  manual = false,
  content = [],
  selectedModel,
  startDate,
  endDate,
}: GenerateResumeParams): Promise<{
  success: boolean;
  resume?: string;
  error?: string;
  logs?: DebugLogTypes[];
}> {
  // Implementación de la función para generar un resumen
  const debugLogger = new DebugLogger({
    toolIdentity: "resume",
    source: "generate-resume-action"
  });

  try {
    debugLogger.info("Inicio de generación de resumen, parámetros:", {
      manual,
      content: content.length,
      selectedModel,
      startDate,
      endDate,
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
      .eq("provider", selectedModel.provider as any)
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
        resume: "",
        logs: debugLogger.getLogs(),
      };
    }

    // Verificar que la clave API no esté vacía
    if (!apiKeyData.key || apiKeyData.key.trim() === "") {
      await debugLogger.logApiKey("API key is empty or invalid", "empty", { provider: selectedModel.provider as any, status: "empty", hasValue: false });
      await debugLogger.finalize("failed", { error: { message: "La API key está vacía o no es válida", code: "API_KEY_EMPTY" } });
      return {
        success: false,
        error: "La API key está vacía o no es válida",
        resume: "",
        logs: debugLogger.getLogs(),
      };
    }

    // 3. Obtener la configuración de la herramienta "resume"
    await debugLogger.logToolConfig("Fetching tool configuration", "fetching", { identity: "resume", isCustom: false, promptsCount: 0 });
    const { data: toolData, error: toolError } = await supabase
      .from("tools")
      .select("prompts, temperature, top_p, schema")
      .eq("organization_id", organizationId)
      .eq("identity", "resume")
      .single();

    // Si no existe, obtener la configuración por defecto
    let tool;
    if (toolError) {
      await debugLogger.logToolConfig("Using default tool configuration", "using_default", { identity: "resume", isCustom: false, promptsCount: 0 });
      const { data: defaultToolData, error: defaultToolError } = await supabase
        .from("default_tools")
        .select("prompts, temperature, top_p, schema")
        .eq("identity", "resume")
        .single();

      if (defaultToolError || !defaultToolData) {
        await debugLogger.logToolConfig("Tool configuration not found", "not_found", undefined, { message: "No se pudo obtener la configuración de la herramienta", code: "TOOL_CONFIG_NOT_FOUND", context: { defaultToolError } });
        await debugLogger.finalize("failed", { error: { message: "No se pudo obtener la configuración de la herramienta", code: "TOOL_CONFIG_NOT_FOUND" } });
        return {
          success: false,
          error: "No se pudo obtener la configuración de la herramienta",
          logs: debugLogger.getLogs(),
          resume: "",
        };
      }

      tool = defaultToolData;
    } else {
      await debugLogger.logToolConfig("Custom tool configuration found", "found_custom", { identity: "resume", isCustom: true, promptsCount: toolData.prompts?.length || 0, temperature: toolData.temperature, topP: toolData.top_p, hasSchema: !!toolData.schema, promptTitles: toolData.prompts?.map((p: any) => p.title) || [] });
      tool = toolData;
    }

    debugLogger.info("Configuración de herramienta obtenida", {
      temperature: tool.temperature,
      top_p: tool.top_p,
      promptsCount: Array.isArray(tool.prompts) ? tool.prompts.length : 0,
    });

    // 4. Combinar los prompts "Principal" y "Guía de estilo"
    debugLogger.info("Procesando prompts");
    const prompts = tool.prompts || [];
    let principalPrompt = "";
    let selectionPrompt = "";

    // Buscar los prompts por título
    for (const prompt of prompts) {
      if (prompt.title === "Principal") {
        principalPrompt = prompt.content;
        debugLogger.info("Prompt principal encontrado");
      } else if (prompt.title === "Selección") {
        selectionPrompt = prompt.content;
        debugLogger.info("Prompt de selección encontrado");
      }
    }

    // Dividir el contenido en batches de 20 posts
    const batchSize = 20;
    const contentBatches: string[] = [];

    for (let i = 0; i < content.length; i += batchSize) {
      const batch = content.slice(i, i + batchSize);

      const batchContent = batch
        .map((post) => {
          const title = post.title.rendered;
          // Limpiar contenido de saltos de línea y caracteres especiales
          const cleanContent = post.content.rendered
            .replace(/<[^>]*>/g, "") // Remover tags HTML
            .replace(/\n/g, " ") // Remover saltos de línea
            .replace(/\r/g, " ") // Remover retornos de carro
            .replace(/\s+/g, " ") // Múltiples espacios en uno solo
            .trim();
          const date = new Date(post.date).toLocaleString("es-ES");

          if (!cleanContent) {
            return "";
          }

          return `Título: ${title} \nFecha: ${date} \nLink: ${post.link} \nContenido: ${cleanContent}`;
        })
        .filter((post) => post !== "")
        .join("\n\n ----------- \n\n");

      contentBatches.push(batchContent);
    }

    const importantNews = await Promise.all(
      contentBatches.map(
        async (batchContent) =>
          await selectImportantNews(
            batchContent,
            selectionPrompt,
            debugLogger,
            selectedModel,
            apiKeyData.key
          )
      )
    );

    const importantNewsLinks = importantNews.flatMap((news) =>
      news.map((link) => ({
        link: link.link,
        title: link.title,
      }))
    );

    let selectedNews = await selectImportantNews(
      importantNewsLinks
        .map((news) => {
          const finder = content.find((n) => n.link == news.link) || null;
          return `Título: ${news.title} \nFecha: ${new Date(
            finder?.date || ""
          ).toLocaleString("es-ES")} \nLink: ${news.link} \nContenido: ${
            finder?.content?.rendered
          }`;
        })
        .join("\n\n ----------- \n\n"),
      selectionPrompt,
      debugLogger,
      selectedModel,
      apiKeyData.key
    );

    selectedNews = selectedNews.map((news: any) => {
      const finder = content.find((n) => n.link == news.link) || null;
      return {
        link: news.link,
        title: news.title,
        content:
          finder?.content?.rendered
            .replace(/<[^>]*>/g, "") // Remover tags HTML
            .replace(/\n/g, " ") // Remover saltos de línea
            .replace(/\r/g, " ") // Remover retornos de carro
            .replace(/\s+/g, " ") // Múltiples espacios en uno solo
            .trim() || "",
        date: finder?.date,
      };
    });

    debugLogger.info(
      `Contenido dividido en ${contentBatches.length} batches de máximo ${batchSize} posts cada uno`
    );

    const combinedPrompt = `
INSTRUCCIONES:
${principalPrompt}    
    
ARTICULOS SELECCIONADOS:
${selectedNews
  .map((news: any) => {
    return `Título: ${news.title} \nFecha: ${news.date} \nLink: ${news.link} \nContenido: ${news.content}`;
  })
  .join("\n\n----------\n\n")}
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
        debugLogger.error(`Proveedor no soportado: ${selectedModel.provider}`);
        throw new Error(`Proveedor no soportado: ${selectedModel.provider}`);
    }

    await debugLogger.finalize("completed", {
      model: { provider: selectedModel.provider as any, model: selectedModel.model, temperature: tool.temperature, topP: tool.top_p },
      metrics: {
        inputLength: combinedPrompt.length,
        outputLength: result.text.length,
        processingTime: 0
      },
      template: undefined,
      inputSources: ["text"]
    });

    return {
      success: true,
      resume: result.text,
      logs: debugLogger.getLogs(),
    };
  } catch (error) {
    debugLogger.error("Error en la generación de resumen:", error);
    throw error;
  }
}

// Función para seleccionar noticias importantes
const selectImportantNews = async (
  batch: string,
  selectionPrompt: string,
  debugLogger: any,
  selectedModel: { model: string; provider: string },
  apiKey: string
) => {
  const startTime = Date.now();

  const prompt = `
  ${selectionPrompt}

  Lista de noticias disponibles::
  ${batch}

  FORMATO DE RESPUESTA:
  {
    "selected": [
      {
        "link": "https://example.com/noticia-1",
        "title": "Título de la noticia",
        "reason": "Breve explicación de por qué seleccionaste esta noticia"
      },
      {
        "link": "https://example.com/noticia-2",
        "title": "Título de la noticia 2",
        "reason": "Breve explicación de por qué seleccionaste esta noticia"
      },
      // ... hasta completar 5 noticias
    ]
  }
`;

  try {
    debugLogger.info("Iniciando selección de noticias importantes", {
      batchSize: batch.length,
      promptLength: prompt.length,
    });
    const model =
      MINI_MODELS[
        selectedModel.provider.toUpperCase() as keyof typeof MINI_MODELS
      ];

    if (!model) {
      debugLogger.error(
        `Modelo no soportado para el proveedor: ${selectedModel.provider}`
      );
      throw new Error(
        `Modelo no soportado para el proveedor: ${selectedModel.provider}`
      );
    }

    debugLogger.info("Modelo seleccionado", {
      model,
      provider: selectedModel.provider,
    });

    const schema = z.object({
      selected: z.array(
        z.object({
          link: z.string(),
          title: z.string(),
          reason: z.string(),
        })
      ),
    });

    let result;
    switch (selectedModel.provider.toLowerCase()) {
      case "openai":
        debugLogger.info("Usando proveedor OpenAI");
        const openai = createOpenAI({
          apiKey: apiKey,
        });

        result = await generateObject({
          model: openai(model),
          prompt: prompt,
          maxRetries: 5, // Intentar hasta 3 veces en caso de error
          schema: schema,
        });
        break;
      case "anthropic":
        debugLogger.info("Usando proveedor Anthropic");
        const anthropic = createAnthropic({
          apiKey: apiKey,
        });

        result = await generateObject({
          model: anthropic(model),
          prompt: prompt,
          schema: schema,
          maxRetries: 5, // Intentar hasta 3 veces en caso de error
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

        result = await generateObject({
          model: google(model),
          prompt: prompt,
          schema: schema,
          maxRetries: 5, // Intentar hasta 3 veces en caso de error
        });
        break;
      default:
        debugLogger.error(`Proveedor no soportado: ${selectedModel.provider}`);
        throw new Error(`Proveedor no soportado: ${selectedModel.provider}`);
    }

    debugLogger.info("Selección de noticias completada", {
      duration: Date.now() - startTime,
      responseLength: result.object.selected.length,
    });

    return result.object.selected.map(
      (link: { link: string; title: string; reason?: string }) => ({
        link: link.link,
        title: link.title,
      })
    );
  } catch (error) {
    console.log("Error al seleccionar noticias importantes:", error);
    debugLogger.error("Error al seleccionar noticias importantes:", error);
    throw new Error("Error al procesar la selección de noticias");
  }
};
