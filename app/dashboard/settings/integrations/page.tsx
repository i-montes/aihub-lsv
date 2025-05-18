"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Plus, Trash2, Settings } from "lucide-react"
import { ApiKeyService, type ApiKey } from "@/lib/services/api-key-service"
import { AddApiKeyModal } from "@/components/modals/add-api-key-modal"
import { DeleteApiKeyModal } from "@/components/modals/delete-api-key-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function IntegrationsSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<{ id: string; provider: string } | null>(null)

  const fetchApiKeys = async () => {
    setIsLoading(true)
    try {
      const { apiKeys } = await ApiKeyService.getApiKeys()
      setApiKeys(apiKeys)
    } catch (error) {
      console.error("Error al cargar integraciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleDeleteClick = (id: string, provider: string) => {
    setSelectedApiKey({ id, provider })
    setIsDeleteModalOpen(true)
  }

  const getProviderDisplayName = (provider: string): string => {
    switch (provider) {
      case "OPENAI":
        return "OpenAI"
      case "GOOGLE":
        return "Google AI"
      case "PERPLEXITY":
        return "Perplexity"
      default:
        return provider
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "OPENAI":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        )
      case "GOOGLE":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      case "PERPLEXITY":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M8 12L11 15L16 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      default:
        return <Sparkles size={24} />
    }
  }

  const getProviderGradient = (provider: string): string => {
    switch (provider) {
      case "OPENAI":
        return "from-emerald-50 to-teal-50 border-emerald-100"
      case "GOOGLE":
        return "from-purple-50 to-indigo-50 border-purple-100"
      case "PERPLEXITY":
        return "from-blue-50 to-sky-50 border-blue-100"
      default:
        return "from-gray-50 to-gray-100 border-gray-200"
    }
  }

  const getProviderIconGradient = (provider: string): string => {
    switch (provider) {
      case "OPENAI":
        return "from-emerald-500 to-teal-600"
      case "GOOGLE":
        return "from-purple-500 to-indigo-600"
      case "PERPLEXITY":
        return "from-blue-500 to-sky-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getProviderTagStyle = (provider: string): string => {
    switch (provider) {
      case "OPENAI":
        return "bg-emerald-100 text-emerald-700"
      case "GOOGLE":
        return "bg-purple-100 text-purple-700"
      case "PERPLEXITY":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getProviderButtonStyle = (provider: string): string => {
    switch (provider) {
      case "OPENAI":
        return "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
      case "GOOGLE":
        return "border-purple-200 text-purple-700 hover:bg-purple-50"
      case "PERPLEXITY":
        return "border-blue-200 text-blue-700 hover:bg-blue-50"
      default:
        return "border-gray-200 text-gray-700 hover:bg-gray-50"
    }
  }

  const getProviderModel = (provider: string): string => {
    switch (provider) {
      case "OPENAI":
        return "GPT-4o"
      case "GOOGLE":
        return "Gemini Pro"
      case "PERPLEXITY":
        return "pplx-70b"
      default:
        return "Modelo"
    }
  }

  const getProviderCapabilities = (provider: string): string[] => {
    switch (provider) {
      case "OPENAI":
        return ["Generación de texto", "Análisis de datos", "Multimodal"]
      case "GOOGLE":
        return ["Análisis de documentos", "Resúmenes"]
      case "PERPLEXITY":
        return ["Búsqueda en tiempo real", "Citaciones"]
      default:
        return ["IA generativa"]
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Integraciones de IA</h2>
          <Sparkles className="text-amber-500" size={20} />
        </div>
        <Button
          className="bg-gradient-to-r from-sidebar to-sidebar/80 text-white hover:opacity-90 rounded-xl gap-1.5"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          Añadir Modelo de IA
        </Button>
      </div>

      <div className="space-y-8">
        {apiKeys.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Modelos de IA Conectados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className={`group relative overflow-hidden bg-gradient-to-br ${getProviderGradient(
                    apiKey.provider,
                  )} rounded-2xl border shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-400/10 to-gray-400/20 rounded-bl-[100px] -z-0"></div>
                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${getProviderIconGradient(
                            apiKey.provider,
                          )} rounded-xl flex items-center justify-center text-white shadow-sm`}
                        >
                          {getProviderIcon(apiKey.provider)}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{getProviderDisplayName(apiKey.provider)}</p>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 ${
                                apiKey.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"
                              } rounded-full`}
                            ></div>
                            <p className="text-sm text-gray-600">
                              {getProviderModel(apiKey.provider)} • {apiKey.status === "ACTIVE" ? "Activo" : "Inactivo"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`rounded-lg ${getProviderButtonStyle(apiKey.provider)}`}
                            >
                              <Settings size={16} className="mr-1" />
                              Opciones
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              onClick={() => handleDeleteClick(apiKey.id, apiKey.provider)}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getProviderCapabilities(apiKey.provider).map((capability, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 ${getProviderTagStyle(apiKey.provider)} rounded-md text-xs font-medium`}
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                    {/* Mostrar la fecha de creación */}
                    <div className="mt-4 text-xs text-gray-500">
                      Conectado el {new Date(apiKey.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sidebar border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4 text-gray-500">Cargando integraciones...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Sparkles size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay integraciones configuradas</h3>
            <p className="text-gray-500 mb-4">Conecta tus modelos de IA favoritos para comenzar a usarlos</p>
            <Button
              className="bg-gradient-to-r from-sidebar to-sidebar/80 text-white hover:opacity-90 rounded-xl gap-1.5"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={18} />
              Añadir Modelo de IA
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Otros Modelos de IA</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Google Gemini */}
            {!apiKeys.some((key) => key.provider === "GOOGLE") && (
              <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
                          fill="currentColor"
                          fillOpacity="0.2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Google Gemini</p>
                      <p className="text-xs text-gray-500">Modelo multimodal avanzado</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Conectar
                  </Button>
                </div>
              </div>
            )}

            {/* OpenAI */}
            {!apiKeys.some((key) => key.provider === "OPENAI") && (
              <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
                          fill="currentColor"
                          fillOpacity="0.2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">OpenAI</p>
                      <p className="text-xs text-gray-500">GPT-4o y otros modelos</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Conectar
                  </Button>
                </div>
              </div>
            )}

            {/* Perplexity */}
            {!apiKeys.some((key) => key.provider === "PERPLEXITY") && (
              <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-500 rounded-lg flex items-center justify-center text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          fill="currentColor"
                          fillOpacity="0.2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M8 12L11 15L16 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Perplexity</p>
                      <p className="text-xs text-gray-500">Búsqueda aumentada por IA</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Conectar
                  </Button>
                </div>
              </div>
            )}

            {/* Mistral AI - Solo si no están todos los proveedores conectados */}
            {apiKeys.length < 3 && (
              <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-amber-200">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 3V21M18 7L6 17M6 7L18 17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Mistral AI</p>
                      <p className="text-xs text-gray-500">Modelos eficientes y potentes</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg"
                    onClick={() => setIsAddModalOpen(true)}
                    disabled
                  >
                    Próximamente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para añadir nueva clave API */}
      <AddApiKeyModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onSuccess={fetchApiKeys} />

      {/* Modal para eliminar clave API */}
      {selectedApiKey && (
        <DeleteApiKeyModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          apiKeyId={selectedApiKey.id}
          providerName={getProviderDisplayName(selectedApiKey.provider)}
          onSuccess={fetchApiKeys}
        />
      )}
    </div>
  )
}
