"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { WordPressSearchDialog } from "@/components/shared/wordpress-search-dialog";
import { SelectedContentModal } from "@/components/shared/selected-content-modal";
import { Button } from "@/components/ui/button";
import { FileText, Edit3 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";

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
  const [formData, setFormData] = useState({
    fechaDesde: "",
    fechaHasta: "",
    modelo: "",
  });
  const [resumen, setResumen] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<WordPressPost[]>([]);
  const [selectedContentModalOpen, setSelectedContentModalOpen] =
    useState(false);
  const [selectionMode, setSelectionMode] = useState<'wordpress' | 'dateRange'>('wordpress');
  const [selectedModel, setSelectedModel] = useState<{
    model: string;
    provider: string;
  }>({ model: "", provider: "" });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelProviderMap, setModelProviderMap] = useState<
    Record<string, string>
  >({});

  const [apiKeyStatus, setApiKeyStatus] = useState<{
    isLoading: boolean;
    hasApiKey: boolean;
    isAdmin: boolean;
  }>({
    isLoading: true,
    hasApiKey: false,
    isAdmin: false,
  });

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

  useEffect(() => {
    checkApiKeyExists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      setResumen(
        `Resumen generado para el período del ${formData.fechaDesde} al ${formData.fechaHasta} usando el modelo ${formData.modelo}`
      );
      setIsGenerating(false);
    }, 2000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6">
      <ApiKeyRequiredModal
        isLoading={apiKeyStatus.isLoading}
        isOpen={!apiKeyStatus.hasApiKey}
        isAdmin={apiKeyStatus.isAdmin}
      />
      <h1 className="text-2xl font-bold mb-6">Generador de Resúmenes</h1>

      {/* Aviso sobre configuración de WordPress */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-800 flex flex-col gap-2">
              <strong>Configuración requerida:</strong> Este generador de
              resúmenes utiliza la API de WordPress para funcionar. Asegúrate de
              configurar la conexión a WordPress antes de usar esta herramienta.
            </p>
            <Link
              href="/dashboard/settings/wordpress"
              className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 inline-block"
            >
              Configurar WordPress →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Configuración</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleccionar contenido por:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectionMode('wordpress')}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    selectionMode === 'wordpress'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Selección manual
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('dateRange')}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    selectionMode === 'dateRange'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Selección automática
                </button>
              </div>
            </div>

            {/* WordPress Content Selection */}
            {selectionMode === 'wordpress' && (
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
            {selectionMode === 'dateRange' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de fechas
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Selecciona un período para resumir todos los artículos publicados
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

            <div>
              <label
                htmlFor="modelo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Modelo
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

            <button
              type="submit"
              disabled={
                isGenerating || 
                (selectionMode === 'wordpress' && selectedContent.length === 0) ||
                (selectionMode === 'dateRange' && (!formData.fechaDesde || !formData.fechaHasta))
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating
                ? "Generando..."
                : selectionMode === 'wordpress'
                ? `Generar Resumen${
                    selectedContent.length > 0
                      ? ` (${selectedContent.length} artículo${
                          selectedContent.length > 1 ? "s" : ""
                        })`
                      : ""
                  }`
                : `Generar Resumen${
                    formData.fechaDesde && formData.fechaHasta
                      ? ` (${formData.fechaDesde} - ${formData.fechaHasta})`
                      : ""
                  }`}
            </button>
          </form>
        </div>

        {/* Resultado */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Resultado</h2>

          <div className="min-h-[300px] bg-gray-50 rounded-md p-4">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Generando resumen...</span>
              </div>
            ) : resumen ? (
              <div className="text-gray-800">
                <p className="whitespace-pre-wrap">{resumen}</p>
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
    </div>
  );
}
