"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signUp } from "@/lib/supabase/auth-actions"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("lastname", values.lastname)
      formData.append("email", values.email)
      formData.append("password", values.password)

      const result = await signUp(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    } catch (e) {
      setError("Ocurrió un error al registrarse. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-sidebar">¡Registro exitoso!</CardTitle>
            <CardDescription>
              Hemos enviado un correo de confirmación a tu dirección de email. Por favor, verifica tu bandeja de entrada
              para completar el registro.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/auth/login">
              <Button className="bg-sidebar hover:bg-sidebar/90 text-white">Ir a iniciar sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-2xl font-bold text-sidebar">Crear cuenta</CardTitle>
          <CardDescription>Completa el formulario para registrarte</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Contraseña"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirmar contraseña"
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

              {error && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{error}</div>}

              <Button type="submit" className="w-full bg-sidebar hover:bg-sidebar/90 text-white" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="text-sidebar hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
