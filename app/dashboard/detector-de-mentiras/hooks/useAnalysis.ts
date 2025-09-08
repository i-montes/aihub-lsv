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

  /**
   * Genera el análisis con IA basado en los datos del formulario
   */
  const generateAnalysis = async () => {
    if (!hasApiKey) {
      toast.error("Se requiere una API key para generar el análisis");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep("Iniciando análisis...");

    const steps = [
      "Procesando contenido desinformativo...",
      "Analizando imágenes y enlaces...",
      "Aplicando métodos de verificación...",
      "Evaluando evidencias...",
      "Generando informe final...",
    ];

    try {
      // Obtener datos actuales del formulario
      const currentFormData = getValues();

      for (let i = 0; i < steps.length; i++) {
        setAnalysisStep(steps[i]);
        setAnalysisProgress((i + 1) * 20);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const mockAnalysis = `# Análisis de Desinformación

## Resumen
${currentFormData.disinformation.description}

## Calificación
**${
        currentFormData.rating
          ? RATING_OPTIONS.find((r) => r.value === currentFormData.rating)
              ?.label
          : "Sin calificar"
      }**

## Métodos de Verificación Aplicados
1. ${currentFormData.verification.text}

## Evidencias Encontradas
- Imágenes de desinformación analizadas: ${
        currentFormData.disinformation.images.length
      }
- Imágenes de verificación: ${currentFormData.verification.images.length}
- Enlaces de desinformación: ${
        currentFormData.disinformation.text
          .split("\n")
          .filter((link) => link.trim()).length
      }

## Conclusión
Basado en el análisis realizado, se ha determinado la veracidad de la información presentada.

## Recomendaciones
1. Verificar fuentes primarias
2. Consultar expertos en el tema
3. Monitorear la evolución de la información
4. Aplicar fact-checking adicional si es necesario

---
*Análisis generado automáticamente - Fecha: ${new Date().toLocaleDateString()}*`;

      setAnalysisResult(mockAnalysis);
      setAnalysisProgress(100);
      setAnalysisStep("¡Análisis completado!");
      toast.success("Análisis generado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al generar el análisis");
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
    generateAnalysis,
  };
};