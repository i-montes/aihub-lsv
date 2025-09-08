import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/**
 * Interface para el estado de las API keys
 */
interface ApiKeyStatus {
  isLoading: boolean;
  hasApiKey: boolean;
  isAdmin: boolean;
}

/**
 * Hook personalizado para manejar el estado de verificación de API keys
 * @returns {ApiKeyStatus} Estado actual de las API keys y función para recargar
 */
export const useApiKeyStatus = () => {
  const { profile } = useAuth();
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({
    isLoading: true,
    hasApiKey: false,
    isAdmin: false,
  });

  /**
   * Verifica si existen API keys activas para la organización
   */
  const checkApiKeyExists = async () => {
    try {
      setApiKeyStatus((prev) => ({ ...prev, isLoading: true }));
      const supabase = getSupabaseClient();

      const isAdmin = profile?.role === "OWNER" || profile?.role === "ADMIN";

      const { data: apiKeys, error: apiKeyError } = await supabase
        .from("api_key_table")
        .select("id, models, provider")
        .eq("organizationId", profile?.organizationId)
        .eq("status", "ACTIVE");

      if (apiKeyError) {
        console.error("Error al verificar API keys:", apiKeyError);
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin });
        return;
      }

      const hasApiKey = apiKeys && apiKeys.length > 0;
      setApiKeyStatus({ isLoading: false, hasApiKey, isAdmin });
    } catch (error) {
      console.error("Error:", error);
      setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
    }
  };

  // Verificar API keys al cargar el hook
  useEffect(() => {
    checkApiKeyExists();
  }, [profile?.organizationId]);

  return {
    ...apiKeyStatus,
    checkApiKeyExists,
  };
};