"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/schemas/auth"
import { requestPasswordReset } from "@/lib/supabase/auth-actions"

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsSubmitting(true)
    setFormStatus(null)

    try {
      const formData = new FormData()
      formData.append("email", data.email)

      const result = await requestPasswordReset(formData)

      if (result.error) {
        setFormStatus({
          type: "error",
          message: result.error,
        })
      } else {
        setFormStatus({
          type: "success",
          message: "Se ha enviado un enlace a tu correo electrónico para restablecer tu contraseña.",
        })
        form.reset()
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
          <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </CardDescription>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          {...field}
                          placeholder="tu@email.com"
                          type="email"
                          autoComplete="email"
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-600">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
