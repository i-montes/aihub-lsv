"use server";

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { DebugLogger } from "@/lib/logger";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AnalyticsCorrectorDeTextosService } from "@/lib/analytics";
import { calcularCosto } from "@/lib/costos";
import {
  analizarPorFrase,
  MODELO_CORRECTOR,
  type CorreccionPlana,
  type PasoDeFrase,
} from "@/lib/proofreader/correccion-por-frase";

// Schema para la respuesta del modelo
// Artículos largos truncaban el JSON a la mitad y el usuario recibía
// "Error al procesar la respuesta del modelo" sin ninguna corrección.
const MAX_OUTPUT_TOKENS = 16000;

const ProofreaderResponseSchema = z.object({
  correcciones: z.array(
    z.object({
      original: z.string().describe("Fragmento del texto original con error"),
      suggestion: z.string().describe("Corrección sugerida para el error"),
      type: z
        .enum(["spelling", "grammar", "style", "punctuation"])
        .describe("Tipo de error: spelling | grammar | style | punctuation"),
      explanation: z.string().describe("Explicación de la corrección"),
    }),
  ),
});

export async function analyzeText(
  text: string,
  selectedModel: { model: string; provider: string },
) {
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
          effort: "medium",
          verbosity: "medium",
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
          effort: "medium",
          verbosity: "medium",
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
      },
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
        },
      );

      await debugLogger.finalize("failed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          effort: "medium",
          verbosity: "medium",
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
        },
      );

      await debugLogger.finalize("failed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          effort: "medium",
          verbosity: "medium",
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
      .select("prompts, schema")
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
          effort: "medium",
          verbosity: "medium",
          hasSchema: false,
        },
      );

      debugLogger.warn(
        "No se encontró configuración personalizada, usando configuración por defecto",
      );
      const { data: defaultToolData, error: defaultToolError } = await supabase
        .from("default_tools")
        .select("prompts, schema")
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
          },
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
          effort: "medium",
          verbosity: "medium",
          hasSchema: !!toolData.schema,
          promptTitles: toolData.prompts?.map((p: any) => p.title) || [],
        },
      );

      tool = toolData;
      debugLogger.info("Configuración personalizada obtenida");
    }

    debugLogger.info("Configuración de herramienta obtenida", {
      effort: "medium",
      verbosity: "medium",
      promptsCount: tool.prompts?.length || 0,
    });

    // 4. Combinar los prompts "Principal" y "Guía de estilo"
    debugLogger.info("Procesando prompts");
    const prompts = tool.prompts || [];
    let principalPrompt = "";
    let styleGuidePrompt = "";

    // Buscar los prompts por título. La comparación se normaliza (sin tildes,
    // sin mayúsculas, sin espacios de más) porque antes era exacta: un prompt
    // llamado "Guía de estilo" en vez de "Guia de estilo" dejaba la guía
    // vacía y el modelo caía en español estándar, sin ningún aviso.
    const normalize = (value: string) =>
      (value || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim()
        .toLowerCase();

    for (const prompt of prompts) {
      const title = normalize(prompt.title);
      if (title === "principal") {
        principalPrompt = prompt.content;
        debugLogger.info("Prompt principal encontrado");
      } else if (title.includes("estilo")) {
        styleGuidePrompt = prompt.content;
        debugLogger.info("Guía de estilo encontrada");
      }
    }

    // Que la guía no aparezca es la causa típica de que el corrector ignore
    // el manual propio, así que se registra en vez de fallar en silencio.
    if (!principalPrompt) {
      debugLogger.error("No se encontró el prompt 'Principal' de la herramienta", {
        titulosDisponibles: prompts.map((p: any) => p.title),
      });
    }
    if (!styleGuidePrompt) {
      debugLogger.error("No se encontró la guía de estilo de la herramienta", {
        titulosDisponibles: prompts.map((p: any) => p.title),
      });
    }

    const apiKey = apiKeyData.key;

    // 5. Tamiz con Jev y corrección frase por frase.
    //
    // El camino rápido corta el texto en frases, le pregunta a Jev cuáles
    // incumplen el manual y manda al corrector sólo las que pasan el umbral,
    // con las reglas sospechosas en vez del manual entero. Si no hay
    // `TYPESAFE_API_KEY` o el tamiz se cae, se sigue por el flujo de siempre.
    //
    // Las frases marcadas se corrigen con un modelo propio, rápido y barato,
    // porque son muchas llamadas cortas en paralelo y no una grande. El
    // selector de la interfaz se usa sólo si no hay clave de ese proveedor.
    // La comparación del proveedor se hace aquí y no en la consulta: la tabla
    // lo guarda en mayúsculas ("OPENAI") y filtrar por la constante en
    // minúscula dejaba la clave sin encontrar, así que el corrector caía al
    // modelo del selector sin que se notara. Traer las activas de la
    // organización y comparar en JS no depende de cómo trate PostgREST las
    // mayúsculas.
    const { data: clavesActivas } = await supabase
      .from("api_key_table")
      .select("key, provider")
      .eq("organizationId", organizationId)
      .eq("status", "ACTIVE");

    const claveCorrector = (clavesActivas ?? []).find(
      (c: { key: string | null; provider: string | null }) =>
        c.provider?.toLowerCase() === MODELO_CORRECTOR.provider.toLowerCase() &&
        c.key?.trim(),
    );

    const corrector = claveCorrector
      ? { modelo: MODELO_CORRECTOR, apiKey: claveCorrector.key }
      : { modelo: selectedModel, apiKey };

    if (!claveCorrector) {
      debugLogger.warn(
        `Sin clave de ${MODELO_CORRECTOR.provider}: las frases se corrigen con el modelo elegido`,
        { modelo: selectedModel.model },
      );
      console.error(
        `[corrector] ⚠️  sin clave ${MODELO_CORRECTOR.provider} activa; se usa ${selectedModel.model}.`,
        "Proveedores activos:",
        (clavesActivas ?? []).map((c: { provider: string | null }) => c.provider),
      );
    }

    debugLogger.info("Intentando análisis por frase con Jev", {
      modeloCorrector: corrector.modelo.model,
    });

    let porFrase = null;
    try {
      porFrase = await analizarPorFrase(text, {
        modeloElegido: corrector.modelo,
        apiKey: corrector.apiKey,
        promptPrincipal: principalPrompt,
        guiaDeEstilo: styleGuidePrompt,
      });

      if (!porFrase) {
        debugLogger.warn(
          "Sin TYPESAFE_API_KEY: se usa el flujo de una sola llamada",
        );
        // A la consola además del logger: los mensajes del logger sólo viajan
        // al cliente, y quedarse sin camino rápido en silencio fue justo lo
        // que costó media tarde de diagnóstico.
        console.error("[corrector] ⚠️  TYPESAFE_API_KEY vacía → flujo clásico");
      } else {
        debugLogger.info("Análisis por frase completado", porFrase.detalle);
        console.log("[corrector] ✅ tamiz por frase:", porFrase.detalle);
      }
    } catch (error) {
      debugLogger.error(
        "El análisis por frase falló; se cae al flujo de una sola llamada",
        error,
      );
      console.error("[corrector] ❌ el tamiz falló → flujo clásico:", error);
    }

    let correcciones: CorreccionPlana[];
    // La traza alimenta el modal de proceso del corrector; el flujo viejo no
    // tiene nada que contar porque es una sola llamada con todo el texto.
    let traza: PasoDeFrase[] = [];
    let detallePorFrase: Record<string, unknown> | null = null;
    // La petición real que se le mandó a Jev, para poder mirarla en la UI.
    let ejemploPeticion: unknown = null;
    let peticionesTamiz: unknown[] = [];
    let ejemploCorreccion: unknown = null;
    let uso: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
      cachedInputTokens?: number;
      cacheWriteTokens?: number;
      reasoningTokens?: number;
    };

    if (porFrase) {
      correcciones = porFrase.correcciones;
      uso = porFrase.uso;
      traza = porFrase.traza;
      detallePorFrase = porFrase.detalle;
      ejemploPeticion = porFrase.ejemploPeticion;
      peticionesTamiz = porFrase.peticiones;
      ejemploCorreccion = porFrase.ejemploCorreccion;
    } else {
      ({ correcciones, uso } = await analizarDeUnaSolaVez({
        text,
        principalPrompt,
        styleGuidePrompt,
        selectedModel,
        apiKey,
        debugLogger,
      }));
    }

    debugLogger.info("Respuesta generada exitosamente", {
      correcciones: correcciones.length,
      usage: uso,
      porFrase: Boolean(porFrase),
    });

    // 6. Entregar las correcciones ya validadas contra el esquema.
    try {
      const correccionesConId = correcciones.map((correccion, index) => ({
        ...correccion,
        id: `correction-${index}`,
      }));

      debugLogger.info(
        `Análisis completado exitosamente con ${correccionesConId.length} correcciones`,
      );

      // Preparar resultados de análisis para el log
      const analysisResults = correccionesConId.reduce((acc: any[], corr: any) => {
        const existing = acc.find((r) => r.type === corr.type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            type: corr.type,
            count: 1,
          });
        }
        return acc;
      }, []);

      // Finalizar con éxito
      const metrics = {
        session_id: debugLogger.getSessionId(),
        user_id: user.id,
        organization_id: profile.organizationId,
        texto_original: text,
        longitud_caracteres: text.length,
        total_sugerencias_generadas: correccionesConId.length,
        tiempo_de_analisis: debugLogger.getDuration(),
        created_at: new Date(),
        updated_at: new Date(),
        // El que de verdad corrigió, no el del selector: desde que el camino
        // por frase usa su propio modelo, reportar el elegido hacía que las
        // analíticas y el costo apuntaran al modelo equivocado.
        modelo_utilizado: porFrase ? corrector.modelo.model : selectedModel.model,
        uso_copiar_texto: false,
        total_tokens: uso.totalTokens,
        input_tokens: uso.inputTokens,
        output_tokens: uso.outputTokens,
        reasoning_tokens: uso.reasoningTokens,
        cached_input_tokens: uso.cachedInputTokens,
        cache_write_tokens: uso.cacheWriteTokens,
        costo: calcularCosto(
          porFrase ? corrector.modelo.provider : selectedModel.provider,
          porFrase ? corrector.modelo.model : selectedModel.model,
          {
            inputTokens: uso.inputTokens,
            outputTokens: uso.outputTokens,
            cachedInputTokens: uso.cachedInputTokens,
            cacheWriteTokens: uso.cacheWriteTokens,
          },
        ),
      };
      const analitics = new AnalyticsCorrectorDeTextosService(metrics);
      await analitics.save();
      analitics.avisarSiNoGuardo("corrector completado");
      const analitics_id = analitics.schema.id;
      await debugLogger.finalize("completed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          effort: "medium",
          verbosity: "medium",
        },
        metrics: {
          inputLength: text.length,
          outputLength: JSON.stringify(correccionesConId).length,
          tokensUsed: uso.totalTokens,
          processingTime: debugLogger.getDuration(),
          itemsProcessed: correccionesConId.length,
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
        correcciones: correccionesConId,
        debugLogs: debugLogger.getLogs(),
        traza,
        detallePorFrase,
        ejemploPeticion,
        peticionesTamiz,
        ejemploCorreccion,
        analitics_id,
      };
    } catch (error) {
      console.error("Error al analizar el texto:", error);
      await debugLogger.finalize("failed", {
        model: {
          provider: selectedModel.provider as any,
          model: selectedModel.model,
          effort: "medium",
          verbosity: "medium",
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
        effort: "medium",
        verbosity: "medium",
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

/**
 * El corrector de siempre: el texto entero y el manual entero en una sola
 * llamada al modelo caro.
 *
 * Se conserva como red de seguridad del camino por frase. Sigue teniendo el
 * problema que lo motivó —en notas largas el JSON se trunca y no vuelve
 * ninguna corrección—, así que es un respaldo, no una alternativa.
 */
async function analizarDeUnaSolaVez({
  text,
  principalPrompt,
  styleGuidePrompt,
  selectedModel,
  apiKey,
  debugLogger,
}: {
  text: string;
  principalPrompt: string;
  styleGuidePrompt: string;
  selectedModel: { model: string; provider: string };
  apiKey: string;
  debugLogger: DebugLogger;
}) {
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

  debugLogger.info("Iniciando generación de texto con el modelo", {
    provider: selectedModel.provider,
    model: selectedModel.model,
  });

  let result;

  switch (selectedModel.provider.toLowerCase()) {
    case "openai":
      debugLogger.info("Usando proveedor OpenAI");
      const openai = createOpenAI({
        apiKey: apiKey,
      });

      result = await generateObject({
        model: openai(selectedModel.model),
        schema: ProofreaderResponseSchema,
        prompt: combinedPrompt,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        providerOptions: {
          openai: {
            reasoningEffort: "medium",
            textVerbosity: "medium",
            store: false,
          },
        },
      });
      break;
    case "anthropic":
      debugLogger.info("Usando proveedor Anthropic");
      const anthropic = createAnthropic({
        apiKey: apiKey,
      });

      result = await generateObject({
        model: anthropic(selectedModel.model),
        schema: ProofreaderResponseSchema,
        prompt: combinedPrompt,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      });
      break;
    case "google":
      debugLogger.info("Usando proveedor Google");
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

      result = await generateObject({
        model: google(selectedModel.model),
        schema: ProofreaderResponseSchema,
        prompt: combinedPrompt,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
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

  return {
    correcciones: result.object.correcciones,
    uso: {
      inputTokens: result.usage?.inputTokens,
      outputTokens: result.usage?.outputTokens,
      totalTokens: result.usage?.totalTokens,
      // Campos canónicos, no los alias `reasoningTokens`/`cachedInputTokens`
      // de nivel superior (deprecados y sin equivalente para cacheWriteTokens).
      reasoningTokens: result.usage?.outputTokenDetails?.reasoningTokens,
      cachedInputTokens: result.usage?.inputTokenDetails?.cacheReadTokens,
      cacheWriteTokens: result.usage?.inputTokenDetails?.cacheWriteTokens,
    },
  };
}
