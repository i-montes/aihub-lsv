import type React from "react";
import { useState, useEffect } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormMessage } from "@/components/ui/form";
import { type FormSchema } from "../constants";
import { Bot, HelpCircle, GitCompare } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { MODELS } from "@/lib/utils";

/**
 * Interface para modelos disponibles
 */
interface ModelInfo {
  provider: string;
  model: string;
}

/**
 * Props para el componente ModelSelectionSection
 */
interface ModelSelectionSectionProps {
  control: Control<FormSchema>;
  errors: any;
  setValue: UseFormSetValue<FormSchema>;
  getValues: UseFormGetValues<FormSchema>;
}

/**
 * Sección de selección de modelos AI
 * Permite elegir el modelo principal y modelos para comparación
 */
export const ModelSelectionSection: React.FC<ModelSelectionSectionProps> = ({
  control,
  errors,
  setValue,
  getValues,
}) => {
  const { profile } = useAuth();
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [compareEnabled, setCompareEnabled] = useState(
    getValues("compare") || false
  );

  /**
   * Función para obtener el nombre de display del proveedor
   */
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

  /**
   * Carga los modelos disponibles desde las API keys activas
   */
  const loadAvailableModels = async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseClient();

      const { data: apiKeys, error } = await supabase
        .from("api_key_table")
        .select("models, provider")
        .eq("organizationId", profile?.organizationId)
        .eq("status", "ACTIVE");

      if (error) {
        console.error("Error al cargar modelos:", error);
        toast.error("Error al cargar modelos disponibles");
        return;
      }

      const models: ModelInfo[] = [];
      apiKeys?.forEach((apiKey: any) => {
        if (apiKey.models && Array.isArray(apiKey.models)) {
          apiKey.models.forEach((model: string) => {
            models.push({
              provider: apiKey.provider.toLowerCase(),
              model: model,
            });
          });
        }
      });

      setAvailableModels(models);

      // Always set first model as selected by default
      if (models.length > 0) {
        setValue("selectedModel", models[0]);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar modelos");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar modelos al montar el componente
  useEffect(() => {
    if (profile?.organizationId) {
      loadAvailableModels();
    }
  }, [profile?.organizationId]);

  // Manejar cambio en el switch de comparación
  const handleCompareToggle = (enabled: boolean) => {
    setCompareEnabled(enabled);
    setValue("compare", enabled);

    if (!enabled) {
      // Limpiar modelos de comparación si se desactiva
      setValue("model_to_compare_1", { provider: "", model: "" });
      setValue("model_to_compare_2", { provider: "", model: "" });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Selección de modelos de IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Switch para habilitar comparación */}
        <div className="flex items-center justify-between space-x-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="compare-models"
              className="text-base font-medium flex items-center gap-2"
            >
              <GitCompare className="w-4 h-4" />
              Comparar modelos
            </Label>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Activa para comparar resultados entre diferentes modelos de IA
              </div>
            </div>
          </div>
          <Controller
            name="compare"
            control={control}
            render={({ field }) => (
              <Switch
                id="compare-models"
                checked={compareEnabled}
                onCheckedChange={handleCompareToggle}
              />
            )}
          />
        </div>

        <hr className="my-6 border-t border-gray-200 w-full opacity-50 shadow-sm" />

        {/* Modelo principal */}
        {!compareEnabled && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">
                Modelo principal *
              </Label>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Selecciona el modelo de IA que realizará el análisis
                </div>
              </div>
            </div>
            <Controller
              name="selectedModel"
              control={control}
              render={({ field }) => (
                <Select
                  value={
                    field.value
                      ? `${field.value.provider}|${field.value.model}`
                      : ""
                  }
                  onValueChange={(value) => {
                    if (value) {
                      const [provider, model] = value.split("|");
                      field.onChange({ provider, model });
                    }
                  }}
                  disabled={isLoading || availableModels.length === 0}
                >
                  <SelectTrigger
                    className={`${
                      errors?.selectedModel ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        isLoading
                          ? "Cargando modelos..."
                          : availableModels.length === 0
                          ? "No hay modelos disponibles"
                          : "Seleccionar modelo"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((modelInfo) => (
                      <SelectItem
                        key={`${modelInfo.provider}|${modelInfo.model}`}
                        value={`${modelInfo.provider}|${modelInfo.model}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {getProviderDisplayName(modelInfo.provider)}
                          </span>
                          <span>
                            {MODELS[modelInfo.model as keyof typeof MODELS]}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.selectedModel && (
              <FormMessage>{errors.selectedModel.message}</FormMessage>
            )}
          </div>
        )}

        {/* Modelos de comparación */}
        {compareEnabled && (
          <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
            {/* Primer modelo de comparación */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Modelo 1 *
              </Label>
              <Controller
                name="model_to_compare_1"
                control={control}
                render={({ field }) => (
                  <Select
                    value={
                      field.value
                        ? `${field.value.provider}|${field.value.model}`
                        : ""
                    }
                    onValueChange={(value) => {
                      if (value) {
                        const [provider, model] = value.split("|");
                        field.onChange({ provider, model });
                      }
                    }}
                    disabled={isLoading || availableModels.length === 0}
                  >
                    <SelectTrigger
                      className={`${
                        errors?.model_to_compare_1 ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((modelInfo) => (
                        <SelectItem
                          key={`compare1-${modelInfo.provider}|${modelInfo.model}`}
                          value={`${modelInfo.provider}|${modelInfo.model}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {getProviderDisplayName(modelInfo.provider)}
                            </span>
                            <span>{MODELS[modelInfo.model as keyof typeof MODELS]}</span>
                            
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.model_to_compare_1 && (
                <FormMessage>{errors.model_to_compare_1.message}</FormMessage>
              )}
            </div>

            {/* Segundo modelo de comparación */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Modelo 2 *
              </Label>
              <Controller
                name="model_to_compare_2"
                control={control}
                render={({ field }) => (
                  <Select
                    value={
                      field.value
                        ? `${field.value.provider}|${field.value.model}`
                        : ""
                    }
                    onValueChange={(value) => {
                      if (value) {
                        const [provider, model] = value.split("|");
                        field.onChange({ provider, model });
                      }
                    }}
                    disabled={isLoading || availableModels.length === 0}
                  >
                    <SelectTrigger
                      className={`${
                        errors?.model_to_compare_2 ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((modelInfo) => (
                        <SelectItem
                          key={`compare2-${modelInfo.provider}|${modelInfo.model}`}
                          value={`${modelInfo.provider}|${modelInfo.model}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {getProviderDisplayName(modelInfo.provider)}
                            </span>
                            <span>{MODELS[modelInfo.model as keyof typeof MODELS]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.model_to_compare_2 && (
                <FormMessage>{errors.model_to_compare_2.message}</FormMessage>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
