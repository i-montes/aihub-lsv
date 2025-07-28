"use server";

import { DebugLogger, DebugLogTypes, MINI_MODELS } from "@/lib/utils";
import { getSupabaseServer } from "@/lib/supabase/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";

interface WordPressContent {
  title: string;
  content: string;
  excerpt: string;
  date: string;
  link: string;
}

interface SelectedModel {
  model: string;
  provider: string;
}

interface ProcessedImage {
  id: string;
  name: string;
  dataUrl: string;
  sourceFile: string;
}

interface GenerateNewsletterParams {
  images: ProcessedImage[];
  wordpressContent: WordPressContent[];
  customContent: string;
  template: string;
  selectedModel: SelectedModel;
}

export default async function generateNewsletter({
  images,
  wordpressContent,
  customContent,
  template,
  selectedModel,
}: GenerateNewsletterParams): Promise<{
  success: boolean;
  error?: string;
  content?: string;
  debugLogs?: DebugLogTypes[];
}> {
  try {
    const debugLogger = new DebugLogger();

    try {
      debugLogger.info("Iniciando generación de newsletter", {
        template,
        selectedModel,
        wordpressContent: wordpressContent.length,
        customContent: customContent.length,
        images: images.length,
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

      debugLogger.info("Usuario autenticado correctamente", {
        userId: user.id,
      });

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
        debugLogger.error("Error al obtener la API key", apiKeyError);
        return {
          success: false,
          error: "No se pudo obtener la API key para este proveedor",
          debugLogs: debugLogger.getLogs(),
        };
      }

      // Verificar que la clave API no esté vacía
      if (!apiKeyData.key || apiKeyData.key.trim() === "") {
        debugLogger.error("La API key está vacía o no es válida");
        return {
          success: false,
          error: "La API key está vacía o no es válida",
          debugLogs: debugLogger.getLogs(),
        };
      }

      debugLogger.info("API key obtenida correctamente", {
        provider: apiKeyData.provider,
      });

      // 3. Obtener la configuración de la herramienta "newsletter"
      debugLogger.info("Obteniendo configuración de la herramienta newsletter");
      const { data: toolData, error: toolError } = await supabase
        .from("tools")
        .select("prompts, temperature, top_p, schema")
        .eq("organization_id", organizationId)
        .eq("identity", "newsletter")
        .single();

      // Si no existe, obtener la configuración por defecto
      let tool;
      if (toolError) {
        debugLogger.warn(
          "No se encontró configuración personalizada, usando configuración por defecto"
        );
        const { data: defaultToolData, error: defaultToolError } =
          await supabase
            .from("default_tools")
            .select("prompts, temperature, top_p, schema")
            .eq("identity", "newsletter")
            .single();

        if (defaultToolError || !defaultToolData) {
          debugLogger.error(
            "Error al obtener la configuración de la herramienta",
            defaultToolError
          );
          return {
            success: false,
            error: "No se pudo obtener la configuración de la herramienta",

            debugLogs: debugLogger.getLogs(),
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
        promptsCount: tool.prompts?.length || 0,
      });

      let contentPdf = "";
      if (images.length > 0) {
        debugLogger.info(
          `Procesando ${images.length} imágenes para generar contenido PDF`
        );
        contentPdf = await processImages(
          images,
          debugLogger,
          selectedModel,
          apiKeyData.key
        );
      }

      let articlesContent = "";
      if (wordpressContent.length > 0) {
        debugLogger.info(
          `Procesando ${wordpressContent.length} artículos de WordPress`
        );
        articlesContent = processArticlesContent(wordpressContent);
      }

      let customPrompt = tool.prompts?.find(
        (p: any) => p.title.toLowerCase() === template
      )?.content;

      debugLogger.info("Plantilla seleccionada", {
        template,
        customPrompt: !!customPrompt,
      });

      debugLogger.info("Iniciando generación de contenido del newsletter");

      // Adaptar el prompt según los insumos disponibles
      if (customContent && images.length > 0 && wordpressContent.length > 0) {
        customPrompt += `\nSigue la estructura narrativa de la presentación, enriquece cada punto con la transcripción y complementa con la información de los artículos`;
      } else if (customContent && images.length > 0) {
        customPrompt += `\nSigue la estructura narrativa de la presentación y enriquece cada punto con la transcripción.`;
      } else if (customContent && wordpressContent.length > 0) {
        customPrompt += `\nCrea una estructura clara basada en los temas principales de la transcripción y complementa con la información de los artículos`;
      } else if (images.length > 0 && wordpressContent.length > 0) {
        customPrompt += `\nSigue la estructura narrativa de la presentación y complementa con la información de los artículos`;
      } else if (customContent) {
        customPrompt += `\nCrea una estructura clara basada en los temas principales de la transcripción.`;
      } else if (images.length > 0) {
        customPrompt += `\nSigue la estructura narrativa de la presentación y desarrolla el contenido a partir de ella.`;
      } else if (wordpressContent.length > 0) {
        customPrompt += `\nCrea una estructura clara basada en los temas principales de los artículos`;
      }

      const combinedPrompt = `${customPrompt}

${
  customContent
    ? `TRANSCRIPCIÓN:
${customContent}`
    : "No se proporcionó transcripción."
}

${
  images.length > 0 && contentPdf
    ? `CONTENIDO DE LA PRESENTACIÓN:
${contentPdf}`
    : "No se proporcionó presentación PDF."
}

${
  wordpressContent.length > 0
    ? `CONTENIDO DE ARTÍCULOS:
${articlesContent}`
    : "No se proporcionaron artículos"
}`.trim();

      debugLogger.info("Prompt final preparado", {
        length: combinedPrompt,
      });

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
            maxTokens: 2048,
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
          debugLogger.error(
            `Proveedor no soportado: ${selectedModel.provider}`
          );
          throw new Error(`Proveedor no soportado: ${selectedModel.provider}`);
      }

      debugLogger.info(
        `Respuesta del modelo recibida (${result.text.length} caracteres)`
      );

      return {
        success: true,
        content: result.text,
        debugLogs: debugLogger.getLogs(),
      };
    } catch (error) {
      debugLogger.error("Error analyzing text", { error });
      return {
        success: false,
        error: "Error analyzing text",
        debugLogs: debugLogger.getLogs(),
      };
    }
  } catch (error) {
    console.error("Error generating newsletter:", error);
    return {
      success: false,
      error: "Failed to generate newsletter",
    };
  }
}

function stripHtmlTags(html: string): string {
  // Reemplazar etiquetas HTML comunes con espacios o saltos de línea
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Función para procesar el contenido de los artículos
function processArticlesContent(articlesData: WordPressContent[]): string {
  let content = "=== CONTENIDO DE ARTÍCULOS ===\n\n";

  articlesData.forEach((article, index) => {
    content += `--- ARTÍCULO ${index + 1} ---\n\n`;
    content += `Título: ${article.title}\n`;
    content += `Fecha: ${new Date(article.date).toLocaleDateString("es-ES")}\n`;
    content += `URL: ${article.link}\n\n`;

    // Extraer el texto del HTML del contenido usando la función stripHtmlTags
    const textContent = stripHtmlTags(article.content);

    content += `Contenido:\n${textContent}\n\n`;
  });

  return content;
}

async function processImages(
  validImages: ProcessedImage[],
  debugLogger: any,
  selectedModel: SelectedModel,
  apikey: string
): Promise<string> {
  // Crear el mensaje para la API de OpenAI
  const content: any[] = [
    {
      type: "text",
      text: `Analiza estas diapositivas de una presentación. Extrae todo el texto, describe gráficos e imágenes, y mantén la estructura de la presentación. Numera claramente cada página analizada.`,
    },
  ];

  // Añadir cada imagen al contenido
  validImages.forEach((img) => {
    content.push({
      type: "image",
      image: new URL(img.dataUrl),
    });
  });

  const messages: any[] = [
    {
      role: "system",
      content:
        "Eres un experto en analizar presentaciones. Extrae todo el contenido de texto, describe gráficos, tablas e imágenes en detalle. Mantén la estructura de la presentación. Numera claramente cada página que analices.",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Analiza estas diapositivas de una presentación. Extrae todo el texto, describe gráficos e imágenes, y mantén la estructura de la presentación. Numera claramente cada página analizada.`,
        },
        ...content,
      ],
    },
  ];

  debugLogger.info(
    `  - Enviando lote a OpenAI (${validImages.length} imágenes)...`
  );

  let result;
  switch (selectedModel.provider.toLowerCase()) {
    case "openai":
      debugLogger.info("Usando proveedor OpenAI");
      const openai = createOpenAI({
        apiKey: apikey,
      });

      result = await generateText({
        model: openai(selectedModel.model),
        messages,
        maxTokens: 4096,
        maxRetries: 3, // Intentar hasta 3 veces en caso de error
      });
      break;
    case "anthropic":
      debugLogger.info("Usando proveedor Anthropic");
      const anthropic = createAnthropic({
        apiKey: apikey,
      });

      result = await generateText({
        model: anthropic(selectedModel.model),
        messages,
        maxTokens: 4096,
        maxRetries: 3, // Intentar hasta 3 veces en caso de error
        headers: {
          "anthropic-dangerous-direct-browser-access": "true",
          "anthropic-version": "2023-06-01", // Asegurarse de usar la versión correcta
        },
      });
      break;
    case "google":
      debugLogger.info("Usando proveedor Google");
      const google = createGoogleGenerativeAI({
        apiKey: apikey,
      });

      result = await generateText({
        model: google(selectedModel.model),
        messages,
        maxTokens: 4096,
        maxRetries: 3, // Intentar hasta 3 veces en caso de error
      });
      break;
    default:
      debugLogger.error(`Proveedor no soportado: ${selectedModel.provider}`);
      throw new Error(`Proveedor no soportado: ${selectedModel.provider}`);
  }

  debugLogger.info(
    `  - Respuesta de OpenAI recibida (${result.text.length} caracteres)`
  );

  return result.text;
}
