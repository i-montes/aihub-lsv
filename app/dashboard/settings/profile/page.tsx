"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { profileSchema, type ProfileFormValues } from "@/lib/schemas/profile"
import { getCurrentUserProfile, updateUserProfile } from "@/lib/supabase/profile-actions"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
    },
  })

  useEffect(() => {
    async function loadProfile() {
      const profile = await getCurrentUserProfile()
      if (profile) {
        setUserProfile(profile)
        form.reset({
          name: profile.name || "",
          lastname: profile.lastname || "",
          email: profile.email || "",
        })
      }
    }

    loadProfile()
  }, [form])

  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true)
    try {
      const result = await updateUserProfile(values)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error al actualizar perfil",
          description: result.error,
        })
      } else {
        // Refrescar la sesión después de actualizar el perfil
        const supabase = createClientComponentClient()
        await supabase.auth.refreshSession()

        toast({
          title: "Perfil actualizado",
          description: "Tu información de perfil ha sido actualizada correctamente.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Perfil</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4">
                <img
                  src={userProfile?.avatar || "/empowered-trainer.png"}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                La foto de perfil no se puede cambiar en este formulario
              </p>
            </div>

            <div className="w-full md:w-2/3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90 mt-4" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
