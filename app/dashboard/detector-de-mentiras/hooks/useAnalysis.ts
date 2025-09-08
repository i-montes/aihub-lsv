import { useState } from "react";
import { UseFormGetValues } from "react-hook-form";
import { toast } from "sonner";
import { FormSchema, RATING_OPTIONS } from "../constants";

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
      // Realizar la petición a la API
      setAnalysisStep("Enviando datos...");
      setAnalysisProgress(25);

      const response = await fetch('/api/detector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
        // Modo comparación: guardar resultados por separado
        setComparisonResults({
          result1: result.generated1,
          result2: result.generated2,
          model1Name: `${result.model1?.provider} - ${result.model1?.model}` || "Modelo 1",
          model2Name: `${result.model2?.provider} - ${result.model2?.model}` || "Modelo 2",
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