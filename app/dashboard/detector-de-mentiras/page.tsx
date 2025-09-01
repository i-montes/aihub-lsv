"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  Info
} from "lucide-react";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

interface DisinformationLink {
  id: string;
  url: string;
  type: 'youtube' | 'article' | 'pdf';
}

interface VerificationMethod {
  id: string;
  strategy: string;
  supportLinks: string[];
  evidenceImages: UploadedFile[];
}

interface FormData {
  title: string;
  initialParagraph: string;
  disinformationImages: UploadedFile[];
  disinformationLinks: DisinformationLink[];
  description: string;
  rating: 'cierto' | 'cierto-pero' | 'debatible' | 'enganoso' | 'falso' | '';
  verificationMethods: VerificationMethod[];
  contextArticles: string[];
  videoTranscription: string;
  youtubeUrls: string[];
  additionalContext: string;
}

const RATING_OPTIONS = [
  { value: 'cierto', label: 'Cierto', color: 'bg-green-100 text-green-800' },
  { value: 'cierto-pero', label: 'Cierto, pero', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'debatible', label: 'Debatible', color: 'bg-orange-100 text-orange-800' },
  { value: 'enganoso', label: 'Engañoso', color: 'bg-red-100 text-red-800' },
  { value: 'falso', label: 'Falso', color: 'bg-red-100 text-red-800' },
];

const LINK_TYPES = [
  { value: 'youtube', label: 'Video de YouTube', icon: '🎥' },
  { value: 'article', label: 'Artículo', icon: '📄' },
  { value: 'pdf', label: 'PDF', icon: '📋' },
];

