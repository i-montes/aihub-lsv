"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Power, PowerOff } from "lucide-react"
import { ApiKeyService, type ApiKey, type ApiKeyStatus } from "@/lib/services/api-key-service"

interface ToggleApiKeyStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  apiKey: ApiKey | null
  newStatus: ApiKeyStatus
}

export function ToggleApiKeyStatusModal({
  isOpen,
  onClose,
  onSuccess,
  apiKey,
  newStatus,
}: ToggleApiKeyStatusModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActivating = newStatus === "ACTIVE"

  const handleToggleStatus = async () => {
    if (!apiKey) return

    setIsUpdating(true)
    setError(null)

    try {
      const result = await ApiKeyService.updateApiKeyStatus(apiKey.id, newStatus)

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(`Error al ${isActivating ? "activar" : "desactivar"} la clave API`)
      }
    } catch (err: any) {
      setError(err.message || `Error al ${isActivating ? "activar" : "desactivar"} la clave API`)
    } finally {
      setIsUpdating(false)
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "OPENAI":
        return "OpenAI"
      case "GOOGLE":
        return "Google AI / Anthropic"
      case "PERPLEXITY":
        return "Perplexity AI"
      default:
        return provider
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center ${isActivating ? "text-green-600" : "text-amber-600"}`}>
            {isActivating ? <Power className="h-5 w-5 mr-2" /> : <PowerOff className="h-5 w-5 mr-2" />}
            {isActivating ? "Activar Integración" : "Desactivar Integración"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4">
            ¿Estás seguro de que deseas {isActivating ? "activar" : "desactivar"} la integración con{" "}
            <strong>{apiKey ? getProviderName(apiKey.provider) : "este proveedor"}</strong>?
          </p>
          {isActivating ? (
            <p className="text-sm text-gray-500">
              Al activar esta integración, se podrán utilizar los modelos de IA de este proveedor en la plataforma.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Al desactivar esta integración, no se podrán utilizar los modelos de IA de este proveedor hasta que se
              vuelva a activar. La configuración se mantendrá guardada.
            </p>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2 sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button
            variant={isActivating ? "default" : "secondary"}
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className={isActivating ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700 text-white"}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isActivating ? "Activando..." : "Desactivando..."}
              </>
            ) : isActivating ? (
              "Activar"
            ) : (
              "Desactivar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
