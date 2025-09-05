"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Loader2,
  X,
  Plus,
  Eye,
  Download,
  Copy,
  Trash2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";
import TextUrlExtractor from "@/components/shared/text-url-extractor";
import { url } from "inspector";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "document";
}

interface VerificationMethod {
  id: string;
  strategy: string;
  evidenceImages: UploadedFile[];
}

const RATING_OPTIONS = [
  { value: "cierto", label: "Cierto", color: "bg-green-100 text-green-800" },
  {
    value: "cierto-pero",
    label: "Cierto, pero",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "debatible",
    label: "Debatible",
    color: "bg-orange-100 text-orange-800",
  },
  { value: "enganoso", label: "Engañoso", color: "bg-red-100 text-red-800" },
  { value: "falso", label: "Falso", color: "bg-red-100 text-red-800" },
];

const metadataSchema = z.object({
  url: z.string().default(""),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  statusCode: z.number(),
  isValid: z.boolean(),
  error: z.string().optional(),
  complete_text: z.string().optional(),

  // Twitter metadata
  isTwitter: z.boolean().optional(),
  text: z.string().optional(),
  username: z.string().optional(),
  name: z.string().optional(),
  follower_count: z.number().optional(),
  author_image: z.string().optional(),
  like_count: z.number().optional(),
  retweet_count: z.number().optional(),
  creation_date: z.union([z.string(), z.date()]).optional(),
  user_description: z.string().optional(),
  media_image: z.string().optional(),
  media_video: z.string().optional(),
});

