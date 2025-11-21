"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ResponseFormat } from "@/components/tools/response-format";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ApiKeyRequiredModal } from "../proofreader/api-key-required-modal";
import { Checkbox } from "@/components/ui/checkbox";

interface ToolConfigProps {
  schema?: any;
  onSchemaChange?: (schema: any) => void;
  temperature?: number;
  onTemperatureChange?: (temperature: number) => void;
  topP?: number;
  onTopPChange?: (topP: number) => void;
  models?: { provider: string; model: string }[];
  onModelsChange?: (models: { provider: string; model: string }[]) => void;
}

/**
 * Configuration component for tool settings
 */
export function ToolConfig({
  schema,
  onSchemaChange,
  temperature = 0.7,
  onTemperatureChange,
  topP = 1,
  onTopPChange,
  models = [],
  onModelsChange,
}: ToolConfigProps) {
  const [schemaText, setSchemaText] = useState<string>(
    schema ? JSON.stringify(schema, null, 2) : JSON.stringify({}, null, 2)
  );

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showModelError, setShowModelError] = useState<boolean>(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    isLoading: boolean;
    hasApiKey: boolean;
    isAdmin: boolean;
  }>({
    isLoading: true,
    hasApiKey: false,
    isAdmin: false,
  });

  const [modelProviderMap, setModelProviderMap] = useState<
    Record<string, string>
  >({});

  const getProviderDisplayName = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case "openai":
        return "OpenAI";
      case "anthropic":
        return "Anthropic";
      case "google":
        return "Google";
      default:
        return provider;
    }
  };

  const checkApiKeyExists = async () => {
    try {
      setApiKeyStatus((prev) => ({ ...prev, isLoading: true }));
      const supabase = getSupabaseClient();

      // Obtener la sesión del usuario actual
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
        return;
      }

      // Obtener el ID de la organización y el rol del usuario
      const { data: profileData, error: userError } = await supabase
        .from("profiles")
        .select("organizationId, role")
        .eq("id", userData.user.id)
        .single();

      if (userError || !profileData?.organizationId) {
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
        return;
      }

      // Verificar si el usuario es admin o propietario
      const isAdmin =
        profileData.role === "OWNER" || profileData.role === "ADMIN";

      // Verificar si existe alguna API key para esta organización y obtener sus modelos
      const { data: apiKeys, error: apiKeyError } = await supabase
        .from("api_key_table")
        .select("id, models, provider")
        .eq("organizationId", profileData.organizationId)
        .eq("status", "ACTIVE");

      if (apiKeyError) {
        console.error("Error al verificar API keys:", apiKeyError);
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin });
        return;
      }

      // Extraer todos los modelos disponibles de las API keys con su proveedor
      const allModels: string[] = [];
      const map: Record<string, string> = {};
      apiKeys.forEach(
        (key: { id: string; models: string[]; provider: string }) => {
          if (key.models && Array.isArray(key.models)) {
            key.models.forEach((model) => {
              if (!allModels.includes(model)) {
                allModels.push(model);
                map[model] = key.provider || "";
              }
            });
          }
        }
      );

      // Si hay al menos una API key, establecer hasApiKey como true
      setApiKeyStatus({
        isLoading: false,
        hasApiKey: apiKeys.length > 0,
        isAdmin,
      });

      // Establecer los modelos disponibles
      setAvailableModels(allModels);

      // Establecer el modelo seleccionado por defecto (el primero de la lista o vacío si no hay)
      if (apiKeys.length > 0 && allModels.length > 0 && (!models || models.length === 0)) {
        const defaultModel = allModels[0];
        setSelectedModels([defaultModel]);
        
        // Update parent component with default model
        if (onModelsChange) {
          onModelsChange([{
            model: defaultModel,
            provider: map[defaultModel] || ""
          }]);
        }
      }

      setModelProviderMap(map);
    } catch (error) {
      console.error("Error al verificar API keys:", error);
      setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
    }
  };

  // Initialize selected models from props
  useEffect(() => {
    if (models && models.length > 0) {
      const modelNames = models.map(m => m.model);
      setSelectedModels(modelNames);
    }
  }, [models]);

  const handleModelChange = (model: string, checked: boolean) => {
    // Prevent unchecking the last selected model
    if (!checked && selectedModels.length === 1 && selectedModels.includes(model)) {
      setShowModelError(true);
      // Hide error message after 3 seconds
      setTimeout(() => setShowModelError(false), 3000);
      return;
    }

    let newSelectedModels: string[];
    
    if (checked) {
      newSelectedModels = [...selectedModels, model];
      setShowModelError(false); // Clear any previous error
    } else {
      newSelectedModels = selectedModels.filter(m => m !== model);
    }
    
    setSelectedModels(newSelectedModels);
    
    // Update parent component with proper format
    if (onModelsChange) {
      const modelsWithProvider = newSelectedModels.map(modelName => ({
        model: modelName,
        provider: modelProviderMap[modelName] || ""
      }));
      onModelsChange(modelsWithProvider);
    }
  };

  // Cargar los modelos disponibles al montar el componente
  useEffect(() => {
    checkApiKeyExists();
  }, []);

  return (
    <div className="space-y-6">
      <ApiKeyRequiredModal
        isLoading={apiKeyStatus.isLoading}
        isOpen={!apiKeyStatus.hasApiKey}
        isAdmin={apiKeyStatus.isAdmin}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Modelos
        </label>
        {showModelError && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600">
              Debe seleccionar al menos un modelo
            </p>
          </div>
        )}
        <div className={`space-y-2 max-h-40 overflow-y-auto ${selectedModels.length === 0 ? 'border border-red-300 rounded-md p-2' : ''}`}>
          {availableModels.length > 0 ? (
            availableModels.map((model) => (
              <div key={model} className="flex items-center space-x-2">
                <Checkbox
                  id={model}
                  checked={selectedModels.includes(model)}
                  onCheckedChange={(checked) => 
                    handleModelChange(model, checked as boolean)
                  }
                />
                <label
                  htmlFor={model}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {model} ({getProviderDisplayName(modelProviderMap[model])})
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay modelos disponibles</p>
          )}
        </div>
        {selectedModels.length === 0 && availableModels.length > 0 && (
          <p className="text-xs text-red-500 mt-1">
            Seleccione al menos un modelo para continuar
          </p>
        )}
      </div>

      {/* <div>
        <Label
          htmlFor="temperature"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          Temperatura: {temperature.toFixed(1)}
        </Label>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.1}
          value={[temperature]}
          onValueChange={(values) =>
            onTemperatureChange && onTemperatureChange(values[0])
          }
          className="w-full [&>span[data-orientation=horizontal]]:bg-gray-300 [&>span[data-orientation=horizontal]>span]:bg-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Controla la aleatoriedad de las respuestas. Valores más bajos generan
          respuestas más predecibles.
        </p>
      </div>

      <div>
        <Label
          htmlFor="top-p"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          Top P: {topP.toFixed(1)}
        </Label>
        <Slider
          id="top-p"
          min={0}
          max={1}
          step={0.1}
          value={[topP]}
          onValueChange={(values) => onTopPChange && onTopPChange(values[0])}
          className="w-full [&>span[data-orientation=horizontal]]:bg-gray-300 [&>span[data-orientation=horizontal]>span]:bg-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Controla la diversidad de las respuestas. Valores más bajos generan
          respuestas más enfocadas.
        </p>
      </div> */}

      {/* <div>
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Formato de Respuesta
        </Label>
        <ResponseFormat jsonSchema={schema} />
      </div> */}
    </div>
  );
}
