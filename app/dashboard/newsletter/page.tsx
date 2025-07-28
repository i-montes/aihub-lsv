"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Eye,
  Save,
  Sparkles,
  Image,
  Type,
  Paperclip,
  FileText,
  X,
  Copy,
  Check,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";
import { WordPressSearchDialog } from "@/components/shared/wordpress-search-dialog";
import generateNewsletter from "@/actions/generate-newsletter";
import { loadPdfJs } from "@/lib/load-pdfjs";

interface NewsletterData {
  content: string;
  template: string;
}

export type WordPressPost = {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  link: string;
  date: string;
};

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  file?: File;
}

interface ProcessedImage {
  id: string;
  name: string;
  dataUrl: string;
  sourceFile: string;
  pageNumber: number;
}

interface ConversionProgress {
  fileId: string;
  fileName: string;
  currentPage: number;
  totalPages: number;
  isConverting: boolean;
  isCompleted: boolean;
  error?: string;
}

export default function NewsletterGenerator() {
  const [newsletterData, setNewsletterData] = useState<NewsletterData>({
    content: "",
    template: "historias",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<WordPressPost[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingPDFs, setIsProcessingPDFs] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<{
    model: string;
    provider: string;
  }>({ model: "", provider: "" });
  const [modelProviderMap, setModelProviderMap] = useState<
    Record<string, string>
  >({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  // Estado para el modal de API key requerida
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    isLoading: boolean;
    hasApiKey: boolean;
    isAdmin: boolean;
  }>({
    isLoading: true,
    hasApiKey: false,
    isAdmin: false,
  });

  const [models, setModels] = useState<
    {
      model: string;
      provider: string;
    }[]
  >([]);
  const [generatedNewsletter, setGeneratedNewsletter] = useState<any>(null);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress[]>([]);
  const [copied, setCopied] = useState(false);

  const templates = [
    {
      id: "charlas",
      name: "Charlas",
      description: "",
    },
    {
      id: "historias",
      name: "Historias",
      description: "",
    },
  ];

  const convertPDFToImages = async (file: File, fileId: string): Promise<ProcessedImage[]> => {
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const images: ProcessedImage[] = [];

      // Initialize progress
      setConversionProgress(prev => [...prev, {
        fileId,
        fileName: file.name,
        currentPage: 0,
        totalPages: pdf.numPages,
        isConverting: true,
        isCompleted: false
      }]);

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        // Update progress
        setConversionProgress(prev => 
          prev.map(p => p.fileId === fileId 
            ? { ...p, currentPage: pageNum }
            : p
          )
        );

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
        const dataUrl = canvas.toDataURL('image/png');

        images.push({
          id: `${fileId}-page-${pageNum}`,
          name: `${file.name} - Página ${pageNum}`,
          dataUrl,
          sourceFile: file.name,
          pageNumber: pageNum
        });
      }

      // Mark as completed
      setConversionProgress(prev => 
        prev.map(p => p.fileId === fileId 
          ? { ...p, isConverting: false, isCompleted: true }
          : p
        )
      );

      return images;
    } catch (error: any) {
      console.error(`Error converting PDF ${file.name} to images:`, error);
      
      // Mark as error
      setConversionProgress(prev => 
        prev.map(p => p.fileId === fileId 
          ? { ...p, isConverting: false, error: error.message }
          : p
        )
      );
      
      throw error;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Use already processed images
      const images = processedImages;

      // Prepare WordPress content
      const wordpressContent = selectedContent.map(post => ({
        title: post.title.rendered.replace(/<[^>]*>/g, ""),
        content: post.content.rendered,
        excerpt: post.excerpt.rendered,
        date: post.date,
        link: post.link
      }));

      // Call generateNewsletter with processed images
      const result = await generateNewsletter({
        images: images.map(img => ({
          id: img.id,
          name: img.name,
          dataUrl: img.dataUrl,
          sourceFile: img.sourceFile
        })),
        wordpressContent,
        customContent: newsletterData.content,
        template: newsletterData.template,
        selectedModel
      });

      setGeneratedNewsletter(result);
    } catch (error) {
      console.error('Error calling generateNewsletter:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const insertMultiplePostContent = (posts: WordPressPost[]) => {
    // Filter out posts that are already selected
    const newPosts = posts.filter(
      (post) => !selectedContent.find((p) => p.id === post.id)
    );
    setSelectedContent((prev) => [...prev, ...newPosts]);
    setDialogOpen(false);
  };

  const handleModelChange = (option: string) => {
    const [model, provider] = option.split("|");
    setSelectedModel({ model, provider });
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

      // Fetch custom tools for this organization
      const { data: customTool, error: customToolsError } = await supabase
        .from("tools")
        .select("models")
        .eq("organization_id", profileData.organizationId)
        .eq("identity", "newsletter")
        .single();

      if (customToolsError) {
        console.error(
          "Error al obtener herramientas personalizadas:",
          customToolsError
        );
      }

      // Establecer el modelo seleccionado por defecto (el primero de la lista o vacío si no hay)
      if (customTool?.models?.length > 0) {
        setSelectedModel(customTool?.models[0] || { model: "", provider: "" });
      }

      setModels(customTool?.models || []);

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

      setModelProviderMap(map);
    } catch (error) {
      console.error("Error al verificar API keys:", error);
      setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
    }
  };

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

  useEffect(() => {
    checkApiKeyExists();
  }, []);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ["application/pdf"];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    const validFiles: UploadedFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar tipo de archivo
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Solo se permiten archivos PDF`);
        continue;
      }

      // Validar tamaño de archivo
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: El archivo excede el tamaño máximo de 5MB`);
        continue;
      }

      // Crear objeto de archivo válido con el File object
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      };

      validFiles.push(uploadedFile);
    }

    // Mostrar errores si los hay
    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    // Agregar archivos válidos al estado
    setUploadedFiles((prev) => [...prev, ...validFiles]);
    setIsUploading(false);

    // Automatically convert PDFs to images
    if (validFiles.length > 0) {
      setIsProcessingPDFs(true);
      
      try {
        for (const uploadedFile of validFiles) {
          if (uploadedFile.file && uploadedFile.type === 'application/pdf') {
            const images = await convertPDFToImages(uploadedFile.file, uploadedFile.id);
            setProcessedImages(prev => [...prev, ...images]);
          }
        }
      } catch (error) {
        console.error('Error processing PDFs:', error);
      } finally {
        setIsProcessingPDFs(false);
      }
    }

    // Limpiar el input
    event.target.value = "";
  };

  const removeUploadedFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    
    if (fileToRemove) {
      setProcessedImages(prev => 
        prev.filter(img => img.sourceFile !== fileToRemove.name)
      );
      setConversionProgress(prev => 
        prev.filter(p => p.fileId !== fileId)
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyToClipboard = async () => {
    if (!generatedNewsletter?.content) return;

    try {
      // Convert markdown to plain text with basic formatting
      const plainText = generatedNewsletter.content
        .replace(/^#{1}\s+(.+)$/gm, '$1\n') // H1
        .replace(/^#{2}\s+(.+)$/gm, '$1\n') // H2
        .replace(/^#{3}\s+(.+)$/gm, '$1\n') // H3
        .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
        .replace(/\*(.+?)\*/g, '$1') // Italic
        .replace(/^[\s]*[-\*\+]\s+(.+)$/gm, '• $1') // Unordered lists
        .replace(/^[\s]*\d+\.\s+(.+)$/gm, '$1') // Ordered lists
        .replace(/^>\s+(.+)$/gm, '$1') // Blockquotes
        .replace(/---/g, '\n') // Horizontal rules
        .replace(/\n{3,}/g, '\n\n'); // Multiple line breaks

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <ApiKeyRequiredModal
        isLoading={apiKeyStatus.isLoading}
        isOpen={!apiKeyStatus.hasApiKey}
        isAdmin={apiKeyStatus.isAdmin}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold ">Generador de Newsletter</h1>
          <p className="text-muted-foreground mt-2">
            Crea newsletters profesionales con IA en minutos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Contenido
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {selectedContent.length} artículos seleccionados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sección de búsqueda y contenido fuente */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Contenido fuente
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <WordPressSearchDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onInsertMultipleContent={insertMultiplePostContent}
                    buttonLabel="Buscar en WordPress"
                    dialogTitle="Buscar contenido de WordPress"
                    dialogDescription="Busca y selecciona artículos de tu sitio WordPress para generar resúmenes"
                    placeholder="Buscar artículos..."
                    noResultsMessage="No se encontraron artículos para"
                    fullWidth
                    allowMultipleSelection={true}
                  />

                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Paperclip className="w-4 h-4 mr-2" />
                          Subir archivos PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Archivos subidos */}
                {uploadedFiles.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-green-900">
                        Archivos subidos
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFiles([]);
                          setProcessedImages([]);
                          setConversionProgress([]);
                        }}
                        className="text-green-600 hover:text-green-700 h-auto p-1"
                      >
                        Limpiar todo
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-white rounded-md p-2 border border-green-100"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadedFile(file.id)}
                            className="text-gray-400 hover:text-red-500 h-auto p-1 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Images Preview */}
                    {processedImages.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-xs font-medium text-green-900">
                            Imágenes generadas ({processedImages.length})
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setProcessedImages([])}
                            className="text-green-600 hover:text-green-700 h-auto p-1 text-xs"
                          >
                            Limpiar imágenes
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                          {processedImages.map((image) => (
                            <div key={image.id} className="group relative bg-white rounded border border-green-100 overflow-hidden">
                              <div className="aspect-[3/4] bg-gray-100">
                                <img
                                  src={image.dataUrl}
                                  alt={image.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="bg-white rounded-md px-2 py-1">
                                    <p className="text-xs font-medium text-gray-900 text-center">
                                      Página {image.pageNumber}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute top-1 right-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setProcessedImages(prev => prev.filter(img => img.id !== image.id));
                                  }}
                                  className="w-5 h-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Artículos seleccionados */}
                {selectedContent.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-blue-900">
                        Artículos seleccionados
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedContent([])}
                        className="text-blue-600 hover:text-blue-700 h-auto p-1"
                      >
                        Limpiar todo
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedContent.map((post) => (
                        <div
                          key={post.id}
                          className="flex items-center justify-between bg-white rounded-md p-2 border border-blue-100"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {post.title.rendered.replace(/<[^>]*>/g, "")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(post.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedContent((prev) =>
                                prev.filter((p) => p.id !== post.id)
                              )
                            }
                            className="text-gray-400 hover:text-red-500 h-auto p-1 ml-2"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Separador visual */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Transcripciones o contenido personalizado
                  </span>
                </div>
              </div>

              {/* Textarea para instrucciones */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Contenido personalizado (opcional)
                  </span>
                </div>

                <Textarea
                  placeholder="Proporciona información adicional para la generación del newsletter."
                  className="min-h-[120px] resize-none"
                  value={newsletterData.content}
                  onChange={(e) =>
                    setNewsletterData({
                      ...newsletterData,
                      content: e.target.value,
                    })
                  }
                />
              </div>

              {/* Configuración de generación */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Configuración de generación
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Plantilla
                    </label>
                    <Select
                      value={newsletterData.template}
                      onValueChange={(value) =>
                        setNewsletterData({
                          ...newsletterData,
                          template: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {models.length > 1 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Modelo de IA
                      </label>
                      <Select
                        value={
                          selectedModel.model
                            ? `${selectedModel.model}|${selectedModel.provider}`
                            : ""
                        }
                        onValueChange={(value) => {
                          const [model, provider] = value.split("|");
                          setSelectedModel({ model, provider });
                        }}
                        disabled={models.length === 0 || apiKeyStatus.isLoading}
                      >
                        <SelectTrigger className="w-full min-w-48 bg-white border-gray-200 hover:bg-gray-50">
                          <SelectValue
                            placeholder={
                              apiKeyStatus.isLoading
                                ? "Cargando..."
                                : "Seleccionar modelo"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((modelInfo) => (
                            <SelectItem
                              key={`${modelInfo.model}|${modelInfo.provider}`}
                              value={`${modelInfo.model}|${modelInfo.provider}`}
                            >
                              <div className="flex flex-row items-center justify-between gap-2">
                                <span className="font-medium">
                                  {modelInfo.model}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {getProviderDisplayName(modelInfo.provider)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de generación mejorado */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    isProcessingPDFs ||
                    (!selectedContent.length &&
                      !processedImages.length &&
                      !newsletterData.content.trim())
                  }
                  className="text-white h-12 text-base font-medium"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando newsletter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Generar Newsletter
                    </>
                  )}
                </Button>

                {!selectedContent.length &&
                  !processedImages.length &&
                  !newsletterData.content.trim() && (
                    <p className="text-xs text-center text-gray-500">
                      Selecciona artículos de WordPress, sube archivos PDF o agrega
                      instrucciones para comenzar
                    </p>
                  )}
                
                {isProcessingPDFs && (
                  <p className="text-xs text-center text-blue-600">
                    Procesando PDFs automáticamente...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Vista Previa
                </CardTitle>
                {generatedNewsletter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white min-h-[400px] flex flex-col">
                {generatedNewsletter ? (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:text-gray-600 prose-blockquote:border-l-gray-300">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-gray-700 mb-3 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside text-gray-700 mb-3 space-y-1">
                              {children}
                            </ol>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-3 text-gray-600 italic">
                              {children}
                            </blockquote>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-700">
                              {children}
                            </em>
                          ),
                          hr: () => (
                            <hr className="border-gray-200 my-6" />
                          ),
                        }}
                      >
                        {generatedNewsletter.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center flex-1">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Newsletter Preview
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                      Aquí se mostrará la vista previa de tu newsletter una vez que
                      sea generado por el asistente de IA.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Generado automáticamente con IA</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
