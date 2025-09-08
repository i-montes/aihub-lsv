"use client";

import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Info, Loader2 } from "lucide-react";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";

// Importar módulos creados
import { formSchema, type FormSchema, defaultFormValues } from "./constants";
import { useApiKeyStatus } from "./hooks/useApiKeyStatus";
import { useAnalysis } from "./hooks/useAnalysis";
import { FormHeader } from "./components/FormHeader";
import { MainInfoSection } from "./components/MainInfoSection";
import { VerificationSection } from "./components/VerificationSection";
import { AdditionalContextSection } from "./components/AdditionalContextSection";
import { AnalysisResultsPanel } from "./components/AnalysisResultsPanel";
import { Button } from "@/components/ui/button";

/**
 * Página principal del Detector de Mentiras
 *
 * Esta página ha sido refactorizada en módulos lógicos:
 * - constants.ts: Configuraciones, esquemas y tipos
 * - hooks/: Lógica de negocio (API keys, análisis, archivos)
 * - components/: Componentes UI modulares
 * - utils.ts: Funciones utilitarias
 */

export default function LieDetectorPage() {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  // console.log(getValues())

  // Hooks personalizados para lógica de negocio
  const apiKeyStatus = useApiKeyStatus();
  const { isAnalyzing, analysisResult, analysisStep, generateAnalysis } =
    useAnalysis(getValues, apiKeyStatus.hasApiKey);

  // Manejo del envío del formulario
  const onSubmit = async (data: FormSchema) => {
    console.log("Form submitted with data:", data);
    await generateAnalysis();
  };

  // Mostrar modal de API key si es necesario
  if (apiKeyStatus.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!apiKeyStatus.hasApiKey) {
    return <ApiKeyRequiredModal isOpen={true} isAdmin={apiKeyStatus.isAdmin} />;
  }

  return (
    <div className="h-full flex gap-4">
      {/* Left side - Form */}
      <div className="w-1/2 flex flex-col h-full">
        {/* Fixed header */}
        <FormHeader />

        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Main Information Section */}
          <MainInfoSection
            control={control}
            errors={errors}
            setValue={setValue}
            getValues={watch}
          />

          {/* Verification Methods */}
          <VerificationSection
            control={control}
            errors={errors}
            setValue={setValue}
            getValues={watch}
          />

          {/* Additional Context */}
          <AdditionalContextSection
            control={control}
            errors={errors}
            setValue={setValue}
          />

          <div className="space-y-3">
            <Button
              type="submit"
              form="lie-detector-form"
              disabled={isAnalyzing}
              className="w-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)(e);
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {analysisStep || "Analizando..."}
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Generar análisis
                </>
              )}
            </Button>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Los campos marcados con * son obligatorios
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Results */}
      {/* <AnalysisResultsPanel isVisible={true} results={analysisResult} /> */}
    </div>
  );
}
