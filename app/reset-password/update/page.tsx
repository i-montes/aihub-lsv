"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Check, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function UpdatePasswordPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { updatePassword, isLoading } = useAuth()

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password !== ""
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      alert("La contraseña no cumple con los requisitos o las contraseñas no coinciden")
      return
    }

    await updatePassword(code as string, password, confirmPassword)
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Actualizar contraseña</h1>
              <p className="text-gray-500">Ingresa tu nueva contraseña para actualizar tu cuenta.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-12 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="flex items-center mt-1 text-xs">
                    <Check size={12} className={passwordsMatch ? "text-green-500" : "text-red-500"} />
                    <span className={`ml-1 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                      {passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white"
                disabled={isLoading || !isPasswordValid}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Actualizando contraseña...
                  </div>
                ) : (
                  <span>Actualizar contraseña</span>
                )}
              </Button>
            </form>

            <div className="mt-6 flex justify-center">
              <Link href="/login" className="flex items-center text-primary-600 hover:text-primary-700">
                <ArrowLeft size={16} className="mr-2" />
                Volver a inicio de sesión
              </Link>
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
