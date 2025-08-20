"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApiKeyRequiredModalProps {
  isOpen: boolean
  isAdmin: boolean
  isLoading?: boolean
}

export function ApiKeyRequiredModal({ isOpen, isAdmin, isLoading }: ApiKeyRequiredModalProps) {
  const router = useRouter()

  const handleNavigateToSettings = () => {
    router.push("/dashboard/configuracion/integraciones")
  }

  if (isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Required configuration
          </DialogTitle>
          <DialogDescription>
            To use the text editor, you need to configure an artificial intelligence API key.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">No API key configured for your organization was found.</p>
            <p className="mt-2">
              {isAdmin
                ? "As an administrator, you can configure an API key in the integrations section."
                : "Please contact your organization's administrator to configure an API key."}
            </p>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={handleNavigateToSettings} className="bg-blue-600 hover:bg-blue-700">
                Go to integrations settings
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
