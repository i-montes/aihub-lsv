"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WordPressSearchDialog } from "@/components/shared/wordpress-search-dialog";
import { SelectedContentModal } from "@/components/shared/selected-content-modal";
import { Button } from "@/components/ui/button";
import { FileText, Edit3, Eye, Copy } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { marked } from "marked";
import { MODELS } from "@/lib/utils";

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

export default function GeneradorResumenes() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    fechaDesde: today,
    fechaHasta: today,
    modelo: "",
  });
  const [resumen, setResumen] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    step: string;
    details?: string;
    count?: number;
    total?: number;
    posts?: WordPressPost[];
  }>({
    step: "",
    details: "",
    count: 0,
    total: 0,
    posts: [],
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<WordPressPost[]>([]);
  const [selectedContentModalOpen, setSelectedContentModalOpen] =
    useState(false);
  const [selectionMode, setSelectionMode] = useState<
    "wordpress" | "dateRange" | null
  >(null);
  const [selectedModel, setSelectedModel] = useState<{
    model: string;
    provider: string;
  }>({ model: "", provider: "" });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelProviderMap, setModelProviderMap] = useState<
    Record<string, string>
  >({});
  const [models, setModels] = useState<
    {
      model: string;
      provider: string;
    }[]
  >([]);

  const [apiKeyStatus, setApiKeyStatus] = useState<{
    isLoading: boolean;
    hasApiKey: boolean;
    isAdmin: boolean;
  }>({
    isLoading: true,
    hasApiKey: false,
    isAdmin: false,
  });

  const [logs, setLogs] = useState<any[]>([]);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Function to fetch WordPress content with pagination
  const fetchWordPressContent = async (
    startDate: string,
    endDate: string
  ): Promise<WordPressPost[]> => {
    try {
      setGenerationProgress({
        step: "Conectando con WordPress",
        details: "Estableciendo conexión con la API de WordPress...",
      });

      // First request to get total count and pages
      const initialParams = new URLSearchParams({
        query: "*",
        start_date: startDate,
        end_date: endDate,
        page: "1",
        per_page: "20",
        categories: "4932",
      });

      setGenerationProgress({
        step: "Consultando contenido",
        details: "Buscando artículos en el rango de fechas especificado...",
      });

      const initialResponse = await fetch(
        `/api/wordpress/search?${initialParams}`
      );

      if (!initialResponse.ok) {
        throw new Error(
          `Error fetching WordPress content: ${initialResponse.status}`
        );
      }

      const initialResult = await initialResponse.json();
      const totalPages = initialResult.total?.pages || 1;
      const totalCount = initialResult.total?.count || 0;

      console.log(`Found ${totalCount} posts across ${totalPages} pages`);

      setGenerationProgress({
        step: "Artículos encontrados",
        details: `Se encontraron ${totalCount} artículos en ${totalPages} página${
          totalPages > 1 ? "s" : ""
        }`,
        count: 0,
        total: totalCount,
      });

      // If no posts found, return empty array
      if (totalCount === 0) {
        return [];
      }

      // Collect all posts from all pages
      let allPosts: WordPressPost[] = initialResult.data || [];

      setGenerationProgress({
        step: "Descargando artículos",
        details: `Descargando artículos (página 1 de ${totalPages})...`,
        count: allPosts.length,
        total: totalCount,
        posts: allPosts.slice(0, 3), // Preview first 3 posts
      });

      // Fetch remaining pages if there are more than 1 page
      if (totalPages > 1) {
        const pagePromises = [];

        for (let page = 2; page <= totalPages; page++) {
          const pageParams = new URLSearchParams({
            query: "*",
            start_date: startDate,
            end_date: endDate,
            page: page.toString(),
            per_page: "20",
            categories: "4932",
          });

          pagePromises.push(
            fetch(`/api/wordpress/search?${pageParams}`).then(
              async (response) => {
                if (!response.ok) {
                  throw new Error(
                    `Error fetching page ${page}: ${response.status}`
                  );
                }
                const result = await response.json();

                // Update progress for each page
                setGenerationProgress((prev) => ({
                  ...prev,
                  step: "Descargando artículos",
                  details: `Descargando artículos (página ${page} de ${totalPages})...`,
                  count: allPosts.length + (result.data?.length || 0),
                }));

                return result.data || [];
              }
            )
          );
        }

        // Wait for all page requests to complete
        const pageResults = await Promise.all(pagePromises);

        // Flatten and combine all results
        pageResults.forEach((pageData) => {
          allPosts = [...allPosts, ...pageData];
        });
      }

      setGenerationProgress({
        step: "Artículos descargados",
        details: `Se descargaron exitosamente ${allPosts.length} artículos`,
        count: allPosts.length,
        total: totalCount,
        posts: allPosts.slice(0, 5), // Preview first 5 posts
      });

      console.log(`Successfully fetched ${allPosts.length} total posts`);
      return allPosts;
    } catch (error) {
      console.error("Error fetching WordPress content:", error);
      throw error;
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

      // Fetch custom tools for this organization
      const { data: customTool, error: customToolsError } = await supabase
        .from("tools")
        .select("models")
        .eq("organization_id", profileData.organizationId)
        .eq("identity", "resume")
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

  useEffect(() => {
    checkApiKeyExists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setLogs([]); // Clear previous logs
    setGenerationProgress({
      step: "",
      details: "",
      count: 0,
      total: 0,
      posts: [],
    });

    try {
      let contentToSummarize: WordPressPost[] = [];

      if (selectionMode === "wordpress") {
        // Use manually selected content
        setGenerationProgress({
          step: "Preparando contenido seleccionado",
          details: `Usando ${selectedContent.length} artículo${
            selectedContent.length > 1 ? "s" : ""
          } seleccionado${selectedContent.length > 1 ? "s" : ""} manualmente`,
          count: selectedContent.length,
          total: selectedContent.length,
          posts: selectedContent.slice(0, 5),
        });
        contentToSummarize = selectedContent;
      } else {
        // Automatic mode: fetch content by date range using new function
        contentToSummarize = await fetchWordPressContent(
          formData.fechaDesde,
          formData.fechaHasta
        );
      }

      if (contentToSummarize.length === 0) {
        setResumen(
          "No se encontró contenido para generar el resumen con los parámetros especificados."
        );
        setIsGenerating(false);
        return;
      }

      setGenerationProgress({
        step: "Generando resumen",
        details:
          "Enviando contenido al modelo de IA para generar el resumen...",
        count: contentToSummarize.length,
        total: contentToSummarize.length,
        posts: contentToSummarize.slice(0, 5),
      });

      // Make API request to generate-resume endpoint
      const response = await fetch('/api/tools/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manual: selectionMode === "wordpress",
          content: contentToSummarize,
          selectedModel,
          startDate: formData.fechaDesde,
          endDate: formData.fechaHasta,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const resume = await response.json();

      console.log("Generated resume:", resume);

      // Store logs from the generation process
      if (resume.logs) {
        setLogs(resume.logs);
      }

      // Set the generated resume
      if (resume.success && resume.resume) {
        setGenerationProgress({
          step: "Resumen completado",
          details: "El resumen se ha generado exitosamente",
          count: contentToSummarize.length,
          total: contentToSummarize.length,
        });
        setResumen(resume.resume);
      } else {
        setResumen(resume.error || "Error al generar el resumen");
      }

      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating summary:", error);
      setResumen(
        `Error al generar el resumen: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      setIsGenerating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Date range validation for one month maximum
    if (name === "fechaDesde" || name === "fechaHasta") {
      const newFormData = { ...formData, [name]: value };

      if (newFormData.fechaDesde && newFormData.fechaHasta) {
        const startDate = new Date(newFormData.fechaDesde);
        const endDate = new Date(newFormData.fechaHasta);

        // Calculate difference in days
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 31) {
          // If range exceeds 31 days, adjust the other date
          if (name === "fechaDesde") {
            const maxEndDate = new Date(startDate);
            maxEndDate.setDate(maxEndDate.getDate() + 31);
            newFormData.fechaHasta = maxEndDate.toISOString().split("T")[0];
          } else {
            const minStartDate = new Date(endDate);
            minStartDate.setDate(minStartDate.getDate() - 31);
            newFormData.fechaDesde = minStartDate.toISOString().split("T")[0];
          }
        }
      }

      setFormData(newFormData);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
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

  const removePostContent = (postId: number) => {
    setSelectedContent((prev) => prev.filter((post) => post.id !== postId));
  };

  const clearAllContent = () => {
    setSelectedContent([]);
    setSelectedContentModalOpen(false);
  };

  const handleAddMore = () => {
    setSelectedContentModalOpen(false);
    setDialogOpen(true);
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

  const copyToClipboard = async () => {
    try {
      const htmlContent = marked(resumen) as string;

      // Create a temporary div to render the HTML and extract plain text
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      // Use the modern Clipboard API with both HTML and text formats
      if (navigator.clipboard && window.ClipboardItem) {
        const clipboardItem = new ClipboardItem({
          "text/html": new Blob([htmlContent], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        });

        await navigator.clipboard.write([clipboardItem]);
      } else {
        // Fallback for browsers that don't support ClipboardItem
        await navigator.clipboard.writeText(plainText);
      }

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // Additional fallback: try to copy just the plain text
      try {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = marked(resumen) as string;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";
        await navigator.clipboard.writeText(plainText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy also failed:", fallbackError);
      }
    }
  };

  return (
    <div className="p-6">
      <ApiKeyRequiredModal
        isLoading={apiKeyStatus.isLoading}
        isOpen={!apiKeyStatus.hasApiKey}
        isAdmin={apiKeyStatus.isAdmin}
      />
      <h1 className="text-2xl font-bold mb-6">Generador de resúmenes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Resumir contenido</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Elegir artículos:
              </label>
              <Select
                value={selectionMode || ""}
                onValueChange={(value) => setSelectionMode(value as "wordpress" | "dateRange")}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:bg-gray-50">
                  <SelectValue placeholder="Modo de selección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wordpress">
                    <div className="text-left">
                      <div className="">Manual: directo desde wordpress</div>
                      {/* <div className="text-xs text-gray-500 mt-1">
                        Selecciona artículos específicos de WordPress
                      </div> */}
                    </div>
                  </SelectItem>
                  <SelectItem value="dateRange">
                    <div className="text-left">
                      <div className="">Con IA: por rango de fechas</div>
                      {/* <div className="text-xs text-gray-500 mt-1">
                        Usa un rango de fechas para selección automática
                      </div> */}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* WordPress Content Selection */}
            {selectionMode === "wordpress" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido de WordPress
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Selecciona artículos específicos de tu sitio WordPress
                </p>
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
                  categories={"4932"}
                  allowMultipleSelection={true}
                />

                {selectedContent.length > 0 && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-between p-3 h-auto"
                      onClick={() => setSelectedContentModalOpen(true)}
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {selectedContent.length} artículo
                          {selectedContent.length > 1 ? "s" : ""} seleccionado
                          {selectedContent.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <Edit3 className="h-4 w-4 text-gray-400" />
                    </Button>

                    <SelectedContentModal
                      selectedContent={selectedContent}
                      open={selectedContentModalOpen}
                      onOpenChange={setSelectedContentModalOpen}
                      onRemovePost={removePostContent}
                      onClearAll={clearAllContent}
                      onAddMore={handleAddMore}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Date Range Selection */}
            {selectionMode === "dateRange" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de fechas
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Selecciona un período para resumir todos los artículos
                    publicados
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="fechaDesde"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    id="fechaDesde"
                    name="fechaDesde"
                    value={formData.fechaDesde}
                    onChange={handleInputChange}
                    max={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo un mes de diferencia entre fechas
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="fechaHasta"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    id="fechaHasta"
                    name="fechaHasta"
                    value={formData.fechaHasta}
                    onChange={handleInputChange}
                    max={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {selectionMode && models.length > 1 && (
              <div>
                <label
                  htmlFor="modelo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Modelo
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
                            {MODELS[modelInfo.model as keyof typeof MODELS]}
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

            <button
              type="submit"
              disabled={
                isGenerating ||
                !selectionMode ||
                (selectionMode === "wordpress" &&
                  selectedContent.length === 0) ||
                (selectionMode === "dateRange" &&
                  (!formData.fechaDesde || !formData.fechaHasta))
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating
                ? "Generando..."
                : `Generar resumen`}
            </button>
          </form>
        </div>

        {/* Resultado */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Resultado</h2>
            <div className="flex items-center gap-2">
              {resumen && !isGenerating && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copySuccess ? "¡Copiado!" : "Copiar resumen"}
                </Button>
              )}
              {logs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogsModal(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Logs
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[450px] bg-gray-50 rounded-md p-4">
            {isGenerating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-700 font-medium">
                    {generationProgress.step}
                  </span>
                </div>

                {generationProgress.details && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {generationProgress.details}
                    </p>
                    {generationProgress.count !== undefined &&
                      generationProgress.total !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
                            <span>
                              {generationProgress.count} de{" "}
                              {generationProgress.total} artículos
                            </span>
                          </div>
                          {generationProgress.total > 0 && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.round(
                                    (generationProgress.count /
                                      generationProgress.total) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}

                {/* Preview of posts */}
                {generationProgress.posts &&
                  generationProgress.posts.length > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Vista previa de artículos:
                      </h4>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {generationProgress.posts.map((post, index) => (
                          <div
                            key={post.id}
                            className="text-xs text-gray-600 border-l-2 border-gray-200 pl-2"
                          >
                            <span className="font-medium">
                              {index + 1}. {post.title.rendered}
                            </span>
                            <div className="text-gray-500 mt-1">
                              {new Date(post.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                        {generationProgress.total &&
                          generationProgress.total >
                            generationProgress.posts.length && (
                            <div className="text-xs text-gray-500 italic">
                              ... y{" "}
                              {generationProgress.total -
                                generationProgress.posts.length}{" "}
                              artículos más
                            </div>
                          )}
                      </div>
                    </div>
                  )}
              </div>
            ) : resumen ? (
              <div className="text-gray-800">
                <div
                  className="whitespace-pre-wrap [&_a]:text-blue-600 [&_a:hover]:text-blue-800 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: marked(resumen) }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg
                  className="w-12 h-12 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-center">
                  Aquí se visualizarán los resultados del resumen generado
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Configura los parámetros y genera un resumen
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs Modal */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Logs de Generación</DialogTitle>
            <DialogDescription>
              Detalles del proceso de generación del resumen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border-l-4 ${
                  log.level === "error"
                    ? "bg-red-50 border-red-500 text-red-800"
                    : log.level === "warn"
                    ? "bg-yellow-50 border-yellow-500 text-yellow-800"
                    : "bg-blue-50 border-blue-500 text-blue-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium whitespace-pre-line">{log.message}</p>
                    {log.data && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
