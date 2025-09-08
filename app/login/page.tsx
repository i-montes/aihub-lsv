"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { signIn, isLoading } = useAuth()
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [countdown, setCountdown] = useState<number>(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = await signIn(email, password)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const handleResendConfirmation = async () => {
    if (resendStatus === "loading" || countdown > 0) return
    if (!email) {
      toast.error("Por favor, ingresa tu correo electrónico")
      return
    }

    setResendStatus("loading")
    try {
      // Llamar al endpoint para reenviar el correo usando Supabase
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al reenviar el correo")
      }

      setResendStatus("success")
      toast.success("Correo de confirmación enviado")

      // Iniciar el contador (60 segundos)
      setCountdown(60)
      const countdownInterval = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prevCount - 1
        })
      }, 1000)

      // Resetear el estado después de 3 segundos
      setTimeout(() => setResendStatus("idle"), 3000)
    } catch (err: any) {
      console.error("Error resending confirmation email:", err)
      setResendStatus("error")
      toast.error(err.message || "Error al reenviar el correo")
      // Resetear el estado después de 3 segundos
      setTimeout(() => setResendStatus("idle"), 3000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="font-bold text-2xl">KIT.AI</span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold mb-2">Iniciar sesión</h1>
              <p className="text-gray-500">Ingresa tus credenciales para acceder a tu cuenta</p>
            </div>

            {error && error.includes("Email not confirmed") && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="w-full">
                  <p className="text-amber-800 text-sm font-medium">Correo no confirmado</p>
                  <p className="text-amber-700 text-xs mt-1">
                    Por favor, revisa tu bandeja de entrada y confirma tu correo electrónico para poder iniciar sesión.
                  </p>
                  <div className="mt-3 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendStatus === "loading" || resendStatus === "success" || countdown > 0}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        resendStatus === "loading"
                          ? "bg-amber-100 text-amber-500 cursor-wait"
                          : resendStatus === "success"
                            ? "bg-green-100 text-green-700"
                            : resendStatus === "error"
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : countdown > 0
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-amber-100 hover:bg-amber-200 text-amber-800 hover:shadow-sm"
                      }`}
                    >
                      {resendStatus === "loading" && (
                        <>
                          <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando correo...</span>
                        </>
                      )}
                      {resendStatus === "success" && (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>¡Correo enviado!</span>
                        </>
                      )}
                      {resendStatus === "error" && (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Error al enviar. Intentar de nuevo</span>
                        </>
                      )}
                      {resendStatus === "idle" && countdown > 0 && (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Espera {countdown}s para reenviar</span>
                        </>
                      )}
                      {resendStatus === "idle" && countdown === 0 && (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Reenviar correo de confirmación</span>
                        </>
                      )}
                    </button>
                    {countdown > 0 && resendStatus === "idle" && (
                      <p className="text-xs text-gray-500 mt-2">Podrás reenviar el correo en {countdown} segundos</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && !error.includes("Email not confirmed") && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="text-red-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/reset-password" className="text-sm text-primary-600 hover:text-primary-700">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-12 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Recordar mi sesión
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </Button>
            </form>

            {/* <div className="mt-6 text-center">
              <p className="text-gray-500">
                ¿No tienes una cuenta?{" "}
                  <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                    Regístrate
                  </Link>
              </p>
            </div> */}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2023 KIT.AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
