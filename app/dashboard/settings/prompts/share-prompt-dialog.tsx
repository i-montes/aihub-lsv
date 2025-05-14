"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getOrganizationsForSharing, sharePromptWithOrganization, makePromptPublic } from "@/lib/supabase/prompts"

interface SharePromptDialogProps {
  isOpen: boolean
  onClose: () => void
  prompt: any // Tipo del prompt
}

export function SharePromptDialog({ isOpen, onClose, prompt }: SharePromptDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [isPublic, setIsPublic] = useState(prompt?.is_public || false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadOrganizations()
      setIsPublic(prompt?.is_public || false)
    }
  }, [isOpen, prompt])

  const loadOrganizations = async () => {
    try {
      const orgs = await getOrganizationsForSharing()
      // Filtrar la organización actual del usuario
      const filteredOrgs = orgs.filter((org) => org.id !== prompt.organizationId)
      setOrganizations(filteredOrgs)
      if (filteredOrgs.length > 0) {
        setSelectedOrgId(filteredOrgs[0].id)
      }
    } catch (err) {
      console.error("Error al cargar organizaciones:", err)
      setError("No se pudieron cargar las organizaciones")
    }
  }

  const handleShare = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await sharePromptWithOrganization(prompt.id, selectedOrgId)
      if (result.success) {
        setSuccess(`Prompt compartido con éxito`)
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError(result.error || "Error al compartir el prompt")
      }
    } catch (err) {
      console.error("Error al compartir prompt:", err)
      setError("Ocurrió un error al compartir el prompt")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublicToggle = async (checked: boolean) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await makePromptPublic(prompt.id, checked)
      if (result.success) {
        setIsPublic(checked)
        setSuccess(`Prompt ${checked ? "marcado como público" : "marcado como privado"} con éxito`)
      } else {
        setError(result.error || `Error al ${checked ? "hacer público" : "hacer privado"} el prompt`)
      }
    } catch (err) {
      console.error("Error al cambiar visibilidad del prompt:", err)
      setError("Ocurrió un error al cambiar la visibilidad del prompt")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compartir Prompt</DialogTitle>
          <DialogDescription>
            Comparte este prompt con otras organizaciones o hazlo público para todos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-toggle" className="font-medium">
                Hacer público
              </Label>
              <p className="text-sm text-gray-500">
                Si activas esta opción, el prompt será visible para todas las organizaciones.
              </p>
            </div>
            <Switch id="public-toggle" checked={isPublic} onCheckedChange={handlePublicToggle} disabled={isLoading} />
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Compartir con una organización específica</Label>
            <p className="text-sm text-gray-500">
              Selecciona una organización para compartir este prompt de forma privada.
            </p>

            {organizations.length > 0 ? (
              <RadioGroup value={selectedOrgId} onValueChange={setSelectedOrgId} className="mt-2">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={org.id} id={`org-${org.id}`} />
                    <Label htmlFor={`org-${org.id}`}>{org.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay organizaciones disponibles para compartir</p>
            )}
          </div>

          {error && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{error}</div>}
          {success && <div className="bg-green-50 p-3 rounded-md text-green-500 text-sm">{success}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleShare}
            disabled={isLoading || !selectedOrgId || organizations.length === 0}
            className="bg-sidebar text-white hover:bg-sidebar/90"
          >
            {isLoading ? "Compartiendo..." : "Compartir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
