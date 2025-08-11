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
  const debugLogger = new DebugLogger();

  try {
    debugLogger.info("Inicio de generación de resumen, parámetros:", {
      manual,
      content: content.length,
      selectedModel,
      startDate,
      endDate,
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
      debugLogger.error("Error de autenticación", userAuthError);
      throw new Error("No hay usuario autenticado");
    }

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
      .eq("provider", selectedModel.provider as any)
      .eq("status", "ACTIVE")
      .single();

    if (apiKeyError || !apiKeyData) {
      debugLogger.error("Error al obtener la API key", apiKeyError);
      return {
        success: false,
        error: "No se pudo obtener la API key para este proveedor",
        resume: "",
        logs: debugLogger.getLogs(),
      };
    }

    // Verificar que la clave API no esté vacía
    if (!apiKeyData.key || apiKeyData.key.trim() === "") {
      debugLogger.error("La API key está vacía o no es válida");
      return {
        success: false,
        error: "La API key está vacía o no es válida",
        resume: "",
        logs: debugLogger.getLogs(),
      };
    }

    debugLogger.info("API key obtenida correctamente", {
      provider: apiKeyData.provider,
    });

    // 3. Obtener la configuración de la herramienta "resume"
    debugLogger.info("Obteniendo configuración de la herramienta resume");
    const { data: toolData, error: toolError } = await supabase
      .from("tools")
      .select("prompts, temperature, top_p, schema")
      .eq("organization_id", organizationId)
      .eq("identity", "resume")
      .single();

    // Si no existe, obtener la configuración por defecto
    let tool;
    if (toolError) {
      debugLogger.warn(
        "No se encontró configuración personalizada, usando configuración por defecto"
      );
      const { data: defaultToolData, error: defaultToolError } = await supabase
        .from("default_tools")
        .select("prompts, temperature, top_p, schema")
        .eq("identity", "resume")
        .single();

      if (defaultToolError || !defaultToolData) {
        debugLogger.error(
          "Error al obtener la configuración de la herramienta",
          defaultToolError
        );
        return {
          success: false,
          error: "No se pudo obtener la configuración de la herramienta",
          logs: debugLogger.getLogs(),
          resume: "",
        };
      }

      tool = defaultToolData;
    } else {
      tool = toolData;
      debugLogger.info("Configuración personalizada obtenida");
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

          return `Título: ${title} | Fecha: ${date} | Link: ${post.link} | Contenido: ${cleanContent}`;
        })
        .join(" --- ");

      contentBatches.push(batchContent);

      // Llamar a la función selectImportantNews para cada batch
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
          return `Título: ${news.title} \nLink: ${news.link} \nContenido: ${finder?.content?.rendered}`;
        })
        .join("\n\n ----------- \n\n"),
      selectionPrompt,
      debugLogger,
      selectedModel,
      apiKeyData.key
    );

    selectedNews = selectedNews.map((news: any) => {
      const finder = content.find((n) => n.link == news.link) || null;
      console.log(finder, news);
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
          // temperature,
          // maxTokens: 2048,
          // topP: top_p,
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
          maxTokens: 2048,
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
          maxTokens: 2048,
          topP: top_p,
        });
        break;
      default:
        debugLogger.error(`Proveedor no soportado: ${selectedModel.provider}`);
        throw new Error(`Proveedor no soportado: ${selectedModel.provider}`);
    }

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
  [
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

    const schema = z.array(
      z.object({
        link: z.string(),
        title: z.string(),
        reason: z.string(),
      })
    );

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
      responseLength: result.object.length,
    });

    return result.object.map((link: any) => ({
      link: link.link,
      title: link.title,
    }));
  } catch (error) {
    console.log("Error al seleccionar noticias importantes:", error);
    debugLogger.error("Error al seleccionar noticias importantes:", error);
    throw new Error("Error al procesar la selección de noticias");
  }
};
