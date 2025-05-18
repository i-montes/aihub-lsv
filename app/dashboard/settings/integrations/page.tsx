"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sparkles, MoreVertical, Loader2, Power, PowerOff, Trash2, PlusCircle } from "lucide-react"
import { ApiKeyService, type ApiKey, type ApiKeyProvider } from "@/lib/services/api-key-service"
import { AddApiKeyModal } from "@/components/modals/add-api-key-modal"
import { DeleteApiKeyModal } from "@/components/modals/delete-api-key-modal"
import { ToggleApiKeyStatusModal } from "@/components/modals/toggle-api-key-status-modal"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function IntegrationsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null)
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")
  const [defaultProvider, setDefaultProvider] = useState<ApiKeyProvider | undefined>(undefined)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    setIsLoading(true)
    try {
      const { apiKeys } = await ApiKeyService.getApiKeys()
      setApiKeys(apiKeys)
    } catch (error) {
      console.error("Error loading API keys:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSuccess = () => {
    loadApiKeys()
  }

  const handleDeleteSuccess = () => {
    loadApiKeys()
  }

  const handleToggleStatusSuccess = () => {
    loadApiKeys()
  }

  const openAddModal = (provider?: ApiKeyProvider) => {
    setDefaultProvider(provider)
    setIsAddModalOpen(true)
  }

  const openDeleteModal = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey)
    setIsDeleteModalOpen(true)
  }

  const openToggleStatusModal = (apiKey: ApiKey, newStatus: "ACTIVE" | "INACTIVE") => {
    setSelectedApiKey(apiKey)
    setNewStatus(newStatus)
    setIsToggleStatusModalOpen(true)
  }

  const getConnectedProviders = (): ApiKeyProvider[] => {
    return apiKeys.map((key) => key.provider as ApiKeyProvider)
  }

  const getProviderConfig = (provider: string) => {
    switch (provider) {
      case "OPENAI":
        return {
          name: "OpenAI",
          description: "Accede a modelos GPT-3.5 y GPT-4 para generación de texto avanzada",
          icon: <Sparkles className="h-6 w-6 text-green-500" />,
          gradient: "from-green-500 to-emerald-700",
          capabilities: ["Generación de texto", "Análisis de sentimiento", "Resumen de contenido"],
        }
      case "GOOGLE":
        return {
          name: "Google AI / Anthropic",
          description: "Utiliza modelos Gemini y Claude para tareas de IA multimodal",
          icon: <Sparkles className="h-6 w-6 text-blue-500" />,
          gradient: "from-blue-500 to-indigo-700",
          capabilities: ["Análisis multimodal", "Generación de código", "Respuestas estructuradas"],
        }
      case "PERPLEXITY":
        return {
          name: "Perplexity AI",
          description: "Aprovecha modelos de búsqueda aumentada para respuestas precisas y actualizadas",
          icon: <Sparkles className="h-6 w-6 text-purple-500" />,
          gradient: "from-purple-500 to-fuchsia-700",
          capabilities: ["Búsqueda aumentada", "Respuestas con citas", "Información actualizada"],
        }
      default:
        return {
          name: provider,
          description: "Integración con proveedor de IA",
          icon: <Sparkles className="h-6 w-6 text-gray-500" />,
          gradient: "from-gray-500 to-gray-700",
          capabilities: ["Generación de texto"],
        }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integraciones de IA</h2>
          <p className="text-muted-foreground">
            Conecta tu plataforma con proveedores de IA para potenciar tus herramientas periodísticas
          </p>
        </div>
        <Button
          onClick={() => openAddModal()}
          className="bg-sidebar text-white hover:bg-sidebar/90 flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Añadir Modelo de IA
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-sidebar" />
        </div>
      ) : apiKeys.length > 0 ? (
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Modelos de IA Conectados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiKeys.map((apiKey) => {
                const config = getProviderConfig(apiKey.provider)
                const isActive = apiKey.status === "ACTIVE"

                return (
                  <Card
                    key={apiKey.id}
                    className={`overflow-hidden relative ${
                      !isActive ? "opacity-80" : ""
                    } transition-all duration-200 hover:shadow-md`}
                  >
                    {!isActive && (
                      <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="bg-white/90 px-4 py-2 rounded-full text-gray-500 font-medium shadow-sm">
                          Integración desactivada
                        </div>
                      </div>
                    )}
                    <div className={`h-2 bg-gradient-to-r ${config.gradient}`}></div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              isActive ? "bg-green-100" : "bg-gray-100"
                            } flex items-center justify-center`}
                          >
                            {config.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-semibold">{config.name}</h4>
                              <div
                                className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-500">Conectado el {formatDate(apiKey.createdAt)}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isActive ? (
                              <DropdownMenuItem
                                onClick={() => openToggleStatusModal(apiKey, "INACTIVE")}
                                className="text-amber-600 cursor-pointer"
                              >
                                <PowerOff className="mr-2 h-4 w-4" />
                                <span>Desactivar</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openToggleStatusModal(apiKey, "ACTIVE")}
                                className="text-green-600 cursor-pointer"
                              >
                                <Power className="mr-2 h-4 w-4" />
                                <span>Activar</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => openDeleteModal(apiKey)}
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="mt-4 text-sm text-gray-600">{config.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {config.capabilities.map((capability, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-100">
                            {capability}
                          </Badge>
                        ))}
                      </div>

                      {apiKey.models && apiKey.models.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">Modelos disponibles:</p>
                          <div className="flex flex-wrap gap-2">
                            {apiKey.models.map((model, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-50 text-xs">
                                {model}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 text-xs text-gray-400">
                        Última actualización: {formatDate(apiKey.updatedAt)}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {getConnectedProviders().length < 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Otros Modelos de IA</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["OPENAI", "GOOGLE", "PERPLEXITY"]
                  .filter((provider) => !getConnectedProviders().includes(provider as ApiKeyProvider))
                  .map((provider) => {
                    const config = getProviderConfig(provider)
                    return (
                      <Card key={provider} className="overflow-hidden hover:shadow-md transition-all duration-200">
                        <div className={`h-2 bg-gradient-to-r ${config.gradient}`}></div>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gray-100 flex items-center justify-center">
                              {config.icon}
                            </div>
                            <h4 className="text-lg font-semibold">{config.name}</h4>
                          </div>
                          <p className="mt-4 text-sm text-gray-600">{config.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {config.capabilities.map((capability, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-100">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            onClick={() => openAddModal(provider as ApiKeyProvider)}
                            className="mt-6 w-full"
                            variant="outline"
                          >
                            Conectar
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="p-3 rounded-full bg-gray-100 mb-4">
              <Sparkles className="h-8 w-8 text-sidebar" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay integraciones configuradas</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Conecta tu plataforma con proveedores de IA como OpenAI, Google AI o Perplexity para potenciar tus
              herramientas periodísticas.
            </p>
            <Button onClick={() => openAddModal()} className="bg-sidebar text-white hover:bg-sidebar/90">
              Añadir Modelo de IA
            </Button>
          </CardContent>
        </Card>
      )}

      <AddApiKeyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        excludeProviders={getConnectedProviders()}
        defaultProvider={defaultProvider}
      />

      <DeleteApiKeyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        apiKey={selectedApiKey}
      />

      <ToggleApiKeyStatusModal
        isOpen={isToggleStatusModalOpen}
        onClose={() => setIsToggleStatusModalOpen(false)}
        onSuccess={handleToggleStatusSuccess}
        apiKey={selectedApiKey}
        newStatus={newStatus}
      />
    </div>
  )
}