export default function LieDetectorPage() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    initialParagraph: '',
    disinformationImages: [],
    disinformationLinks: [],
    description: '',
    rating: '',
    verificationMethods: [],
    contextArticles: [],
    videoTranscription: '',
    youtubeUrls: [],
    additionalContext: '',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [disinformationImages, setDisinformationImages] = useState<File[]>([]);
  const [verificationImages, setVerificationImages] = useState<File[]>([]);
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
  const handleFileUpload = (files: FileList, type: 'disinformation' | 'verification', methodId?: string) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`El archivo ${file.name} es demasiado grande (máximo 10MB)`);
        return;
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: fileType,
      };

      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadedFile);
    });

    if (type === 'disinformation') {
      setFormData(prev => ({
        ...prev,
        disinformationImages: [...prev.disinformationImages, ...newFiles]
      }));
    } else if (type === 'verification' && methodId) {
      setFormData(prev => ({
        ...prev,
        verificationMethods: prev.verificationMethods.map(method =>
          method.id === methodId
            ? { ...method, evidenceImages: [...method.evidenceImages, ...newFiles] }
            : method
        )
      }));
    }
  };

  // Image upload handler
  const handleImageUpload = (files: FileList | null, type: 'disinformation' | 'verification') => {
    if (files) {
      const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (type === 'disinformation') {
        setDisinformationImages(prev => [...prev, ...newFiles]);
      } else {
        setVerificationImages(prev => [...prev, ...newFiles]);
      }
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

  const handleDrop = (e: React.DragEvent, type: 'disinformation' | 'verification' | 'support' | 'evidence', methodId?: string) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (type === 'disinformation' || type === 'verification') {
        handleImageUpload(files, type);
      } else {
        handleFileUpload(files, 'verification', methodId);
      }
    }
  };

  // Agregar enlace de desinformación
  const addDisinformationLink = () => {
    const newLink: DisinformationLink = {
      id: Math.random().toString(36).substr(2, 9),
      url: '',
      type: 'article',
    };
    setFormData(prev => ({
      ...prev,
      disinformationLinks: [...prev.disinformationLinks, newLink]
    }));
  };

  // Remove image functions
  const removeDisinformationImage = (index: number) => {
    setDisinformationImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVerificationImage = (index: number) => {
    setVerificationImages(prev => prev.filter((_, i) => i !== index));
  };

  // Agregar método de verificación
  const addVerificationMethod = () => {
    const newMethod: VerificationMethod = {
      id: Math.random().toString(36).substr(2, 9),
      strategy: '',
      supportLinks: [''],
      evidenceImages: [],
    };
    setFormData(prev => ({
      ...prev,
      verificationMethods: [...prev.verificationMethods, newMethod]
    }));
  };

  // Agregar artículo de contexto
  const addContextArticle = () => {
    setFormData(prev => ({
      ...prev,
      contextArticles: [...prev.contextArticles, '']
    }));
  };

  // Agregar URL de YouTube
  const addYoutubeUrl = () => {
    setFormData(prev => ({
      ...prev,
      youtubeUrls: [...prev.youtubeUrls, '']
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push("El titular es obligatorio");
    }
    
    if (!formData.description.trim()) {
      errors.push("La descripción es obligatoria");
    }
    
    if (!formData.rating) {
      errors.push("Debes seleccionar una calificación");
    }
    
    if (formData.verificationMethods.length === 0) {
      errors.push("Agrega al menos un método de verificación");
    }
    
    return errors;
  };

  // Generar análisis con IA
  const generateAnalysis = async () => {
    if (!apiKeyStatus.hasApiKey) {
      toast.error('Se requiere una API key para generar el análisis');
      return;
    }

    const errors = validateForm();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error("Por favor corrige los errores del formulario");
      return;
    }
    
    setValidationErrors([]);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep("Iniciando análisis...");
    
    const steps = [
      "Procesando contenido desinformativo...",
      "Analizando imágenes y enlaces...",
      "Aplicando métodos de verificación...",
      "Evaluando evidencias...",
      "Generando informe final..."
    ];
    
    try {
      for (let i = 0; i < steps.length; i++) {
        setAnalysisStep(steps[i]);
        setAnalysisProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      const mockAnalysis = `# Análisis de Verificación: ${formData.title}

## Resumen
${formData.description}

## Calificación
**${RATING_OPTIONS.find(r => r.value === formData.rating)?.label || 'Sin calificar'}**

## Métodos de Verificación Aplicados
${formData.verificationMethods.map((method, index) => 
  `${index + 1}. ${method.strategy}`
).join('\n')}

## Evidencias Encontradas
- Imágenes de desinformación analizadas: ${disinformationImages.length}
- Imágenes de verificación: ${verificationImages.length}
- Enlaces de desinformación: ${formData.disinformationLinks.length}

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
      toast.success('Análisis generado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el análisis');
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
    <div className="h-full flex gap-6">
      {/* Sección Izquierda - Formulario */}
      <div className="flex-1 space-y-6 overflow-auto pr-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detector de Mentiras</h1>
            <p className="text-gray-600 mt-1">Analiza y verifica información para detectar desinformación</p>
          </div>
          <div className="space-y-3">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Los campos marcados con * son obligatorios
            </div>
            <Button 
              onClick={generateAnalysis} 
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {analysisStep || "Analizando..."}
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Generar Análisis
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Imágenes de Desinformación */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imágenes de Desinformación
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
                  dragOver === 'disinformation' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}
                onDragOver={(e) => handleDragOver(e, 'disinformation')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'disinformation')}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Arrastra y suelta imágenes aquí o
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('disinformation-images')?.click()}
                >
                  Seleccionar Archivos
                </Button>
                <input
                  id="disinformation-images"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'disinformation')}
                />
              </div>
              
              {formData.disinformationImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {formData.disinformationImages.map((file) => (
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
                          setFormData(prev => ({
                            ...prev,
                            disinformationImages: prev.disinformationImages.filter(f => f.id !== file.id)
                          }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{file.file.name}</p>
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
                  Enlaces de Desinformación
                </Label>
                <div className="group relative">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    Agrega enlaces del contenido desinformativo
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {formData.disinformationLinks.map((link, index) => (
                  <div key={link.id} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={link.url}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            disinformationLinks: prev.disinformationLinks.map(l =>
                              l.id === link.id ? { ...l, url: e.target.value } : l
                            )
                          }));
                        }}
                        placeholder="URL del contenido desinformativo"
                      />
                    </div>
                    <Select
                      value={link.type}
                      onValueChange={(value: any) => {
                        setFormData(prev => ({
                          ...prev,
                          disinformationLinks: prev.disinformationLinks.map(l =>
                            l.id === link.id ? { ...l, type: value } : l
                          )
                        }));
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LINK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          disinformationLinks: prev.disinformationLinks.filter(l => l.id !== link.id)
                        }));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addDisinformationLink}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Enlace
                </Button>
              </div>
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
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descripción del contenido desinformativo"
                className="mt-1"
                rows={4}
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
              <Select value={formData.rating} onValueChange={(value: any) => setFormData(prev => ({ ...prev, rating: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una calificación" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={option.color}>{option.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>



        {/* Métodos de Verificación */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="verification-methods">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Métodos de Verificación
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {formData.verificationMethods.map((method, index) => (
                  <Card key={method.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Método {index + 1}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              verificationMethods: prev.verificationMethods.filter(m => m.id !== method.id)
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Estrategia de Verificación</Label>
                        <Textarea
                          value={method.strategy}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              verificationMethods: prev.verificationMethods.map(m =>
                                m.id === method.id ? { ...m, strategy: e.target.value } : m
                              )
                            }));
                          }}
                          placeholder="Describe la estrategia utilizada para verificar la información"
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Enlaces de Soporte</Label>
                        <div className="space-y-2 mt-1">
                          {method.supportLinks.map((link, linkIndex) => (
                            <div key={linkIndex} className="flex gap-2">
                              <Input
                                value={link}
                                onChange={(e) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    verificationMethods: prev.verificationMethods.map(m =>
                                      m.id === method.id
                                        ? {
                                            ...m,
                                            supportLinks: m.supportLinks.map((l, i) =>
                                              i === linkIndex ? e.target.value : l
                                            )
                                          }
                                        : m
                                    )
                                  }));
                                }}
                                placeholder="URL de soporte para la verificación"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    verificationMethods: prev.verificationMethods.map(m =>
                                      m.id === method.id
                                        ? {
                                            ...m,
                                            supportLinks: m.supportLinks.filter((_, i) => i !== linkIndex)
                                          }
                                        : m
                                    )
                                  }));
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                verificationMethods: prev.verificationMethods.map(m =>
                                  m.id === method.id
                                    ? { ...m, supportLinks: [...m.supportLinks, ''] }
                                    : m
                                )
                              }));
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Enlace
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Imágenes de Evidencia</Label>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1"
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'verification', method.id)}
                        >
                          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Arrastra imágenes de evidencia aquí
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`verification-images-${method.id}`)?.click()}
                          >
                            Seleccionar Archivos
                          </Button>
                          <input
                            id={`verification-images-${method.id}`}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'verification', method.id)}
                          />
                        </div>
                        
                        {method.evidenceImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {method.evidenceImages.map((file) => (
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
                                    setFormData(prev => ({
                                      ...prev,
                                      verificationMethods: prev.verificationMethods.map(m =>
                                        m.id === method.id
                                          ? {
                                              ...m,
                                              evidenceImages: m.evidenceImages.filter(f => f.id !== file.id)
                                            }
                                          : m
                                      )
                                    }));
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
                ))}
                
                <Button
                  variant="outline"
                  onClick={addVerificationMethod}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Método de Verificación
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Contexto Adicional */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="additional-context">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                Contexto Adicional
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                {/* Artículos de Contexto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Artículos de Contexto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.contextArticles.map((article, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={article}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                contextArticles: prev.contextArticles.map((a, i) =>
                                  i === index ? e.target.value : a
                                )
                              }));
                            }}
                            placeholder="URL del artículo de contexto"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                contextArticles: prev.contextArticles.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addContextArticle}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Artículo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Obtener transcripción de video */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Obtener transcripción de video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.youtubeUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={url}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                youtubeUrls: prev.youtubeUrls.map((u, i) =>
                                  i === index ? e.target.value : u
                                )
                              }));
                            }}
                            placeholder="URL de YouTube (ej: https://youtube.com/watch?v=...)"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                youtubeUrls: prev.youtubeUrls.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addYoutubeUrl}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar URL de YouTube
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Contexto Adicional */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contexto Adicional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.additionalContext}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
                      placeholder="Escribe aquí cualquier contexto adicional que consideres relevante para el análisis..."
                      rows={6}
                    />
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Sección Derecha - Visualizador de Resultados */}
      <div className="w-1/2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
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
          <CardContent className="flex-1 flex flex-col overflow-y-auto">
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <h4 className="font-medium text-red-900">Errores de validación</h4>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div>
                      <h4 className="font-medium text-blue-900">{analysisStep}</h4>
                      <p className="text-sm text-blue-700">Progreso: {analysisProgress}%</p>
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
                      <h4 className="font-semibold text-green-900">Análisis Completado</h4>
                    </div>
                    <p className="text-sm text-green-700">Resultado generado por IA</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <div 
                        className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: analysisResult.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
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
                      toast.success('Análisis copiado al portapapeles');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([analysisResult], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `analisis-${formData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                  <Button variant="outline">
                    Exportar PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Listo para analizar</h3>
                <p className="text-gray-500 mb-4">Los resultados del análisis aparecerán aquí</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-blue-900 mb-2">¿Qué verás aquí?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Análisis de veracidad del contenido</li>
                    <li>• Evaluación de fuentes y evidencias</li>
                    <li>• Recomendaciones de verificación</li>
                    <li>• Calificación final de confiabilidad</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}