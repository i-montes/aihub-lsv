"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiKeyService, type ApiKeyProvider } from "@/lib/services/api-key-service"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

interface AddApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  preselectedProvider?: string | null
}

export function AddApiKeyModal({ open, onOpenChange, onSuccess, preselectedProvider }: AddApiKeyModalProps) {
  const [provider, setProvider] = useState<ApiKeyProvider | "">((preselectedProvider as ApiKeyProvider) || "")
  const { user, profile } = useAuth()

  // Actualizar el proveedor cuando cambie el preseleccionado
  useEffect(() => {
    if (preselectedProvider) {
      setProvider(preselectedProvider as ApiKeyProvider)
    } else {
      setProvider("")
    }
  }, [preselectedProvider])
  const [apiKey, setApiKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Función para obtener los modelos predeterminados según el proveedor
  const getDefaultModels = (provider: ApiKeyProvider): string[] => {
    switch (provider) {
      case "OPENAI":
        return ["gpt-4o"]
      case "GOOGLE":
        return ["Gemini 2.0"]
      case "ANTHROPIC":
        return ["claude 3.7 sonnet"]
      default:
        return []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!provider) {
      setError("Selecciona un proveedor de IA")
      return
    }

    if (!apiKey.trim()) {
      setError("Ingresa una clave API válida")
      return
    }

    if (!profile?.organizationId) {
      setError("No se pudo determinar la organización del usuario")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      // Primero verificamos si la clave es válida
      const verifyResult = await ApiKeyService.verifyApiKey({
        key: apiKey,
        provider: provider as ApiKeyProvider,
      })

      if (!verifyResult.valid) {
        setError("La clave API no es válida o no se pudo verificar")
        setIsSubmitting(false)
        return
      }

      // Obtener los modelos predeterminados para este proveedor
      const defaultModels = getDefaultModels(provider as ApiKeyProvider)

      // Si la clave es válida, la guardamos directamente con Supabase
      const supabase = getSupabaseClient()

      const { data, error: insertError } = await supabase
        .from("api_key_table")
        .insert({
          key: apiKey,
          provider: provider as ApiKeyProvider,
          models: defaultModels, // Usar los modelos predeterminados en lugar de los verificados
          organizationId: profile.organizationId,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error al insertar clave API:", insertError)
        setError(insertError.message || "Error al guardar la clave API")
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
      setApiKey("")
      setProvider("")

      // Después de 1.5 segundos, cerramos el modal y notificamos el éxito
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      console.error("Error al agregar clave API:", err)
      setError(err instanceof Error ? err.message : "Error al agregar la clave API")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setProvider("")
    setApiKey("")
    setError(null)
    setSuccess(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold">Añadir nueva clave API</DialogTitle>
          <DialogDescription>
            Conecta tu cuenta con un proveedor de IA para utilizar sus modelos en la plataforma.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} />
                ¡Clave API añadida correctamente!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="provider">Proveedor de IA</Label>
              {preselectedProvider ? (
                <Input
                  id="provider"
                  value={
                    provider === "OPENAI"
                      ? "OpenAI"
                      : provider === "GOOGLE"
                        ? "Google AI (Gemini)"
                        : provider === "ANTHROPIC"
                          ? "Anthropic"
                          : provider
                  }
                  disabled
                  className="bg-gray-50"
                />
              ) : (
                <Select value={provider} onValueChange={(value) => setProvider(value as ApiKeyProvider)}>
                  <SelectTrigger id="provider" className="w-full">
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Proveedores disponibles</SelectLabel>
                      {["OPENAI", "GOOGLE", "ANTHROPIC"].map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider === "OPENAI"
                            ? "OpenAI"
                            : provider === "GOOGLE"
                              ? "Google AI (Gemini)"
                              : provider === "ANTHROPIC"
                                ? "Anthropic"
                                : provider}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">Clave API</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === "OPENAI"
                    ? "sk-..."
                    : provider === "GOOGLE"
                      ? "AIza..."
                      : provider === "ANTHROPIC"
                        ? "sk-ant-..."
                        : "Ingresa tu clave API"
                }
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                {provider === "OPENAI" && (
                  <>
                    Encuentra tu clave API en el panel de OpenAI:{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sidebar hover:underline"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </>
                )}
                {provider === "GOOGLE" && (
                  <>
                    Obtén tu clave API de Google AI Studio:{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sidebar hover:underline"
                    >
                      makersuite.google.com/app/apikey
                    </a>
                  </>
                )}
                {provider === "ANTHROPIC" && (
                  <>
                    Genera tu clave API en:{" "}
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sidebar hover:underline"
                    >
                      console.anthropic.com/settings/keys
                    </a>
                  </>
                )}
                {!provider && "Selecciona un proveedor para ver instrucciones específicas"}
              </p>
            </div>
          </div>

          <DialogFooter className="bg-gray-50 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !provider || !apiKey.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Añadir clave API"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
