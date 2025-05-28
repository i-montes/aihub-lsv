"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApiKeyRequiredModalProps {
  isOpen: boolean
  isAdmin: boolean
}

export function ApiKeyRequiredModal({ isOpen, isAdmin }: ApiKeyRequiredModalProps) {
  const router = useRouter()

  const handleNavigateToSettings = () => {
    router.push("/dashboard/settings/integrations")
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Configuración requerida
          </DialogTitle>
          <DialogDescription>
            Para utilizar el corrector de textos, es necesario configurar una clave API de inteligencia artificial.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">No se encontró ninguna clave API configurada para tu organización.</p>
            <p className="mt-2">
              {isAdmin
                ? "Como administrador, puedes configurar una clave API en la sección de integraciones."
                : "Por favor, contacta al administrador de tu organización para configurar una clave API."}
            </p>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={handleNavigateToSettings} className="bg-blue-600 hover:bg-blue-700">
                Ir a configuración de integraciones
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
