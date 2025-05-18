"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { ApiKeyService, type ApiKeyProvider } from "@/lib/services/api-key-service"
import { Constants } from "@/lib/supabase/database.types.ts"

interface AddApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  excludeProviders?: ApiKeyProvider[]
  defaultProvider?: ApiKeyProvider
}

export function AddApiKeyModal({
  isOpen,
  onClose,
  onSuccess,
  excludeProviders = [],
  defaultProvider,
}: AddApiKeyModalProps) {
  const [provider, setProvider] = useState<ApiKeyProvider | "">(defaultProvider || "")
  const [apiKey, setApiKey] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean
    message: string
    models?: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const availableProviders = Constants.public.Enums.provider_ai.filter(
    (p) => !excludeProviders.includes(p as ApiKeyProvider),
  ) as ApiKeyProvider[]

  const resetForm = () => {
    setProvider(defaultProvider || "")
    setApiKey("")
    setVerificationResult(null)
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const verifyApiKey = async () => {
    if (!provider || !apiKey.trim()) {
      setError("Por favor selecciona un proveedor e ingresa una clave API")
      return
    }

    setIsVerifying(true)
    setError(null)
    setVerificationResult(null)

    try {
      const result = await ApiKeyService.verifyApiKey({
        key: apiKey,
        provider: provider as ApiKeyProvider,
      })

      setVerificationResult(result)
      return result.valid
    } catch (err: any) {
      setError(err.message || "Error al verificar la clave API")
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async () => {
    // Verify first if not already verified or if verification failed
    if (!verificationResult?.valid) {
      const isValid = await verifyApiKey()
      if (!isValid) return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await ApiKeyService.createApiKey({
        key: apiKey,
        provider: provider as ApiKeyProvider,
        models: verificationResult?.models,
      })

      if (result.success) {
        onSuccess()
        handleClose()
      } else {
        setError("Error al guardar la clave API")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la clave API")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProviderInstructions = (provider: ApiKeyProvider | "") => {
    switch (provider) {
      case "OPENAI":
        return "Ingresa tu clave API de OpenAI. Puedes encontrarla en tu panel de OpenAI en https://platform.openai.com/api-keys"
      case "GOOGLE":
        return "Ingresa tu clave API de Google AI Studio. Puedes crearla en https://makersuite.google.com/app/apikeys"
      case "PERPLEXITY":
        return "Ingresa tu clave API de Perplexity. Puedes encontrarla en https://www.perplexity.ai/settings/api"
      default:
        return "Selecciona un proveedor de IA para continuar"
    }
  }

  const getProviderPlaceholder = (provider: ApiKeyProvider | "") => {
    switch (provider) {
      case "OPENAI":
        return "sk-..."
      case "GOOGLE":
        return "AIza..."
      case "PERPLEXITY":
        return "pplx-..."
      default:
        return "Ingresa tu clave API"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Modelo de IA</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Proveedor de IA</Label>
            <Select
              value={provider}
              onValueChange={(value) => {
                setProvider(value as ApiKeyProvider)
                setVerificationResult(null)
              }}
              disabled={isVerifying || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Todos los proveedores ya están conectados
                  </SelectItem>
                ) : (
                  availableProviders.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p === "OPENAI" ? "OpenAI" : p === "GOOGLE" ? "Google AI / Anthropic" : "Perplexity AI"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">Clave API</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setVerificationResult(null)
              }}
              placeholder={getProviderPlaceholder(provider as ApiKeyProvider)}
              disabled={isVerifying || isSubmitting || !provider}
              type="password"
            />
            <p className="text-sm text-gray-500">{getProviderInstructions(provider as ApiKeyProvider)}</p>
          </div>

          {verificationResult && (
            <div
              className={`p-3 rounded-md ${
                verificationResult.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {verificationResult.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{verificationResult.message}</p>
                  {verificationResult.valid && verificationResult.models && (
                    <div className="mt-1">
                      <p className="text-sm font-medium">Modelos disponibles:</p>
                      <ul className="mt-1 text-sm list-disc list-inside">
                        {verificationResult.models.map((model) => (
                          <li key={model}>{model}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700">
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
          <Button variant="outline" onClick={handleClose} disabled={isVerifying || isSubmitting}>
            Cancelar
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={verifyApiKey}
              disabled={!provider || !apiKey || isVerifying || isSubmitting}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !provider || !apiKey || isVerifying || isSubmitting || (verificationResult && !verificationResult.valid)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
