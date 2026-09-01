import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type ModelMessage } from 'ai';
import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DebugLogger } from "@/lib/logger";
import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import { AnalyticsDetectorService, type AnalyticsDetector } from "@/lib/analytics";
import { crearDocumento } from "@/lib/google/drive-docs";
import {
  construirHtmlDocumento,
  contarInsumos,
  nombreDocumento,
  resumirEntrada,
  type SalidaModelo,
} from "@/lib/detector/documento";
import type { FormSchema } from "@/app/dashboard/detector-de-mentiras/constants";
import {
  formSchema,
  getRatingPromptValue,
} from "@/app/dashboard/detector-de-mentiras/constants";

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
  /** OpenAI `reasoningEffort` / Anthropic `effort` */
  reasoning_effort?: string;
  /** OpenAI `textVerbosity` */
  verbosity?: string;
}

const DEFAULT_REASONING_EFFORT = "medium";
const DEFAULT_VERBOSITY = "medium";

/**
 * Anthropic sólo admite low | medium | high; "xhigh" es exclusivo de OpenAI,
 * así que se recorta al nivel más alto que acepta.
 */
function anthropicEffort(effort: string): "low" | "medium" | "high" {
  return effort === "xhigh" ? "high" : (effort as "low" | "medium" | "high");
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

/**
 * Convierte los videos de YouTube aportados en un bloque delimitado para que el
 * modelo pueda citar cada video por separado.
 *
 * `text` ya llega formateado desde la extracción (datos del video, canal,
 * comentarios destacados y la transcripción cuando está disponible), así que
 * aquí sólo se numera y delimita, sin repetir los metadatos.
 */
const formatTranscripts = (
  transcripts: FormSchema["additional_context"]["transcripts"]
): string => {
  const withContent = (transcripts ?? []).filter(
    (transcript) => transcript.text?.trim()
  );

  if (withContent.length === 0) return "";

  const blocks = withContent.map((transcript, index) => {
    // Sin subtítulos el bloque sólo trae los datos del video: conviene avisarlo
    // para que el modelo no lo cite como si fuera lo dicho en el video.
    const aviso = transcript.hasTranscript
      ? ""
      : "\n(Este video no tenía subtítulos disponibles: abajo sólo hay información del video, no lo que se dice en él.)";

    return `--- VIDEO ${index + 1} ---${aviso}
${transcript.text.trim()}`;
  });

  return `

VIDEOS DE YOUTUBE APORTADOS (${withContent.length}):
Úsalos como evidencia citando el video correspondiente.

${blocks.join("\n\n")}`;
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
    identity: "detector",
    isCustom: false,
    promptsCount: 0,
  });

  const supabase = await getSupabaseRouteHandler();
  const { data: toolData, error: toolError } = await supabase
    .from("tools")
    .select("*")
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
      .select("*")
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

/**
 * Describe los adjuntos de una sección para el prompt, distinguiendo imágenes
 * de PDFs para que el modelo sepa qué tipo de material recibe.
 */
function describeAttachments(files: any[], category: string): string {
  const images = files.filter((file) => file?.type === "image").length;
  const documents = files.length - images;

  if (files.length === 0) return "No proporcionados";

  const parts: string[] = [];
  if (images > 0) parts.push(`${images} ${images === 1 ? "imagen" : "imágenes"}`);
  if (documents > 0)
    parts.push(`${documents} ${documents === 1 ? "documento PDF" : "documentos PDF"}`);

  return `${parts.join(" y ")} (etiquetados como "${category}")`;
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

  const contexto = searchAndReplaceURLText(
    validatedData.additional_context.text,
    validatedData.additional_context.metadata
  );

  const transcripciones = formatTranscripts(
    validatedData.additional_context.transcripts
  );

  return `
INSUMOS PARA EL TITULAR Y EL PÁRRAFO INICIAL:

Archivos de la desinformación que circula: ${describeAttachments(
    validatedData.disinformation.images,
    "desinformacion"
  )}

Enlaces de la desinformación que circula:
${links_desinformacion || "No proporcionados"}

¿De qué trata?
${validatedData.disinformation.description}

Calificación: ${getRatingPromptValue(validatedData.rating)}

INSUMOS PARA VERIFICACIÓN Y EVIDENCIAS:

Métodos de verificación con sus enlaces:
${links_verificacion || "No proporcionados"}

Archivos de verificación: ${describeAttachments(
    validatedData.verification.images,
    "verificacion"
  )}

CONTEXTO ADICIONAL:
${contexto || "No proporcionado"}${transcripciones}`;
}



