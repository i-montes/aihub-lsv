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
import { ApiKeyService, type ApiKeyStatus } from "@/lib/services/api-key-service"
import { Loader2, AlertCircle } from "lucide-react"

interface ToggleApiKeyStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKeyId: string
  providerName: string
  currentStatus: ApiKeyStatus
  onSuccess?: () => void
}

export function ToggleApiKeyStatusModal({
  open,
  onOpenChange,
  apiKeyId,
  providerName,
  currentStatus,
  onSuccess,
}: ToggleApiKeyStatusModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActivating = currentStatus === "INACTIVE"
  const newStatus: ApiKeyStatus = isActivating ? "ACTIVE" : "INACTIVE"

  const handleToggleStatus = async () => {
    setIsUpdating(true)
    setError(null)

    try {
      const result = await ApiKeyService.updateApiKeyStatus(apiKeyId, newStatus)

      if (result.success) {
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError("No se pudo actualizar el estado de la integración. Inténtalo de nuevo.")
      }
    } catch (err) {
      console.error("Error al actualizar el estado de la clave API:", err)
      setError(err instanceof Error ? err.message : "Error al actualizar el estado de la integración")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{isActivating ? "Activar integración" : "Desactivar integración"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isActivating
              ? `¿Estás seguro de que deseas activar la integración con ${providerName}? Esto permitirá que tu aplicación utilice esta integración.`
              : `¿Estás seguro de que deseas desactivar la integración con ${providerName}? Tu aplicación no podrá utilizar esta integración mientras esté desactivada.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleToggleStatus()
            }}
            disabled={isUpdating}
            className={
              isActivating ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"
            }
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
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
