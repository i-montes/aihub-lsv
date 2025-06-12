"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function InvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const organizationId = searchParams.get("organizationId")

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [invitation, setInvitation] = useState<{
    id: string
    email: string
    name: string | null
    lastname: string | null
    organizationName: string | null
  } | null>({
    id: "",
    email: "",
    name: null,
    lastname: null,
    organizationName: null,
  })

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Verificar la invitación al cargar la página
  useEffect(() => {
    async function verifyInvitation() {
      if (!email) {
        setError("Email no proporcionado")
        setIsLoading(false)
        return
      }

      try {
        const data = await api.get(`/auth/verify-invitation?email=${email}&organizationId=${organizationId}`)

        // Verificar si el usuario existe y su estado
        if (!data.user) {
          setError("Usuario no encontrado")
          setIsLoading(false)
          return
        }

        setInvitation({
          id: data.user.id,
          email: data.user.email,
          name: data.user?.name || null,
          lastname: data.user?.lastname || null,
          organizationName: data.invitation?.organizationName || null,
        })
        setIsLoading(false)
      } catch (error: any) {
        console.error("Error al verificar la invitación:", error)
        setError(error.message || "No se pudo verificar la invitación")
        setIsLoading(false)
      }
    }

    verifyInvitation()
  }, [email, organizationId])

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setIsSubmitting(true)

    try {
      await api.post("/auth/accept-invitation", {
        id: invitation?.id,
        password,
      })

      setSuccess(true)
      toast.success("¡Bienvenido! Tu cuenta ha sido activada correctamente")

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error al aceptar la invitación:", error)
      toast.error(error.message || "No se pudo completar el registro")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verificando invitación</CardTitle>
            <CardDescription>Por favor espera mientras verificamos tu invitación</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderizar error
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invitación no válida</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/login")}>
              Ir al inicio de sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Renderizar éxito
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">¡Registro completado!</CardTitle>
            <CardDescription>Tu cuenta ha sido activada correctamente</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Renderizar formulario
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Completa tu registro</CardTitle>
          <CardDescription>
            Has sido invitado a unirte a {invitation?.organizationName || "la organización"}. Por favor establece una
            contraseña para completar tu registro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={invitation?.email || ""} disabled className="bg-gray-50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={invitation?.name || ""} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido</Label>
                <Input id="lastname" value={invitation?.lastname || ""} disabled className="bg-gray-50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Establece una contraseña segura"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirma tu contraseña"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Completar registro"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
