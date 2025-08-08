import { getSupabaseClient } from "@/lib/supabase/client";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { ExamplesTesis } from "./examples/tesis";
import { ExamplesInvestigacion } from "./examples/investigacion";
import { ExamplesLista } from "./examples/lista";

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
  logs: string[];
}> {
  let logs = [];
  try {
    logs.push("Iniciando generación de hilos");

    // 1. Obtener la información del usuario autenticado de forma segura
    const supabase = getSupabaseClient();
    logs.push("Cliente Supabase inicializado");

    // Usar getUser() en lugar de getSession() para mayor seguridad
    const {
      data: { user },
      error: userAuthError,
    } = await supabase.auth.getUser();

    if (userAuthError || !user) {
      logs.push("Error de autenticación detectado");
      console.error("Error de autenticación:", userAuthError);
      throw new Error("No hay usuario autenticado");
    }
    logs.push(`Usuario autenticado: ${user.id}`);

    // Obtener el ID de la organización
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("organizationId, role")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.organizationId) {
      logs.push("Error al obtener perfil del usuario");
      console.error("Error al obtener el perfil del usuario:", userError);
      throw new Error("No se pudo obtener el ID de la organización");
    }

    const organizationId = userData.organizationId;
    logs.push(`ID de organización obtenido: ${organizationId}`);

    // 2. Obtener la API key para el proveedor seleccionado
    logs.push(`Buscando API key para proveedor: ${selectedModel.provider}`);
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_key_table")
      .select("key, provider")
      .eq("organizationId", organizationId)
      .eq("provider", selectedModel.provider)
      .eq("status", "ACTIVE")
      .single();

    if (apiKeyError || !apiKeyData) {
      logs.push("Error al obtener API key");
      console.error("Error al obtener la API key:", apiKeyError);
      return {
        success: false,
        error: "No se pudo obtener la API key para este proveedor",
        threads: [],
        logs,
      };
    }

    // Verificar que la clave API no esté vacía
    if (!apiKeyData.key || apiKeyData.key.trim() === "") {
      logs.push("API key vacía o inválida");
      console.error("La API key está vacía o no es válida");
      return {
        success: false,
        error: "La API key está vacía o no es válida",
        threads: [],
        logs,
      };
    }
    logs.push("API key válida obtenida");

    logs.push("Obteniendo configuración de herramienta threads_generator");
    const { data: toolData, error: toolError } = await supabase
      .from("tools")
      .select("prompts, temperature, top_p, schema")
      .eq("organization_id", organizationId)
      .eq("identity", "threads_generator")
      .single();

    console.log(toolData)

    // Si no existe, obtener la configuración por defecto
    let tool;
    if (toolError) {
      logs.push(
        "Configuración personalizada no encontrada, usando configuración por defecto"
      );
      const { data: defaultToolData, error: defaultToolError } = await supabase
        .from("default_tools")
        .select("prompts, temperature, top_p, schema")
        .eq("identity", "threads_generator")
        .single();

      if (defaultToolError || !defaultToolData) {
        logs.push("Error al obtener configuración por defecto");
        console.error(
          "Error al obtener la configuración de la herramienta:",
          defaultToolError
        );
        return {
          success: false,
          error: "No se pudo obtener la configuración de la herramienta",
          threads: [],
          logs,
        };
      }

      tool = defaultToolData;
    } else {
      logs.push("Configuración personalizada obtenida");
      tool = toolData;
    }

    console.log(toolData)

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

    logs.push(
      `Iniciando generación con modelo: ${selectedModel.model} (${selectedModel.provider})`
    );
    logs.push(
      `Parámetros - Temperature: ${temperature}, Top P: ${top_p}, Provider: ${selectedModel.provider}, Model: ${selectedModel.model}, Format: ${format}`
    );

    logs.push(combinedPrompt);

    switch (selectedModel.provider.toLowerCase()) {
      case "openai":
        logs.push("Configurando conexión con OpenAI");
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
        logs.push("Configurando conexión con Anthropic");
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
        logs.push("Configurando conexión con Google");
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
        logs.push(`Proveedor no soportado: ${selectedModel.provider}`);
        throw new Error(`Proveedor no soportado: ${selectedModel.provider}`);
    }

    logs.push(
      `Generación completada exitosamente. Hilos generados: ${
        result?.object?.threads?.length || 0
      }`
    );

    return {
      success: true,
      threads: result?.object?.threads || [],
      logs,
    };
  } catch (error: any) {
    logs.push(`Error en el procesamiento: ${error}`);
    console.error(
      "[THREADS_GENERATOR] Error en el procesamiento del texto:",
      error
    );
    return {
      success: false,
      error: "Error en el procesamiento del texto",
      threads: [],
      logs,
    };
  }
}
