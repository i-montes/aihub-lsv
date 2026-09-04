"use client"

import { useEffect, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Check, Copy, KeyRound, Loader2, ShieldAlert } from "lucide-react"

interface OrgTokenModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface GeneratedToken {
  token: string
  organizationId: string
  expiresAt: string
}

const TTL_OPTIONS = [
  { value: "300", label: "5 minutos" },
  { value: "900", label: "15 minutos" },
  { value: "1800", label: "30 minutos" },
  { value: "3600", label: "1 hora" },
]

function formatRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function OrgTokenModal({ open, onOpenChange }: OrgTokenModalProps) {
  const [ttlSeconds, setTtlSeconds] = useState("300")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<GeneratedToken | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [copiedField, setCopiedField] = useState<"token" | "curl" | null>(null)

  // El token es una credencial: no lo dejamos en memoria al cerrar el diálogo.
  useEffect(() => {
    if (!open) {
      setGenerated(null)
      setError(null)
      setCopiedField(null)
      setTtlSeconds("300")
    }
  }, [open])

  // Cuenta regresiva hasta que el token expira.
  useEffect(() => {
    if (!generated) return

    const tick = () => {
      const secondsLeft = Math.max(0, Math.floor((new Date(generated.expiresAt).getTime() - Date.now()) / 1000))
      setRemaining(secondsLeft)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [generated])

  const isExpired = generated !== null && remaining === 0

  const curlExample = generated
    ? `curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/internal/llm-keys \\
  -H "Authorization: Bearer ${generated.token}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider": "OPENAI"}'`
    : ""

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setCopiedField(null)

    try {
      const response = await fetch("/api/internal/llm-keys/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ttlSeconds: Number(ttlSeconds) }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.error ?? "No se pudo generar el token. Inténtalo de nuevo.")
        return
      }

      setGenerated(data)
    } catch (err) {
      console.error("Error al generar el token de organización:", err)
      setError(err instanceof Error ? err.message : "No se pudo generar el token")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (value: string, field: "token" | "curl") => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err)
      setError("No se pudo copiar. Selecciona el texto y cópialo manualmente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={18} className="text-amber-500" />
            Token de acceso a la API
          </DialogTitle>
          <DialogDescription>
            Genera un token temporal para que un servicio externo consulte las claves de IA de tu organización a través
            de <code className="text-xs">POST /api/internal/llm-keys</code>.
          </DialogDescription>
        </DialogHeader>

        {!generated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ttl">Vigencia del token</Label>
              <Select value={ttlSeconds} onValueChange={setTtlSeconds}>
                <SelectTrigger id="ttl">
                  <SelectValue placeholder="Selecciona la vigencia" />
                </SelectTrigger>
                <SelectContent>
                  {TTL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Cuanto más corta, mejor. Genera uno nuevo cada vez que lo necesites en lugar de guardarlo.
              </p>
            </div>

            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg flex gap-2 text-sm">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <p>
                Quien tenga este token puede leer <strong>todas las claves de IA de tu organización en texto plano</strong>
                . Trátalo como una contraseña: no lo compartas por canales abiertos ni lo publiques en una URL.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Token</Label>
                <span className={`text-xs font-medium ${isExpired ? "text-red-600" : "text-gray-500"}`}>
                  {isExpired ? "Expirado" : `Expira en ${formatRemaining(remaining)}`}
                </span>
              </div>
              <div className="relative">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 pr-12 font-mono text-xs break-all max-h-28 overflow-y-auto">
                  {generated.token}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1.5 right-1.5 h-8 w-8 p-0"
                  onClick={() => handleCopy(generated.token, "token")}
                  aria-label="Copiar token"
                >
                  {copiedField === "token" ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ejemplo de uso</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleCopy(curlExample, "curl")}
                >
                  {copiedField === "curl" ? (
                    <>
                      <Check size={14} className="mr-1 text-green-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="mr-1" />
                      Copiar cURL
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs overflow-x-auto">
                <code>{curlExample}</code>
              </pre>
            </div>

            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg flex gap-2 text-sm">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <p>
                Este token no se vuelve a mostrar. Cuando expire, genera uno nuevo desde aquí.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {generated ? "Cerrar" : "Cancelar"}
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : generated ? (
              "Generar otro"
            ) : (
              "Generar token"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
