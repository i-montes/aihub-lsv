"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { DebugLogger } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";

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

interface GenerateNewsletterParams {
  images: string[]; // base64 encoded images
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
}: GenerateNewsletterParams) {
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
      const supabase = getSupabaseClient();

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
          correcciones: [],
          debugLogs: debugLogger.getLogs(),
        };
      }

      // Verificar que la clave API no esté vacía
      if (!apiKeyData.key || apiKeyData.key.trim() === "") {
        debugLogger.error("La API key está vacía o no es válida");
        return {
          success: false,
          error: "La API key está vacía o no es válida",
          correcciones: [],
          debugLogs: debugLogger.getLogs(),
        };
      }

      debugLogger.info("API key obtenida correctamente", {
        provider: apiKeyData.provider,
      });

      // 3. Obtener la configuración de la herramienta "proofreader"
      debugLogger.info(
        "Obteniendo configuración de la herramienta proofreader"
      );
      const { data: toolData, error: toolError } = await supabase
        .from("tools")
        .select("prompts, temperature, top_p, schema")
        .eq("organization_id", organizationId)
        .eq("identity", "proofreader")
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
            .eq("identity", "proofreader")
            .single();

        if (defaultToolError || !defaultToolData) {
          debugLogger.error(
            "Error al obtener la configuración de la herramienta",
            defaultToolError
          );
          return {
            success: false,
            error: "No se pudo obtener la configuración de la herramienta",
            correcciones: [],
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
    } catch (error) {
      debugLogger.error("Error analyzing text", { error });
    }
  } catch (error) {
    console.error("Error generating newsletter:", error);
    return {
      success: false,
      error: "Failed to generate newsletter",
    };
  }
}
