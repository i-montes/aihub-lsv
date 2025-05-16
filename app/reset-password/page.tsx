"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { resetPassword, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await resetPassword(email)
    setIsSubmitted(true)
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
            {!isSubmitted ? (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2">Recuperar contraseña</h1>
                  <p className="text-gray-500">
                    Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                  </p>
                </div>

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

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enviando instrucciones...
                      </div>
                    ) : (
                      <span>Enviar instrucciones</span>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Instrucciones enviadas</h2>
                <p className="text-gray-500 mb-6">
                  Hemos enviado instrucciones para restablecer tu contraseña a <strong>{email}</strong>. Revisa tu
                  bandeja de entrada y sigue los pasos indicados.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ¿No recibiste el correo? Revisa tu carpeta de spam o{" "}
                  <button
                    className="text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => setIsSubmitted(false)}
                  >
                    intenta nuevamente
                  </button>
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Link href="/login" className="flex items-center text-primary-600 hover:text-primary-700">
                <ArrowLeft size={16} className="mr-2" />
                Volver a inicio de sesión
              </Link>
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
