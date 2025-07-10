"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Loader2, Share, Upload, FileText, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { WordPressSearch } from "@/components/thread-generator/wordpress-search";
import { ThreadPreview } from "@/components/thread-generator/thread-preview";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";
import { WordPressSearchDialog } from "@/components/shared/wordpress-search-dialog";
import { WordPressPost } from "@/types/proofreader";
import { threadsGenerator } from "@/actions/generate-threads";

export default function ThreadGenerator() {
  const [sourceContent, setSourceContent] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [outputFormat, setOutputFormat] = useState<
    "tesis" | "investigacion" | "lista"
  >("tesis");

  const [generatedThread, setGeneratedThread] = useState<
    { content: string; imageUrl?: string }[]
  >([]);
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
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const generateThread = async () => {

    if (isGenerating) return; // Prevent multiple clicks

    if (!sourceContent.trim()) {
      toast.error("Por favor, añade contenido para generar el hilo");
      return;
    }

    if (!sourceTitle.trim()) {
      toast.error("Por favor, añade un título para generar el hilo");
      return;
    }


    if (!selectedModel.model || !selectedModel.provider) {
      toast.error("Por favor, selecciona un modelo de IA");
      return;
    }

    setIsGenerating(true);
    setGenerationLogs([]); // Reset logs
    setGeneratedThread([]); // Clear previous threads

    try {
      const result = await threadsGenerator(
        sourceTitle,
        sourceContent,
        outputFormat,
        selectedModel
      );

      if (result.success && result.threads) {
        const formattedThreads = result.threads.map((content: string) => ({
          content,
        }));

        console.log("Generated Threads:", result);

        setGeneratedThread(formattedThreads);
        // Store logs if they exist
        if (result.logs && Array.isArray(result.logs)) {
          setGenerationLogs(result.logs);
        }
        toast.success("Hilo generado exitosamente");
      } else {
        // Store logs even when there's an error
        if (result.logs && Array.isArray(result.logs)) {
          setGenerationLogs(result.logs);
        }
        toast.error(result.error || "Error al generar el hilo");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al generar el hilo");
    } finally {
      setIsGenerating(false);
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
      if (apiKeys.length > 0 && allModels.length > 0) {
        const firstKey = apiKeys[0];
        const firstModel = allModels[0];
        setSelectedModel({
          model: firstModel,
          provider: firstKey.provider || "",
        });
      }

      setModelProviderMap(map);
    } catch (error) {
      console.error("Error al verificar API keys:", error);
      setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
    }
  };

  const insertPostContent = (post: WordPressPost) => {
    setSourceContent(post.content?.rendered || "");
    setSourceTitle(post.title?.rendered || "");
    setDialogOpen(false);
    toast.success("Contenido insertado desde WordPress");
  };

  const handleModelChange = (option: string) => {
    const [model, provider] = option.split("|");
    setSelectedModel({ model, provider });
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

  const handleCopy = async (text: string, key: number | "all") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleCopyAll = () => {
    const allContent = generatedThread
      .map((tweet) => tweet.content)
      .join("\n\n");
    handleCopy(allContent, "all");
  };

  useEffect(() => {
    checkApiKeyExists();
  }, []);

  return (
    <div className="container py-8">
      <ApiKeyRequiredModal
        isLoading={apiKeyStatus.isLoading}
        isOpen={!apiKeyStatus.hasApiKey}
        isAdmin={apiKeyStatus.isAdmin}
      />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Generador de Hilos
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Panel de entrada */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-muted/30">
                <h2 className="text-xl font-semibold mb-4">
                  Generador de Hilos
                </h2>

                {/* Modelo de IA */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Modelo de IA
                  </label>
                  <Select
                    value={`${selectedModel.model}|${selectedModel.provider}`}
                    onValueChange={handleModelChange}
                    disabled={availableModels.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.length > 0 ? (
                        availableModels.map((model) => (
                          <SelectItem
                            key={model}
                            value={`${model}|${modelProviderMap[model]}`}
                          >
                            {model} (
                            {getProviderDisplayName(modelProviderMap[model])})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="|">
                          No hay modelos disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Formato de Salida */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Formato de Salida
                  </label>
                  <Select
                    value={outputFormat}
                    onValueChange={(
                      value: "tesis" | "investigacion" | "lista"
                    ) => setOutputFormat(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tesis">Tesis</SelectItem>
                      <SelectItem value="investigacion">
                        Investigación
                      </SelectItem>
                      <SelectItem value="lista">Lista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Botones de acción */}
                <div className="flex gap-2 mb-4">
                  <WordPressSearchDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onInsertContent={insertPostContent}
                    buttonLabel="Buscar en WordPress"
                    dialogTitle="Buscar contenido de WordPress"
                    dialogDescription="Busca y selecciona un artículo de tu sitio WordPress para generar hilos"
                    placeholder="Buscar artículos..."
                    noResultsMessage="No se encontraron artículos para"
                    fullWidth
                  />
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el título del contenido..."
                    className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                  />
                </div>

                {/* Content Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contenido
                  </label>
                  <Textarea
                    placeholder="Pega aquí el contenido para generar el hilo o utiliza la búsqueda de WordPress..."
                    className="min-h-[300px] resize-none"
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                  />
                </div>

                <Button
                  onClick={generateThread}
                  disabled={
                    isGenerating ||
                    !sourceContent.trim() ||
                    !selectedModel.model
                  }
                  className="w-full gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generar Hilo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Panel de vista previa */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Vista previa del hilo</h2>

                <div className="flex items-center gap-2">
                  {(generatedThread.length > 0 || generationLogs.length > 0) && (
                    <>
                      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <ScrollText className="h-4 w-4" />
                            Logs
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[85vh] w-full">
                          <DialogHeader className="pb-4">
                            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                              <ScrollText className="h-5 w-5 text-primary" />
                              Logs de Generación
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                              Seguimiento detallado del proceso de generación del hilo
                            </p>
                          </DialogHeader>
                          <div className="relative">
                            <div className="overflow-y-auto max-h-[65vh] space-y-3 pr-2 custom-scrollbar">
                              {generationLogs.length > 0 ? (
                                <>
                                  <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Proceso completado exitosamente
                                      </span>
                                    </div>
                                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                      {generationLogs.length} pasos
                                    </span>
                                  </div>
                                  
                                  {generationLogs.map((log, index) => (
                                    <div
                                      key={index}
                                      className="group relative p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                          <span className="inline-flex items-center justify-center w-6 h-6 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                                            {index + 1}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                            {log.split('\n').map((line, lineIndex) => (
                                              <div key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>
                                                {line || <br />}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => navigator.clipboard.writeText(log)}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                                          title="Copiar este log"
                                        >
                                          <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                        </button>
                                      </div>
                                      
                                      {/* Progress indicator line */}
                                      {index < generationLogs.length - 1 && (
                                        <div className="absolute left-[1.125rem] top-[3.5rem] w-px h-4 bg-gradient-to-b from-primary/30 to-transparent"></div>
                                      )}
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <div className="text-center py-12">
                                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <ScrollText className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    No hay logs disponibles
                                  </h3>
                                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Los logs de generación aparecerán aquí cuando se complete el proceso de creación del hilo.
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Gradient fade at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
                          </div>
                          
                          {generationLogs.length > 0 && (
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="text-xs text-muted-foreground">
                                Total de pasos: {generationLogs.length}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const allLogs = generationLogs.join('\n\n---\n\n');
                                  navigator.clipboard.writeText(allLogs);
                                  toast.success("Logs copiados al portapapeles");
                                }}
                                className="gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copiar todos los logs
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {generatedThread.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyAll}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar todo
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-1">
                {isGenerating ? (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6 relative">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent animate-pulse"></div>
                      </div>
                      <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
                        Generando tu hilo...
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        La IA está procesando tu contenido y creando un hilo optimizado para redes sociales.
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                ) : generatedThread.length > 0 ? (
                  <ThreadPreview
                    tweets={generatedThread}
                    profileName="AI Hub"
                    profileUsername="ai_hub_oficial"
                    profileImage="/professional-woman-journalist.png"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <div className="bg-muted/50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Genera tu hilo
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Pega tu contenido o busca en WordPress y haz clic en
                        "Generar hilo" para crear un hilo optimizado para redes
                        sociales.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: React.ComponentProps<typeof Loader2>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </svg>
  );
}
