"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent as CardContent2 } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { OrganizationService } from "@/lib/services/organization-service"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Esquema de validación con Zod
const inviteUserSchema = z.object({
  email: z.string().email({ message: "Debe ser un email válido" }),
  role: z.enum(["OWNER", "ADMIN", "USER"], {
    required_error: "Debes seleccionar un rol",
  }),
})

type InviteUserFormValues = z.infer<typeof inviteUserSchema>

export default function UserListSettingsPage() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [pendingInvitations, setPendingInvitations] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Configuración de React Hook Form con Zod
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "USER",
    },
  })

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true)
        const response = await OrganizationService.getMembers()
        console.log("Members response:", response)
        if (response && response.members) {
          setMembers(response.members)
        }
      } catch (error) {
        console.error("Error loading members:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los miembros de la organización",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMembers()
  }, [toast])

  // Función para traducir roles a español
  const translateRole = (role) => {
    const roleMap = {
      OWNER: "Propietario",
      ADMIN: "Administrador",
      USER: "Usuario",
    }
    return roleMap[role] || role
  }

  // Función para manejar la invitación de usuario
  const onSubmit = async (data: InviteUserFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await OrganizationService.inviteUser(data.email, data.role)

      toast({
        title: "Usuario invitado",
        description: `Se ha enviado una invitación a ${data.email}`,
      })

      // Cerrar el diálogo y resetear el formulario
      setIsDialogOpen(false)
      form.reset()

      // Actualizar la lista de invitaciones pendientes
      // En un caso real, deberíamos obtener las invitaciones pendientes de la API
      setPendingInvitations([
        ...pendingInvitations,
        {
          email: data.email,
          role: translateRole(data.role),
          daysAgo: 0,
        },
      ])
    } catch (error) {
      console.error("Error inviting user:", error)
      toast({
        title: "Error",
        description: "No se pudo invitar al usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lista de Usuarios</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90" onClick={() => setIsDialogOpen(true)}>
          Invitar usuario
        </Button>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Miembros de la Organización</CardTitle>
          <CardDescription>Gestiona los usuarios de tu organización</CardDescription>
        </CardHeader>
        <CardContent2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-sidebar" />
            </div>
          ) : (
            <div className="space-y-4">
              {members.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No hay miembros en esta organización</div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url || "/placeholder.svg"}
                            alt={member.full_name || member.email}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-sidebar text-white">
                            {(member.full_name || member.email || "").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.full_name || "Sin nombre"}</p>
                        <p className="text-sm text-gray-500">
                          {member.email} • {translateRole(member.role)}
                        </p>
                      </div>
                    </div>
                    {profile && profile.id === member.id ? (
                      <div className="px-2 py-1 bg-sidebar text-white rounded-full text-xs">Tú</div>
                    ) : (
                      <Button variant="outline" size="sm">
                        Gestionar
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent2>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Invitaciones Pendientes</CardTitle>
          <CardDescription>Invitaciones enviadas que aún no han sido aceptadas</CardDescription>
        </CardHeader>
        <CardContent2>
          <div className="space-y-4">
            {pendingInvitations.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No hay invitaciones pendientes</div>
            ) : (
              pendingInvitations.map((invitation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-gray-500">
                      Enviada hace {invitation.daysAgo} días • {invitation.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Reenviar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent2>
      </Card>

      {/* Diálogo para invitar usuarios */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invitar usuario</DialogTitle>
            <DialogDescription>
              Envía una invitación por correo electrónico para que un nuevo usuario se una a tu organización.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OWNER">Propietario</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="USER">Usuario</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar invitación"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
