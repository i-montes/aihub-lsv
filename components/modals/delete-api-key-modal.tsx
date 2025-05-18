"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ApiKeyService } from "@/lib/services/api-key-service"
import { Loader2, AlertCircle } from "lucide-react"

interface DeleteApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKeyId: string
  providerName: string
  onSuccess?: () => void
}

export function DeleteApiKeyModal({ open, onOpenChange, apiKeyId, providerName, onSuccess }: DeleteApiKeyModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await ApiKeyService.deleteApiKey(apiKeyId)

      if (result.success) {
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError("No se pudo eliminar la integración. Inténtalo de nuevo.")
      }
    } catch (err) {
      console.error("Error al eliminar la clave API:", err)
      setError(err instanceof Error ? err.message : "Error al eliminar la integración")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar integración</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar la integración con <strong>{providerName}</strong>? Esta acción no se
            puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
