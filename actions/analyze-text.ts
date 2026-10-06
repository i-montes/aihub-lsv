"use server";

import { generateObject } from "ai";
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
import { obtenerProveedorDeHerramienta, ProveedorNoConfiguradoError, type ProveedorEnUso } from "@/lib/proveedores/configuracion";
import { crearModeloConfigurado, MAX_OUTPUT_TOKENS } from "@/lib/proveedores/opciones-modelo";

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
    }),
  ),
});

export async function analyzeText(
  text: string,
  selectedModelElegido: { model: string; provider: string },
) {
  let selectedModel = selectedModelElegido;
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

    // 2. Clave, modelo y ajustes del proveedor elegido, desde Ajustes > Herramientas
    let configuracion;
    try {
      configuracion = await obtenerProveedorDeHerramienta(organizationId, "proofreader", selectedModel.provider);
    } catch (error) {
      const mensaje = error instanceof ProveedorNoConfiguradoError ? error.message : "No se pudo obtener la configuración del proveedor";
      await debugLogger.logApiKey("API key not found", "not_found", { provider: selectedModel.provider as any, status: "not_found", hasValue: false }, { message: mensaje, code: "API_KEY_NOT_FOUND" });
      await debugLogger.finalize("failed", { error: { message: mensaje, code: "API_KEY_NOT_FOUND" } });
      return {
        success: false,
        error: mensaje,
        correcciones: [],
        debugLogs: debugLogger.getLogs(),
      };
    }
    const apiKey = configuracion.apiKey;
    // El modelo lo decide la configuración, no el cliente.
    selectedModel = { provider: configuracion.proveedor, model: configuracion.modelo };

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

    // 5. Tamiz con Jev y corrección frase por frase.
    //
    // El camino rápido corta el texto en frases, le pregunta a Jev cuáles
    // incumplen el manual y manda al corrector sólo las que pasan el umbral,
    // con las reglas sospechosas en vez del manual entero. Si no hay
    // `TYPESAFE_API_KEY` o el tamiz se cae, se sigue por el flujo de siempre.
    //
    // Está apagado por defecto: el flujo clásico de una sola llamada es el
    // normal y Jev sólo entra con CORRECTOR_CON_JEV=true.
    //
    // Las frases marcadas se corrigen con un modelo propio, rápido y barato,
    // porque son muchas llamadas cortas en paralelo y no una grande. El
    // paso por frase usa el modelo fijo de OpenAI si el Corrector tiene
    // OpenAI encendido; si no, el proveedor elegido.
    const conJev = process.env.CORRECTOR_CON_JEV === "true";

    // Con Jev apagado no se usa, pero las analíticas lo leen si hubo porFrase.
    let corrector: { modelo: { provider: string; model: string }; apiKey: string } = { modelo: selectedModel, apiKey };
    let porFrase = null;
    if (!conJev) {
      debugLogger.info("Tamiz con Jev apagado (CORRECTOR_CON_JEV): flujo de una sola llamada");
    } else {
      try {
        try {
          const openai = await obtenerProveedorDeHerramienta(organizationId, "proofreader", "OPENAI");
          corrector = { modelo: MODELO_CORRECTOR, apiKey: openai.apiKey };
        } catch (error) {
          if (!(error instanceof ProveedorNoConfiguradoError)) throw error;
          corrector = { modelo: selectedModel, apiKey };
          debugLogger.warn(`Sin OpenAI en el Corrector: las frases se corrigen con ${selectedModel.model}`);
          console.error(`[corrector] sin OpenAI en el Corrector; se usa ${selectedModel.model}`);
        }

        debugLogger.info("Intentando análisis por frase con Jev", {
          modeloCorrector: corrector.modelo.model,
        });

        porFrase = await analizarPorFrase(text, {
          modeloElegido: corrector.modelo,
          apiKey: corrector.apiKey,
          promptPrincipal: principalPrompt,
          guiaDeEstilo: styleGuidePrompt,
          // MODELO_CORRECTOR es a propósito rápido: se deja con los valores por
          // defecto del modelo (null, no se envían). Con el proveedor elegido sí
          // se respeta lo configurado.
          reasoningEffort: corrector.modelo === selectedModel ? configuracion.reasoningEffort : null,
          verbosity: corrector.modelo === selectedModel ? configuracion.verbosity : null,
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
        configuracion,
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
        conJev,
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
  configuracion,
  debugLogger,
}: {
  text: string;
  principalPrompt: string;
  styleGuidePrompt: string;
  selectedModel: { model: string; provider: string };
  configuracion: ProveedorEnUso;
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

  const { model, providerOptions } = crearModeloConfigurado(configuracion);
  const result = await generateObject({
    model,
    schema: ProofreaderResponseSchema,
    prompt: combinedPrompt,
    // Sin tope, los artículos largos truncaban el JSON a la mitad y el usuario
    // recibía "Error al procesar la respuesta del modelo" sin ninguna corrección.
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions,
  });

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
