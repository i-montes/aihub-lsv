"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { resendConfirmationEmail } from "@/lib/supabase/auth-actions"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const confirmEmailSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido" }),
})

type ConfirmEmailFormValues = z.infer<typeof confirmEmailSchema>

export default function ConfirmEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const form = useForm<ConfirmEmailFormValues>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: ConfirmEmailFormValues) => {
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("email", values.email)

      const result = await resendConfirmationEmail(formData)

      if (result?.error) {
        setStatus("error")
        setMessage(result.error)
      } else {
        setStatus("success")
        setMessage("Hemos enviado un nuevo enlace de confirmación a tu correo electrónico.")
      }
    } catch (e) {
      setStatus("error")
      setMessage("Ocurrió un error al enviar el correo de confirmación. Por favor, inténtalo de nuevo.")
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
          <CardTitle className="text-2xl font-bold text-sidebar">Confirmar correo electrónico</CardTitle>
          <CardDescription>
            Introduce tu correo electrónico para recibir un nuevo enlace de confirmación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">¡Correo enviado!</AlertTitle>
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">{message}</AlertDescription>
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
                      <Input placeholder="tu@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-sidebar hover:bg-sidebar/90 text-white" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar enlace de confirmación"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>
            ¿Ya confirmaste tu correo?{" "}
            <Link href="/auth/login" className="text-sidebar hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
