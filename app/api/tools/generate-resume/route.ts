import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from 'ai';
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DebugLogger } from "@/lib/logger";
import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import { MINI_MODELS } from "@/lib/utils";

// Función para normalizar texto (remover acentos y convertir a minúsculas)
function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

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

type GenerateResumeRequest = {
  manual: boolean;
  content?: WordPressPost[];
  selectedModel: { model: string; provider: string };
  startDate?: string;
  endDate?: string;
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
    throw new Error("No se pudo obtener la API key para este proveedor");
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
    identity: "resume",
    isCustom: false,
    promptsCount: 0,
  });

  const supabase = await getSupabaseRouteHandler();
  const { data: toolData, error: toolError } = await supabase
    .from("tools")
    .select("prompts, temperature, top_p, schema")
    .eq("organization_id", organizationId)
    .eq("identity", "resume")
    .single();

  let tool;
  if (toolError) {
    await debugLogger.logToolConfig(
      "Using default tool configuration",
      "using_default",
      { identity: "resume", isCustom: false, promptsCount: 0 }
    );
    const { data: defaultToolData, error: defaultToolError } = await supabase
      .from("default_tools")
      .select("prompts, temperature, top_p, schema")
      .eq("identity", "resume")
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
        identity: "resume",
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

// Función para seleccionar noticias importantes
const selectImportantNews = async (
  batch: string,
  selectionPrompt: string,
  debugLogger: DebugLogger,
  selectedModel: { model: string; provider: string },
  apiKey: string,
  minRequired: number = 1,
  maxRequired: number = 5
) => {
  const startTime = Date.now();

  debugLogger.info(`Selección de noticias - Min: ${minRequired}, Max: ${maxRequired}`);

  const prompt = `
  ${selectionPrompt}

  Lista de noticias disponibles::
  ${batch}

  INSTRUCCIONES IMPORTANTES:
  - Selecciona entre ${minRequired} y ${maxRequired} noticias más relevantes
  - Si hay menos de ${minRequired} noticias disponibles, selecciona todas las disponibles
  - Prioriza calidad sobre cantidad

  FORMATO DE RESPUESTA:
  {
    "selected": [
      {
        "link": "https://example.com/noticia-1",
        "title": "Título de la noticia",
        "reason": "Breve explicación de por qué seleccionaste esta noticia"
      }
    ]
  }
`;

  try {
    debugLogger.info("Iniciando selección de noticias importantes", {
      batchSize: batch.length,
      promptLength: prompt.length,
      minRequired,
      maxRequired
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

    // Esquema dinámico que se adapta al contenido disponible
    const schema = z.object({
      selected: z.array(
        z.object({
          link: z.string(),
          title: z.string(),
          reason: z.string(),
        })
      ).min(Math.max(1, minRequired)).max(maxRequired),
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
          maxRetries: 5,
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
          maxRetries: 5,
          headers: {
            "anthropic-dangerous-direct-browser-access": "true",
            "anthropic-version": "2023-06-01",
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
          maxRetries: 5,
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

// Función para generar el resumen final
async function generateResume(
  modelConfig: { provider: string; model: string },
  principalPrompt: string,
  selectedNews: any[],
  toolConfig: ToolConfig,
  apiKey: string,
  debugLogger: DebugLogger
) {
  debugLogger.info("Iniciando generación de resumen", {
    provider: modelConfig.provider,
    model: modelConfig.model,
    newsCount: selectedNews.length,
  });

  const temperature = toolConfig.temperature;
  const top_p = toolConfig.top_p;

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

  switch (modelConfig.provider.toLowerCase()) {
    case "openai":
      debugLogger.info("Usando proveedor OpenAI");
      const openai = createOpenAI({ apiKey });
      return generateText({
        model: openai(modelConfig.model),
        prompt: combinedPrompt,
        temperature,
        topP: top_p,
      });

    case "anthropic":
      debugLogger.info("Usando proveedor Anthropic");
      const anthropic = createAnthropic({ apiKey });
      return generateText({
        model: anthropic(modelConfig.model),
        prompt: combinedPrompt,
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
        prompt: combinedPrompt,
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
 * POST /api/tools/generate-resume
 * Recibe y procesa datos para generar resúmenes de noticias
 * Retorna un JSON con el resumen generado
 */
export async function POST(request: NextRequest) {
  try {
    const debugLogger = new DebugLogger({
      toolIdentity: "resume",
      source: "generate-resume-api",
    });

    // Parsear el body de la request
    const body = await request.json();
    const requestData: GenerateResumeRequest = body;

    debugLogger.info("Datos de la request recibidos:", {
      manual: requestData.manual,
      contentLength: requestData.content?.length || 0,
      selectedModel: requestData.selectedModel,
      startDate: requestData.startDate,
      endDate: requestData.endDate,
    });

    // 1. Autenticar usuario
    const { organizationId } = await authenticateUser(debugLogger);

    // 2. Obtener configuración de herramienta
    const toolConfig = await getToolConfig(organizationId, debugLogger);

    debugLogger.info("Configuración de herramienta obtenida", {
      temperature: toolConfig.temperature,
      top_p: toolConfig.top_p,
      promptsCount: Array.isArray(toolConfig.prompts) ? toolConfig.prompts.length : 0,
    });

    // 3. Obtener API key
    const apiKey = await getApiKey(organizationId, requestData.selectedModel.provider, debugLogger);

    // 4. Procesar prompts
    const prompts = toolConfig.prompts || [];
    let principalPrompt = "";
    let selectionPrompt = "";

    for (const prompt of prompts) {
      if (prompt.title === "Principal") {
        principalPrompt = prompt.content;
        debugLogger.info("Prompt principal encontrado");
      } else if (prompt.title === "Selección") {
        selectionPrompt = prompt.content;
        debugLogger.info("Prompt de selección encontrado");
      }
    }

    if (!principalPrompt || !selectionPrompt) {
      throw new Error("No se encontraron los prompts necesarios (Principal y Selección)");
    }

    // 5. Filtrar noticias que contengan palabras de comidas en el título
    const excludedWords = ['desayune', 'almuerce', 'cene'];
    const filteredContent = (requestData.content || []).filter(post => {
      const normalizedTitle = normalizeText(post.title.rendered);
      return !excludedWords.some(word => normalizedTitle.includes(word));
    });

    debugLogger.info("Filtro de noticias aplicado", {
      originalCount: requestData.content?.length || 0,
      filteredCount: filteredContent.length,
      excludedCount: (requestData.content?.length || 0) - filteredContent.length
    });

    // 6. Verificar si hay suficientes noticias para procesamiento de relevancia
    const content = filteredContent;
    let selectedNews;

    if (content.length <= 5) {
      // Si hay 5 o menos noticias, usar todas directamente sin procesamiento de relevancia
      debugLogger.info(`Solo hay ${content.length} noticias después del filtrado. Omitiendo procesamiento de relevancia y usando todas las noticias disponibles.`);
      
      selectedNews = content.map((post) => {
        const cleanContent = post.content.rendered
          .replace(/<[^>]*>/g, "")
          .replace(/\n/g, " ")
          .replace(/\r/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        
        return {
          link: post.link,
          title: post.title.rendered,
          content: cleanContent,
          date: post.date,
        };
      });
    } else {
      // Si hay más de 5 noticias, aplicar procesamiento normal de relevancia
      debugLogger.info(`Hay ${content.length} noticias. Aplicando procesamiento de relevancia normal.`);
      
      // 7. Estrategia inteligente de procesamiento por batches
      debugLogger.info(`Procesando ${content.length} noticias con estrategia inteligente`);
      
      let importantNewsLinks: any[] = [];
      
      if (content.length < 10) {
        // Estrategia 1: Pocas noticias - procesar todo junto
        debugLogger.info("Estrategia: Procesamiento único (menos de 10 noticias)");
        
        const allContent = content
          .map((post) => {
            const title = post.title.rendered;
            const cleanContent = post.content.rendered
              .replace(/<[^>]*>/g, "")
              .replace(/\n/g, " ")
              .replace(/\r/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            const date = new Date(post.date).toLocaleString("es-ES");

            if (cleanContent.length < 100) {
              return "";
            }

            return `Título: ${title} \nFecha: ${date} \nLink: ${post.link} \nContenido: ${cleanContent}`;
          })
          .filter((post) => post !== "")
          .join("\n\n ----------- \n\n");

        const selectedCount = Math.min(content.length, 5);
        const selectedNews = await selectImportantNews(
          allContent,
          selectionPrompt,
          debugLogger,
          requestData.selectedModel,
          apiKey.key,
          1, // mínimo 1
          selectedCount // máximo basado en contenido disponible
        );
        

        
        importantNewsLinks = selectedNews;
        
      } else {
        // Estrategia 2: Muchas noticias - batches optimizados para garantizar mínimo 5 noticias
        debugLogger.info("Estrategia: Batches optimizados (más de 10 noticias)");
        
        // Calcular batches más pequeños para mayor selección por batch
        const targetMinimumNews = 8; // Objetivo: obtener más de 5 para tener margen
        const batchSize = Math.max(15, Math.min(30, Math.ceil(content.length / 4))); // Batches más pequeños
        const contentBatches: string[] = [];

        for (let i = 0; i < content.length; i += batchSize) {
          const batch = content.slice(i, i + batchSize);

          const batchContent = batch
            .map((post) => {
              const title = post.title.rendered;
              const cleanContent = post.content.rendered
                .replace(/<[^>]*>/g, "")
                .replace(/\n/g, " ")
                .replace(/\r/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              const date = new Date(post.date).toLocaleString("es-ES");

              if (cleanContent.length < 100) {
                return "";
              }

              return `Título: ${title} \nFecha: ${date} \nLink: ${post.link} \nContenido: ${cleanContent}`;
            })
            .filter((post) => post !== "")
            .join("\n\n ----------- \n\n");

          if (batchContent.trim()) {
            contentBatches.push(batchContent);
          }
        }

        debugLogger.info(
          `Contenido dividido en ${contentBatches.length} batches de máximo ${batchSize} posts cada uno`
        );

        // Cálculo agresivo para garantizar al menos 5 noticias
        const newsPerBatch = Math.max(2, Math.ceil(targetMinimumNews / contentBatches.length));
        debugLogger.info(`Seleccionando ${newsPerBatch} noticias por batch para alcanzar mínimo ${targetMinimumNews}`);
        
        const importantNews = await Promise.all(
          contentBatches.map(
            async (batchContent, index) => {
              debugLogger.info(`Procesando batch ${index + 1}/${contentBatches.length}`);
              const batchResult = await selectImportantNews(
                batchContent,
                selectionPrompt,
                debugLogger,
                requestData.selectedModel,
                apiKey.key,
                1, // mínimo 1 por batch
                newsPerBatch // máximo por batch
              );
              return batchResult;
            }
          )
        );
        
        importantNewsLinks = importantNews.flat();
        
        // Lógica de respaldo: si no tenemos suficientes noticias, procesar más contenido
        if (importantNewsLinks.length < 5) {
          debugLogger.info(`Solo se obtuvieron ${importantNewsLinks.length} noticias. Procesando contenido adicional...`);
          
          // Obtener noticias ya procesadas para evitar duplicados
          const processedLinks = new Set(importantNewsLinks.map(news => news.link));
          
          // Filtrar contenido no procesado
          const remainingContent = content.filter(post => !processedLinks.has(post.link));
          
          if (remainingContent.length > 0) {
            const additionalContent = remainingContent
              .slice(0, Math.min(20, remainingContent.length)) // Procesar hasta 20 noticias adicionales
              .map((post) => {
                const title = post.title.rendered;
                const cleanContent = post.content.rendered
                  .replace(/<[^>]*>/g, "")
                  .replace(/\n/g, " ")
                  .replace(/\r/g, " ")
                  .replace(/\s+/g, " ")
                  .trim();
                const date = new Date(post.date).toLocaleString("es-ES");

                if (cleanContent.length < 100) {
                  return "";
                }

                return `Título: ${title} \nFecha: ${date} \nLink: ${post.link} \nContenido: ${cleanContent}`;
              })
              .filter((post) => post !== "")
              .join("\n\n ----------- \n\n");
            
            if (additionalContent.trim()) {
              const neededNews = 5 - importantNewsLinks.length;
              debugLogger.info(`Procesando contenido adicional para obtener ${neededNews} noticias más`);
              
              const additionalNews = await selectImportantNews(
                additionalContent,
                selectionPrompt,
                debugLogger,
                requestData.selectedModel,
                apiKey.key,
                1,
                Math.max(neededNews, 3) // Seleccionar al menos las que necesitamos
              );
              

              
              importantNewsLinks = [...importantNewsLinks, ...additionalNews];
              debugLogger.info(`Total de noticias después del procesamiento adicional: ${importantNewsLinks.length}`);
            }
          }
        }
      }

      debugLogger.info(`Noticias seleccionadas total: ${importantNewsLinks.length}`);

      // Validación crítica: garantizar mínimo de 5 noticias
      if (importantNewsLinks.length < 5) {
        debugLogger.warn(`ADVERTENCIA: Solo se obtuvieron ${importantNewsLinks.length} noticias, menos del mínimo requerido de 5`);
        
        // Último intento: procesar TODO el contenido restante si es necesario
        const processedLinks = new Set(importantNewsLinks.map(news => news.link));
        const allRemainingContent = content.filter(post => !processedLinks.has(post.link));
        
        if (allRemainingContent.length > 0) {
          debugLogger.info(`Procesamiento de emergencia: ${allRemainingContent.length} noticias restantes`);
          
          const emergencyContent = allRemainingContent
            .map((post) => {
              const title = post.title.rendered;
              const cleanContent = post.content.rendered
                .replace(/<[^>]*>/g, "")
                .replace(/\n/g, " ")
                .replace(/\r/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              const date = new Date(post.date).toLocaleString("es-ES");

              if (cleanContent.length < 50) { // Criterio más flexible en emergencia
                return "";
              }

              return `Título: ${title} \nFecha: ${date} \nLink: ${post.link} \nContenido: ${cleanContent}`;
            })
            .filter((post) => post !== "")
            .join("\n\n ----------- \n\n");
          
          if (emergencyContent.trim()) {
            const neededNews = 5 - importantNewsLinks.length;
            debugLogger.info(`Selección de emergencia: necesitamos ${neededNews} noticias más`);
            
            const emergencyNews = await selectImportantNews(
              emergencyContent,
              selectionPrompt,
              debugLogger,
              requestData.selectedModel,
              apiKey.key,
              1,
              neededNews + 2 // Seleccionar un poco más por seguridad
            );
            

            
            importantNewsLinks = [...importantNewsLinks, ...emergencyNews];
            debugLogger.info(`Total final después de procesamiento de emergencia: ${importantNewsLinks.length}`);
          }
        }
      }

      // 9. Selección final adaptativa
      
      if (importantNewsLinks.length <= 5) {
        // Si hay 5 o menos noticias, usar todas directamente
        debugLogger.info(`Usando ${importantNewsLinks.length} noticias directamente (sin selección final)`);
        
        selectedNews = importantNewsLinks.map((news) => {
          const finder = content.find((n) => n.link == news.link) || null;
          return {
            link: news.link,
            title: news.title,
            content: finder?.content?.rendered
              .replace(/<[^>]*>/g, "")
              .replace(/\n/g, " ")
              .replace(/\r/g, " ")
              .replace(/\s+/g, " ")
              .trim() || "",
            date: finder?.date,
          };
        });
      } else {
        // Selección final con esquema adaptativo
        debugLogger.info(`Aplicando selección final de ${importantNewsLinks.length} noticias`);
        
        const finalSelectionContent = importantNewsLinks
          .map((news) => {
            const finder = content.find((n) => n.link == news.link) || null;

            if (!finder) {
              return "";
            }

            const cleanContent = finder.content.rendered
              .replace(/<[^>]*>/g, "")
              .replace(/\n/g, " ")
              .replace(/\r/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            if (cleanContent.length < 100) {
              return "";
            }

            return `Título: ${news.title} \nFecha: ${new Date(
              finder?.date || ""
            ).toLocaleString("es-ES")} \nLink: ${news.link} \nContenido: ${cleanContent}`;
          })
          .filter(content => content !== "")
          .join("\n\n ----------- \n\n");

        // Determinar cuántas noticias seleccionar basado en disponibilidad
        const targetNewsCount = Math.min(importantNewsLinks.length, 5);
        const minRequired = importantNewsLinks.length >= 5 ? 5 : importantNewsLinks.length;
        

        
        const finalSelected = await selectImportantNews(
          finalSelectionContent,
          selectionPrompt,
          debugLogger,
          requestData.selectedModel,
          apiKey.key,
          minRequired, // Garantizar mínimo 5 si hay suficientes
          5  // máximo 5
        );
        
        
        // Validación crítica: verificar que se cumplió el mínimo requerido
        if (importantNewsLinks.length >= 5 && finalSelected.length < 5) {
          debugLogger.error(`Selección final insuficiente: ${finalSelected.length}/5 noticias`);
          
          // En caso de fallo, usar las primeras 5 noticias disponibles
          const fallbackNews = importantNewsLinks.slice(0, 5);
          
          selectedNews = fallbackNews.map((news) => {
            const finder = content.find((n) => n.link == news.link) || null;
            return {
              link: news.link,
              title: news.title,
              content: finder?.content?.rendered
                .replace(/<[^>]*>/g, "")
                .replace(/\n/g, " ")
                .replace(/\r/g, " ")
                .replace(/\s+/g, " ")
                .trim() || "",
              date: finder?.date,
            };
          });
        } else {
          // 10. Preparar noticias seleccionadas con contenido completo
          selectedNews = finalSelected.map((news: any) => {
            const finder = content.find((n) => n.link == news.link) || null;
            return {
              link: news.link,
              title: news.title,
              content:
                finder?.content?.rendered
                  .replace(/<[^>]*>/g, "")
                  .replace(/\n/g, " ")
                  .replace(/\r/g, " ")
                  .replace(/\s+/g, " ")
                  .trim() || "",
              date: finder?.date,
            };
          });
        }
      }
      
      // Validación final: confirmar que tenemos el número correcto de noticias
      if (selectedNews.length < 5) {
        debugLogger.warn(`Resultado final insuficiente: ${selectedNews.length} noticias`);
      }
    }

    debugLogger.info(`Noticias finales seleccionadas: ${selectedNews.length}`);

    // 10. Generar resumen final
    const result = await generateResume(
      requestData.selectedModel,
      principalPrompt,
      selectedNews,
      toolConfig,
      apiKey.key,
      debugLogger
    );

    await debugLogger.finalize("completed", {
      model: {
        provider: requestData.selectedModel.provider as any,
        model: requestData.selectedModel.model,
        temperature: toolConfig.temperature,
        topP: toolConfig.top_p,
      },
      metrics: {
        inputLength: selectedNews.length,
        outputLength: result.text.length,
        processingTime: 0,
      },
      template: undefined,
      inputSources: ["text"],
    });

    // Retornar respuesta JSON
    return NextResponse.json({
      success: true,
      resume: result.text,
      logs: debugLogger.getLogs(),
    });
  } catch (error) {
    console.error("Error en POST /api/tools/generate-resume:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        resume: "",
      },
      { status: 500 }
    );
  }
}