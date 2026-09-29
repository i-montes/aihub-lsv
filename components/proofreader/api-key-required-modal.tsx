"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApiKeyRequiredModalProps {
  isOpen: boolean
  isAdmin: boolean
  isLoading?: boolean
  /** Nombre visible de la herramienta, ej. "el Corrector" */
  herramienta?: string
}

/**
 * Se muestra cuando la herramienta no tiene ningún proveedor encendido en
 * Ajustes > Herramientas. Antes mandaba a Integraciones; esa sección ya no
 * existe.
 */
export function ApiKeyRequiredModal({ isOpen, isAdmin, isLoading, herramienta = "esta herramienta" }: ApiKeyRequiredModalProps) {
  const router = useRouter()

  if (isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Falta configurar un proveedor
          </DialogTitle>
          <DialogDescription>
            Para usar {herramienta} hace falta al menos un proveedor de IA con su clave.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">{herramienta} no tiene ningún proveedor configurado.</p>
            <p className="mt-2">
              {isAdmin
                ? "Como administrador, puedes configurarlo en Ajustes > Herramientas: abre la herramienta, enciende un proveedor con su clave y elige el modelo."
                : "Pide al administrador de tu organización que configure un proveedor en Ajustes > Herramientas."}
            </p>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={() => router.push("/dashboard/configuracion/herramientas")} className="bg-blue-600 hover:bg-blue-700">
                Ir a Herramientas
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
