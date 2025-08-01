"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Check, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { AuthError } from "@/lib/services/auth-service"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const { signUp, isLoading } = useAuth()

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!acceptTerms) {
      setError({
        message: "Debes aceptar los términos y condiciones para continuar",
        code: "TERMS_NOT_ACCEPTED",
      })
      return
    }

    if (!isPasswordValid) {
      setError({
        message: "La contraseña no cumple con los requisitos mínimos",
        code: "INVALID_PASSWORD",
      })
      return
    }

    const result = await signUp(email, password, name, lastname)

    if (!result.success && result.error) {
      // Verificar si es el caso especial "No se recibió respuesta del servidor"
      if (
        result.error.code === "EMPTY_RESPONSE" ||
        result.error.message.includes("No se recibió respuesta del servidor")
      ) {
        // Tratar como éxito pero aún mostrar el mensaje
        setError({
          message: "No se recibió respuesta del servidor",
          code: "EMPTY_RESPONSE",
        })
      } else {
        // Otros errores se manejan normalmente
        setError(result.error)
      }
    }
  }

  // Función para renderizar el mensaje de error según el código
  const renderErrorAlert = () => {
    if (!error) return null

    // Caso especial: "No se recibió respuesta del servidor" se considera éxito
    if (error.code === "EMPTY_RESPONSE" || error.message.includes("No se recibió respuesta del servidor")) {
      return (
        <div className="p-4 mb-6 rounded-lg border bg-green-50 border-green-200 flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-800">Registro exitoso</h3>
            <p className="text-sm mt-1 text-green-700">
              Tu cuenta ha sido creada correctamente. Por favor, revisa tu correo para confirmar tu cuenta.
            </p>
            <div className="mt-2">
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Ir a iniciar sesión →
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Determinar el tipo de alerta según el código de error
    let icon = <AlertCircle className="h-4 w-4" />
    let bgColor = "bg-red-50 border-red-200 text-red-800"
    let title = "Error"

    switch (error.code) {
      case "EMAIL_EXISTS":
        icon = <Info className="h-4 w-4" />
        bgColor = "bg-blue-50 border-blue-200 text-blue-800"
        title = "Cuenta existente"
        break
      case "INVALID_EMAIL":
        icon = <AlertTriangle className="h-4 w-4" />
        bgColor = "bg-yellow-50 border-yellow-200 text-yellow-800"
        title = "Email inválido"
        break
      case "INVALID_PASSWORD":
        icon = <AlertTriangle className="h-4 w-4" />
        bgColor = "bg-yellow-50 border-yellow-200 text-yellow-800"
        title = "Contraseña inválida"
        break
      case "TERMS_NOT_ACCEPTED":
        icon = <AlertTriangle className="h-4 w-4" />
        bgColor = "bg-yellow-50 border-yellow-200 text-yellow-800"
        title = "Términos y condiciones"
        break
      case "RATE_LIMITED":
        icon = <AlertTriangle className="h-4 w-4" />
        bgColor = "bg-orange-50 border-orange-200 text-orange-800"
        title = "Demasiados intentos"
        break
    }

    return (
      <div className={`p-4 mb-6 rounded-lg border ${bgColor} flex items-start`}>
        <div className="mr-3 mt-0.5">{icon}</div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm mt-1">{error.message}</p>
          {error.code === "EMAIL_EXISTS" && (
            <div className="mt-2">
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Ir a iniciar sesión →
              </Link>
            </div>
          )}
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>
              <p className="text-gray-500">Regístrate para comenzar a usar KIT.AI</p>
            </div>

            {renderErrorAlert()}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    required
                    className="h-12"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Apellido</Label>
                  <Input
                    id="lastname"
                    placeholder="Tu apellido"
                    required
                    className="h-12"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className={`h-12 ${error?.code === "EMAIL_EXISTS" || error?.code === "INVALID_EMAIL" ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className={`h-12 pr-10 ${error?.code === "INVALID_PASSWORD" ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
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
                <div className="text-xs text-gray-500 mt-1">
                  <p>La contraseña debe tener al menos:</p>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-center">
                      <Check size={12} className={hasMinLength ? "text-green-500" : "text-gray-400"} />
                      <span className="ml-1">8 caracteres</span>
                    </li>
                    <li className="flex items-center">
                      <Check size={12} className={hasUpperCase ? "text-green-500" : "text-gray-400"} />
                      <span className="ml-1">Una letra mayúscula</span>
                    </li>
                    <li className="flex items-center">
                      <Check size={12} className={hasNumber ? "text-green-500" : "text-gray-400"} />
                      <span className="ml-1">Un número</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  className={`mt-1 ${error?.code === "TERMS_NOT_ACCEPTED" ? "border-red-300" : ""}`}
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                />
                <Label
                  htmlFor="terms"
                  className={`text-sm font-normal ${error?.code === "TERMS_NOT_ACCEPTED" ? "text-red-600" : ""}`}
                >
                  Acepto los{" "}
                  <Link href="#" className="text-primary-600 hover:text-primary-700">
                    Términos de servicio
                  </Link>{" "}
                  y la{" "}
                  <Link href="#" className="text-primary-600 hover:text-primary-700">
                    Política de privacidad
                  </Link>
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
                    Creando cuenta...
                  </div>
                ) : (
                  <span>Crear cuenta</span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2023 KIT.AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