// Esquema Zod para validación del formulario
const formSchema = z.object({
  rating: z.enum(["cierto", "cierto-pero", "debatible", "enganoso", "falso"]),
  disinformation: z.object({
    images: z.array(z.any()).default([]),
    text: z
      .string()
      .default("")
      .describe("Texto del input de enlaces de desinformacion"),
    metadata: metadataSchema,
    description: z
      .string()
      .min(1, "La descripción es obligatoria")
      .describe("Texto del input de descripcion de desinformacion"),
  }),
  verification: z.object({
    text: z
      .string()
      .default("")
      .describe("Texto del input de Estrategia de Verificación"),
    metadata: metadataSchema,
    images: z.array(z.any()).default([]),
  }),
  additional_context: z.object({
    text: z
      .string()
      .default("")
      .describe("Texto del input de Estrategia de Verificación"),
    metadata: metadataSchema,
    images: z.array(z.any()).default([]),
  }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function LieDetectorPage() {
  const { profile } = useAuth();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: undefined,
      disinformation: {
        images: [],
        text: "",
        metadata: {
          url: "",
          statusCode: 0,
          isValid: false,
        },
        description: "",
      },
      verification: {
        text: "",
        metadata: {
          url: "",
          statusCode: 0,
          isValid: false,
        },
        images: [],
      },
      additional_context: {
        text: "",
        metadata: {
          url: "",
          statusCode: 0,
          isValid: false,
        },
        images: [],
      },
    },
  });

  // Removed watch() to prevent unnecessary re-renders
  // Use getValues() directly when needed

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    isLoading: boolean;
    hasApiKey: boolean;
    isAdmin: boolean;
  }>({
    isLoading: true,
    hasApiKey: false,
    isAdmin: false,
  });

  // Estado para almacenar metadata de URLs (ya no se usa, se guarda directamente en el formulario)
  // const [urlMetadata, setUrlMetadata] = useState<Map<string, any>>(new Map());

  // Verificar API keys al cargar
  useEffect(() => {
    checkApiKeyExists();
  }, []);

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

  // Manejo de archivos
  const handleFileUpload = (
    files: FileList,
    type: "disinformation" | "verification" | "additional_context"
  ) => {
    const newFiles: UploadedFile[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error(
          `El archivo ${file.name} es demasiado grande (máximo 10MB)`
        );
        return;
      }

      const fileType = file.type.startsWith("image/") ? "image" : "document";
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: fileType,
      };

      if (fileType === "image") {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadedFile);
    });

    if (type === "disinformation") {
      const currentImages = getValues("disinformation.images");
      setValue("disinformation.images", [...currentImages, ...newFiles]);
    } else if (type === "verification") {
      const currentImages = getValues("verification.images");
      setValue("verification.images", [...currentImages, ...newFiles]);
    } else if (type === "additional_context") {
      const currentImages = getValues("additional_context.images");
      setValue("additional_context.images", [...currentImages, ...newFiles]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    type: "disinformation" | "verification" | "additional_context"
  ) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, type);
    }
  };

  // Handle form submission with React Hook Form
  const onSubmit = async (data: FormSchema) => {
    console.log("Form submitted with data:", data);
    await generateAnalysis();
  };

  // Generar análisis con IA
  const generateAnalysis = async () => {
    if (!apiKeyStatus.hasApiKey) {
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

      const mockAnalysis = `#

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

  // Mostrar modal de API key si es necesario
  if (apiKeyStatus.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Verificando configuración...</span>
      </div>
    );
  }

  if (!apiKeyStatus.hasApiKey) {
    return (
      <ApiKeyRequiredModal
        isOpen={true}
        isAdmin={apiKeyStatus.isAdmin}
        isLoading={apiKeyStatus.isLoading}
      />
    );
  }

  return (
    <div className="h-full flex gap-4">
      {/* Sección Izquierda - Formulario */}
      <div className="w-1/2 flex flex-col h-full">
        {/* Header Fijo */}
        <div className="sticky top-0 z-10 border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detector de mentiras
              </h1>
              <p className="text-gray-600 mt-1">
                Analiza y verifica información para detectar desinformación
              </p>
            </div>
            <div className="space-y-3">
              <Button
                type="submit"
                form="lie-detector-form"
                disabled={isAnalyzing}
                className="w-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Contenido Scrolleable */}
        <form
          id="lie-detector-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto overflow-x-hidden pr-2"
        >
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imágenes de Desinformación */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Imágenes de desinformación
                  </Label>
                  <div className="group relative">
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Sube las imágenes del contenido que quieres verificar
                    </div>
                  </div>
                </div>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver === "disinformation"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300"
                  }`}
                  onDragOver={(e) => handleDragOver(e, "disinformation")}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "disinformation")}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arrastra y suelta imágenes aquí o
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("disinformation-images")?.click()
                    }
                  >
                    Seleccionar archivos
                  </Button>
                  <input
                    id="disinformation-images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files &&
                      handleFileUpload(e.target.files, "disinformation")
                    }
                  />
                </div>

                {getValues("disinformation.images")?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {getValues("disinformation.images").map((file) => (
                      <div key={file.id} className="relative group">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const currentImages = getValues(
                              "disinformation.images"
                            );
                            setValue(
                              "disinformation.images",
                              currentImages.filter((f) => f.id !== file.id)
                            );
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {file.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enlaces de Desinformación */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Enlaces de desinformación
                  </Label>
                  <div className="group relative">
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Agrega enlaces del contenido desinformativo (uno por
                      línea)
                    </div>
                  </div>
                </div>
                <Controller
                  name="disinformation.text"
                  control={control}
                  render={({ field }) => (
                    <TextUrlExtractor
                      value={field.value}
                      onChange={field.onChange}
                      onMetadata={(metadata) =>
                        setValue("disinformation.metadata", metadata as any)
                      }
                      placeholder="Agrega los enlaces del contenido desinformativo, uno por línea:\n\nhttps://ejemplo.com/video\nhttps://ejemplo.com/articulo\nhttps://ejemplo.com/documento.pdf"
                      className="mt-1"
                      maxHeight="120px"
                    />
                  )}
                />
              </div>

              {/* ¿De qué trata? */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label>¿De qué trata? *</Label>
                  <div className="group relative">
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Explica el contenido principal y las afirmaciones clave
                    </div>
                  </div>
                </div>
                <Controller
                  name="disinformation.description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Breve descripción del contenido desinformativo"
                      className="mt-1"
                      rows={4}
                    />
                  )}
                />
              </div>

              {/* Calificación inicial */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label>Calificación inicial *</Label>
                  <div className="group relative">
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Tu evaluación inicial basada en el análisis preliminar
                    </div>
                  </div>
                </div>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Select
                      defaultValue={field.value || ""}
                      onValueChange={(value) => {
                        if (value.length) {
                          field.onChange(value);
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona una calificación" />
                      </SelectTrigger>
                      <SelectContent>
                        {RATING_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={option.color}>
                                {option.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Verificación */}
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="verification-methods"
          >
            <AccordionItem value="verification-methods">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Métodos de verificación
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        <span>Método de Verificación</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Estrategia de Verificación</Label>
                        <Controller
                          name="verification.text"
                          control={control}
                          render={({ field }) => (
                            <TextUrlExtractor
                              value={field.value}
                              onChange={field.onChange}
                              onMetadata={(metadata) =>
                                setValue(
                                  "verification.metadata",
                                  metadata as any
                                )
                              }
                              placeholder="Describe la estrategia utilizada para verificar la información"
                              className="mt-1"
                              maxHeight="100px"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <Label>Imágenes de Evidencia</Label>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1"
                          onDragOver={(e) => handleDragOver(e, "verification")}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, "verification")}
                        >
                          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Arrastra imágenes de evidencia aquí
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("verification-images")
                                ?.click()
                            }
                          >
                            Seleccionar Archivos
                          </Button>
                          <input
                            id="verification-images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files &&
                              handleFileUpload(e.target.files, "verification")
                            }
                          />
                        </div>

                        {getValues("verification.images")?.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {getValues("verification.images").map((file) => (
                              <div key={file.id} className="relative group">
                                {file.preview ? (
                                  <img
                                    src={file.preview}
                                    alt={file.file.name}
                                    className="w-full h-16 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    const currentImages = getValues(
                                      "verification.images"
                                    );
                                    setValue(
                                      "verification.images",
                                      currentImages.filter(
                                        (f) => f.id !== file.id
                                      )
                                    );
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Contexto Adicional */}
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="additional-context"
          >
            <AccordionItem value="additional-context">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                  Contexto adicional
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  {/* Contexto Adicional */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Contexto Adicional
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Controller
                        name="additional_context.text"
                        control={control}
                        render={({ field }) => (
                          <TextUrlExtractor
                            value={field.value}
                            onChange={field.onChange}
                            onMetadata={(metadata) =>
                              setValue(
                                "additional_context.metadata",
                                metadata as any
                              )
                            }
                            placeholder="Escribe aquí cualquier contexto adicional que consideres relevante para el análisis..."
                            maxHeight="150px"
                          />
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </div>

      {/* Sección Derecha - Visualizador de Resultados */}
      <div className="w-1/2 flex flex-col h-full">
        <Card className="flex-1 flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visualizador de Resultados IA
              {isAnalyzing && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600">Analizando...</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2">
              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div>
                        <h4 className="font-medium text-blue-900">
                          {analysisStep}
                        </h4>
                        <p className="text-sm text-blue-700">
                          Progreso: {analysisProgress}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="flex-1 flex flex-col">
                  <div className="space-y-4 mb-4">
                    {/* Header del resultado */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-900">
                          Análisis Completado
                        </h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Resultado generado por IA
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-white border rounded-lg p-6 shadow-sm">
                        <div
                          className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: analysisResult
                              .replace(/\n/g, "<br>")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t my-4" />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(analysisResult);
                        toast.success("Análisis copiado al portapapeles");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentFormData = getValues();
                        const blob = new Blob([analysisResult], {
                          type: "text/plain",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `analisis-${Date.now()}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                    <Button variant="outline">Exportar PDF</Button>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