/**
 * Convierte un archivo subido en una parte del mensaje.
 * El cliente manda `preview` como data URL (`data:<mime>;base64,...`), de donde
 * se sacan el media type y el payload. Las imágenes van como parte de imagen y
 * los PDFs como parte de archivo, que los tres proveedores saben leer.
 */
function toContentPart(file: any) {
  const preview: string | undefined = file?.preview;
  if (!preview) return null;

  const match = preview.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;

  const [, mediaType, data] = match;

  if (mediaType.startsWith("image/")) {
    return { type: "image" as const, image: data, mediaType };
  }

  if (mediaType === "application/pdf") {
    return {
      type: "file" as const,
      data,
      mediaType,
      filename: file?.name || "documento.pdf",
    };
  }

  return null;
}

/**
 * Arma el contenido del mensaje: el prompt seguido de los adjuntos,
 * separados por categoría para que el modelo sepa qué está mirando.
 */
function buildUserContent(userPrompt: string, validatedData: FormSchema) {
  const content: any[] = [{ type: "text", text: userPrompt }];

  const sections = [
    {
      label: "--- ARCHIVOS DE LA DESINFORMACIÓN ---",
      files: validatedData.disinformation?.images ?? [],
    },
    {
      label: "--- ARCHIVOS DE VERIFICACIÓN Y EVIDENCIAS ---",
      files: validatedData.verification?.images ?? [],
    },
  ];

  for (const section of sections) {
    const parts = section.files
      .map(toContentPart)
      .filter((part): part is NonNullable<typeof part> => part !== null);

    if (parts.length > 0) {
      content.push({ type: "text", text: section.label });
      content.push(...parts);
    }
  }

  return content;
}

