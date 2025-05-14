"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/schemas/auth"
import { resetPassword } from "@/lib/supabase/auth-actions"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Verificar que tengamos el token en la URL
  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) {
      setFormStatus({
        type: "error",
        message: "Enlace de restablecimiento inválido o expirado. Por favor, solicita un nuevo enlace.",
      })
    }
  }, [searchParams])

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: ResetPasswordFormValues) {
    setIsSubmitting(true)
    setFormStatus(null)

    try {
      const formData = new FormData()
      formData.append("password", data.password)

      const result = await resetPassword(formData)

      if (result.error) {
        setFormStatus({
          type: "error",
          message: result.error,
        })
      } else {
        setFormStatus({
          type: "success",
          message: "Tu contraseña ha sido restablecida correctamente.",
        })

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (error) {
      setFormStatus({
        type: "error",
        message: "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Establecer nueva contraseña</CardTitle>
          <CardDescription>Crea una nueva contraseña segura para tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          {formStatus && (
            <Alert className={`mb-4 ${formStatus.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
              <AlertDescription className={formStatus.type === "success" ? "text-green-800" : "text-red-800"}>
                {formStatus.message}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          {...field}
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="pl-10 pr-10"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          {...field}
                          placeholder="••••••••"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="pl-10 pr-10"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">
                            {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting || !!formStatus?.type === "success"}>
                {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-600">
            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
