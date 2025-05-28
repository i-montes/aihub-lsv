"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Check } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { signUp, isLoading } = useAuth()

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      alert("Debes aceptar los términos y condiciones para continuar")
      return
    }

    if (!isPasswordValid) {
      alert("La contraseña no cumple con los requisitos mínimos")
      return
    }

    await signUp(email, password, name, lastname)
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
              <span className="font-bold text-2xl">PressAI</span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>
              <p className="text-gray-500">Regístrate para comenzar a usar PressAI</p>
            </div>

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
                  className="h-12"
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
                  className="mt-1"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm font-normal">
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
                disabled={isLoading || !isPasswordValid || !acceptTerms}
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
            <p>© 2023 PressAI. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