// Función para generar análisis con un modelo específico
async function generateAnalysis(
  modelConfig: { provider: string; model: string },
  systemPrompt: string,
  userPrompt: string,
  toolConfig: ToolConfig,
  apiKey: string,
  debugLogger: DebugLogger,
  validatedData: FormSchema
) {
  debugLogger.info("Iniciando generación de análisis", {
    provider: modelConfig.provider,
    model: modelConfig.model,
  });

  const temperature = toolConfig.temperature;
  const top_p = toolConfig.top_p;

  // Los hiperparámetros se configuran por herramienta, no por generación
  const reasoningEffort =
    toolConfig.reasoning_effort || DEFAULT_REASONING_EFFORT;
  const verbosity = toolConfig.verbosity || DEFAULT_VERBOSITY;

  const content = buildUserContent(userPrompt, validatedData);
  const messages: ModelMessage[] = [{ role: "user", content }];

  debugLogger.info("Contenido del mensaje preparado", {
    imageParts: content.filter((part) => part.type === "image").length,
    fileParts: content.filter((part) => part.type === "file").length,
  });

  switch (modelConfig.provider.toLowerCase()) {
    case "openai":
      debugLogger.info("Usando proveedor OpenAI");
      const openai = createOpenAI({ apiKey });
      return generateText({
        model: openai(modelConfig.model),
        system: systemPrompt,
        messages,
        providerOptions: {
          openai: {
            reasoningEffort,
            textVerbosity: verbosity,
            store: false,
          },
        },
      });

    case "anthropic":
      debugLogger.info("Usando proveedor Anthropic");
      const anthropic = createAnthropic({ apiKey });
      return generateText({
        model: anthropic(modelConfig.model),
        system: systemPrompt,
        messages,
        providerOptions: {
          // `effort` activa el thinking adaptativo; estos modelos no admiten temperature
          anthropic: { effort: anthropicEffort(reasoningEffort) },
        },
      });

    case "google":
      debugLogger.info("Usando proveedor Google");
      const google = createGoogleGenerativeAI({ apiKey });
      return generateText({
        model: google(modelConfig.model),
        system: systemPrompt,
        messages,
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
 * Corre un modelo midiendo cuánto tarda.
 *
 * El tiempo se toma por modelo y no del request completo porque en modo
 * comparación los dos corren en paralelo: el total de pared no dice nada sobre
 * cuál de los dos es más lento.
 */
async function medirAnalisis(
  modelConfig: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
  toolConfig: ToolConfig,
  apiKey: string,
  debugLogger: DebugLogger,
  validatedData: FormSchema
): Promise<SalidaModelo> {
  const inicio = Date.now();

  const resultado = await generateAnalysis(
    modelConfig,
    systemPrompt,
    userPrompt,
    toolConfig,
    apiKey,
    debugLogger,
    validatedData
  );

  return {
    proveedor: modelConfig.provider,
    modelo: modelConfig.model,
    texto: resultado.text,
    tiempoMs: Date.now() - inicio,
    uso: resultado.usage ?? null,
  };
}

/** Columnas de tokens y tiempo de un modelo, con el sufijo _1 o _2 */
function metricasDeSalida(
  salida: SalidaModelo | null,
  sufijo: "1" | "2"
): Partial<AnalyticsDetector> {
  if (!salida) return {};

  const uso = salida.uso ?? {};

  return {
    [`proveedor_${sufijo}`]: salida.proveedor,
    [`modelo_${sufijo}`]: salida.modelo,
    [`output_${sufijo}`]: salida.texto,
    [`longitud_output_${sufijo}`]: salida.texto.length,
    [`tiempo_modelo_${sufijo}`]: salida.tiempoMs,
    [`input_tokens_${sufijo}`]: uso.inputTokens ?? null,
    [`output_tokens_${sufijo}`]: uso.outputTokens ?? null,
    [`total_tokens_${sufijo}`]: uso.totalTokens ?? null,
    [`reasoning_tokens_${sufijo}`]: uso.reasoningTokens ?? null,
    [`cached_input_tokens_${sufijo}`]: uso.cachedInputTokens ?? null,
  } as Partial<AnalyticsDetector>;
}

/**
 * Guarda la fila de analytics del análisis y devuelve el servicio ya
 * construido.
 *
 * Se devuelve la instancia, y no sólo el id, porque el documento de Drive se
 * crea después de responder: su cliente de Supabase se creó dentro del request
 * (leyendo las cookies), que es lo que permite seguir escribiendo desde
 * `after()`.
 */
async function guardarAnalytics(
  datos: Partial<AnalyticsDetector>
): Promise<AnalyticsDetectorService> {
  const analytics = new AnalyticsDetectorService(datos as AnalyticsDetector);
  await analytics.save();
  return analytics;
}

/**
 * Programa la creación del documento de revisión para después de responder.
 *
 * Crear el Doc toma unos segundos y el análisis ya tomó minutos: hacerlo dentro
 * del request sólo alargaría la espera del periodista. Si Drive falla, queda el
 * motivo en `documento_error` y el análisis no se ve afectado.
 */
function programarDocumento(
  analytics: AnalyticsDetectorService,
  contexto: {
    datos: FormSchema;
    promptUsuario: string;
    salida1: SalidaModelo | null;
    salida2: SalidaModelo | null;
    usuarioEmail?: string | null;
  }
) {
  after(async () => {
    try {
      const fecha = new Date();

      const documento = await crearDocumento({
        nombre: nombreDocumento(contexto.datos, fecha),
        html: construirHtmlDocumento({ ...contexto, fecha }),
        subcarpeta: "Detector de mentiras",
        fecha,
      });

      await analytics.registrarDocumento(documento);
    } catch (error) {
      console.error("No se pudo crear el documento de revisión:", error);
      await analytics
        .registrarDocumento({
          error: error instanceof Error ? error.message : "Error desconocido",
        })
        .catch(() => {
          // Ya se respondió al cliente; no hay a quién avisarle.
        });
    }
  });
}

/**
 * POST /api/detector
 * Recibe y valida datos del formulario del detector de mentiras
 * Retorna un stream de texto usando AI SDK
 */
export async function POST(request: NextRequest) {
  const debugLogger = new DebugLogger({
    toolIdentity: "detector",
    source: "detector",
  });

  const inicioRequest = Date.now();

  // Declarados fuera del try para que el catch pueda dejar constancia de los
  // análisis que fallan. Sin esto la tabla sólo mostraría los que salieron bien
  // y sobrerrepresentaría la tasa de éxito.
  let validatedData: FormSchema | null = null;
  let organizationId: string | null = null;
  let usuario: { id?: string; email?: string } | null = null;

  try {
    // Parsear el body de la request
    const body = await request.json();

    // Validar los datos contra el schema
    validatedData = formSchema.parse(body);

    debugLogger.info("Validacion del formulario completada:", validatedData);

    // 1. Autenticar usuario
    const autenticacion = await authenticateUser(debugLogger);
    organizationId = autenticacion.organizationId;
    usuario = autenticacion.user;

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
    const esComparacion = Boolean(
      validatedData.compare &&
        validatedData.model_to_compare_1 &&
        validatedData.selectedModel
    );

    // Los dos modos comparten todo lo que va a analytics, así que sólo cambia
    // cómo se obtienen las salidas.
    let salida1: SalidaModelo;
    let salida2: SalidaModelo | null = null;

    if (esComparacion) {
      debugLogger.info("Modo comparación activado", {
        model1: validatedData.selectedModel,
        model2: validatedData.model_to_compare_1,
      });

      // Obtener API keys para ambos modelos. El orden importa: `generated1`
      // corresponde siempre al modelo principal y `generated2` al de comparación.
      const apiKey1 = await getApiKey(organizationId, validatedData.selectedModel.provider, debugLogger);
      const apiKey2 = await getApiKey(organizationId, validatedData.model_to_compare_1!.provider, debugLogger);

      // Generar análisis con ambos modelos de forma simultánea
      [salida1, salida2] = await Promise.all([
        medirAnalisis(validatedData.selectedModel, systemPrompt, prompt, toolConfig, apiKey1.key, debugLogger, validatedData),
        medirAnalisis(validatedData.model_to_compare_1!, systemPrompt, prompt, toolConfig, apiKey2.key, debugLogger, validatedData),
      ]);
    } else {
      debugLogger.info("Modo análisis simple", {
        model: validatedData.selectedModel,
      });

      // Análisis simple con un solo modelo
      const apiKey = await getApiKey(organizationId, validatedData.selectedModel?.provider || "", debugLogger);
      salida1 = await medirAnalisis(
        validatedData.selectedModel || { provider: "", model: "" },
        systemPrompt,
        prompt,
        toolConfig,
        apiKey.key,
        debugLogger,
        validatedData
      );
    }

    // 5. Registrar el análisis y programar el documento de revisión
    const analytics = await guardarAnalytics({
      session_id: debugLogger.getSessionId() as any,
      user_id: usuario?.id ?? null,
      organization_id: organizationId,

      modo: esComparacion ? "comparacion" : "simple",
      modelos_resumen: [salida1.modelo, salida2?.modelo]
        .filter(Boolean)
        .join(" + "),
      ...metricasDeSalida(salida1, "1"),
      ...metricasDeSalida(salida2, "2"),
      total_tokens:
        (salida1.uso?.totalTokens ?? 0) + (salida2?.uso?.totalTokens ?? 0) ||
        null,
      tiempo_total: Date.now() - inicioRequest,

      input_completo: resumirEntrada(validatedData),
      prompt_usuario: prompt,
      calificacion: getRatingPromptValue(validatedData.rating),
      ...contarInsumos(validatedData),

      estado: "completado",
      created_at: new Date(),
    });

    programarDocumento(analytics, {
      datos: validatedData,
      promptUsuario: prompt,
      salida1,
      salida2,
      usuarioEmail: usuario?.email ?? null,
    });

    const analytics_id = analytics.schema.id;

    // Retornar respuesta JSON
    return esComparacion
      ? NextResponse.json({
          success: true,
          generated1: salida1.texto,
          generated2: salida2!.texto,
          model1: validatedData.selectedModel,
          model2: validatedData.model_to_compare_1,
          analytics_id,
        })
      : NextResponse.json({
          success: true,
          generated: salida1.texto,
          analytics_id,
        });
  } catch (error) {
    console.error("Error en POST /api/detector:", error);

    // Dejar rastro del fallo, sin dejar que un problema al registrarlo tape el
    // error real que hay que devolverle al usuario.
    if (organizationId && validatedData) {
      try {
        await guardarAnalytics({
          session_id: debugLogger.getSessionId() as any,
          user_id: usuario?.id ?? null,
          organization_id: organizationId,
          modo: validatedData.compare ? "comparacion" : "simple",
          proveedor_1: validatedData.selectedModel?.provider ?? null,
          modelo_1: validatedData.selectedModel?.model ?? null,
          proveedor_2: validatedData.model_to_compare_1?.provider ?? null,
          modelo_2: validatedData.model_to_compare_1?.model ?? null,
          modelos_resumen: [
            validatedData.selectedModel?.model,
            validatedData.compare ? validatedData.model_to_compare_1?.model : null,
          ]
            .filter(Boolean)
            .join(" + "),
          input_completo: resumirEntrada(validatedData),
          calificacion: getRatingPromptValue(validatedData.rating),
          ...contarInsumos(validatedData),
          tiempo_total: Date.now() - inicioRequest,
          estado: "fallido",
          error_mensaje:
            error instanceof Error ? error.message : "Error desconocido",
          created_at: new Date(),
        });
      } catch (errorAnalytics) {
        console.error("No se pudo registrar el fallo en analytics:", errorAnalytics);
      }
    }

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