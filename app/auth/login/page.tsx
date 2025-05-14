"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signIn } from "@/lib/supabase/auth-actions"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirectUrl") || "/dashboard"

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)
      formData.append("redirectUrl", redirectUrl)

      const result = await signIn(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.redirect) {
        // Redirigir al usuario usando window.location
        window.location.href = result.redirect
      }
    } catch (e) {
      console.log("El error: ", e)
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 bg-sidebar rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold">G</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-sidebar">Iniciar sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Contraseña</FormLabel>
                      <Link href="/auth/forgot-password" className="text-xs text-sidebar hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Tu contraseña"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && error.includes("Email not confirmed") ? (
                <div className="bg-amber-50 p-3 rounded-md text-amber-700 text-sm flex flex-col gap-2">
                  <p>Tu correo electrónico no ha sido confirmado.</p>
                  <Link href="/auth/confirm-email" className="text-amber-800 font-medium hover:underline">
                    Haz clic aquí para confirmar tu correo o solicitar un nuevo enlace
                  </Link>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{error}</div>
              ) : null}

              <Button type="submit" className="w-full bg-sidebar hover:bg-sidebar/90 text-white" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/register" className="text-sidebar hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
