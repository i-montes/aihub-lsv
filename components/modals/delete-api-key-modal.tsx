"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Trash2 } from "lucide-react"
import { ApiKeyService, type ApiKey } from "@/lib/services/api-key-service"

interface DeleteApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  apiKey: ApiKey | null
}

export function DeleteApiKeyModal({ isOpen, onClose, onSuccess, apiKey }: DeleteApiKeyModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!apiKey) return

    setIsDeleting(true)
    setError(null)

    try {
      const result = await ApiKeyService.deleteApiKey(apiKey.id)

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError("Error al eliminar la clave API")
      }
    } catch (err: any) {
      setError(err.message || "Error al eliminar la clave API")
    } finally {
      setIsDeleting(false)
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
          <DialogTitle className="flex items-center text-red-600">
            <Trash2 className="h-5 w-5 mr-2" />
            Eliminar Integración
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4">
            ¿Estás seguro de que deseas eliminar la integración con{" "}
            <strong>{apiKey ? getProviderName(apiKey.provider) : "este proveedor"}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Esta acción no se puede deshacer. Se eliminará la clave API y todas las configuraciones asociadas.
          </p>

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
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
