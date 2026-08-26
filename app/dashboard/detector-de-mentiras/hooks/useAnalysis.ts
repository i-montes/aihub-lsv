import { useState } from "react";
import { UseFormGetValues } from "react-hook-form";
import { toast } from "sonner";
import { FormSchema } from "../constants";
import { extractUrlsFromText } from "../utils";
import { MODELS } from "@/lib/utils";

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
};

/** Nombre legible del modelo para las pestañas de comparación */
const formatModelName = (
  model: { provider?: string; model?: string } | undefined,
  fallback: string
): string => {
  if (!model?.provider || !model?.model) return fallback;

  const provider =
    PROVIDER_LABELS[model.provider.toLowerCase()] ?? model.provider;
  const name = MODELS[model.model as keyof typeof MODELS] ?? model.model;

  return `${provider} · ${name}`;
};

/**
 * Completa los metadatos de los enlaces que todavía no se hayan analizado.
 *
 * TextUrlExtractor analiza las URLs mientras el usuario escribe, pero si se
 * pulsa "Generar" antes de que termine, esos enlaces llegarían al prompt sin
 * su contenido. Aquí se rellenan los que falten antes de enviar.
 */
const completeUrlMetadata = async (data: FormSchema): Promise<FormSchema> => {
  const fields = ["disinformation", "verification", "additional_context"] as const;

  const pendingUrls = Array.from(
    new Set(
      fields.flatMap((field) => {
        const metadata = data[field].metadata ?? {};
        return extractUrlsFromText(data[field].text).filter(
          (url) => !metadata[url]?.complete_text
        );
      })
    )
  );

  if (pendingUrls.length === 0) return data;

  const response = await fetch("/api/url-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls: pendingUrls }),
  });

  if (!response.ok) {
    throw new Error("No se pudo extraer el contenido de los enlaces");
  }

  const { results } = await response.json();
  const byUrl = new Map<string, any>(
    (results ?? []).map((result: any) => [result.url, result])
  );

  const merge = <F extends (typeof fields)[number]>(field: F): FormSchema[F] => {
    const metadata = { ...(data[field].metadata ?? {}) };

    for (const url of extractUrlsFromText(data[field].text)) {
      const result = byUrl.get(url);
      if (result) metadata[url] = result;
    }

    return { ...data[field], metadata };
  };

  return {
    ...data,
    disinformation: merge("disinformation"),
    verification: merge("verification"),
    additional_context: merge("additional_context"),
  };
};

/**
 * Hook personalizado para manejar la generación de análisis con IA
 * @param getValues - Función getValues de React Hook Form
 * @param hasApiKey - Indica si hay API keys disponibles
 * @returns Estado y funciones para el análisis
 */
export const useAnalysis = (
  getValues: UseFormGetValues<FormSchema>,
  hasApiKey: boolean
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [comparisonResults, setComparisonResults] = useState<{
    result1: string;
    result2: string;
    model1Name: string;
    model2Name: string;
  } | null>(null);

  /**
   * Genera el análisis con IA basado en los datos del formulario usando respuesta JSON
   */
  const generateAnalysis = async (data: FormSchema) => {
    if (!hasApiKey) {
      toast.error("Se requiere una API key para generar el análisis");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep("Iniciando análisis con IA...");
    setAnalysisResult(""); // Limpiar resultado anterior

    try {
      // Asegurar que todos los enlaces tengan su contenido antes de generar
      setAnalysisStep("Extrayendo enlaces...");
      setAnalysisProgress(10);

      const completedData = await completeUrlMetadata(data);

      // Realizar la petición a la API
      setAnalysisStep("Enviando datos...");
      setAnalysisProgress(25);

      const response = await fetch('/api/detector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completedData),
      });

      setAnalysisStep("Procesando respuesta...");
      setAnalysisProgress(50);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la API');
      }

      const result = await response.json();

      setAnalysisStep("Generando análisis...");
      setAnalysisProgress(75);

      if (!result.success) {
        throw new Error(result.error || 'Error en la respuesta de la API');
      }

      // Manejar modo comparación vs análisis simple
      if (data.compare && result.generated1 && result.generated2) {
        // Modo comparación: guardar resultados por separado.
        // `generated1`/`model1` son el modelo principal, `generated2`/`model2`
        // el de comparación; el orden lo garantiza el endpoint.
        setComparisonResults({
          result1: result.generated1,
          result2: result.generated2,
          model1Name: formatModelName(result.model1, "Modelo 1"),
          model2Name: formatModelName(result.model2, "Modelo 2"),
        });
        setAnalysisResult(""); // Limpiar resultado simple
      } else {
        // Análisis simple
        setAnalysisResult(result.generated || "");
        setComparisonResults(null); // Limpiar resultados de comparación
      }

      setAnalysisProgress(100);
      setAnalysisStep("¡Análisis completado!");
      toast.success("Análisis generado exitosamente");
      
    } catch (error) {
      console.error("Error al generar análisis:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar el análisis");
      setAnalysisResult("");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisStep("");
      }, 1000);
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    analysisProgress,
    analysisStep,
    comparisonResults,
    generateAnalysis,
  };
};