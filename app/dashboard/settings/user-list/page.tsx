"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent as CardContent2,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrganizationService } from "@/lib/services/organization-service"
import { useAuth } from "@/hooks/use-auth"
import type { Profile } from "@/lib/services/auth-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { api } from "@/lib/api-client"
import { Loader2, RefreshCw, X } from "lucide-react"

export default function UserListSettingsPage() {
  const { profile: currentUserProfile } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "USER",
    name: "",
    lastname: "",
  })

  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true)

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      setIsLoadingInvitations(true)

      // Obtener miembros
      const membersResponse = await OrganizationService.getMembers()
      setMembers(membersResponse?.members || [])

      try {
        // Obtener invitaciones pendientes en un bloque try/catch separado
        const invitationsResponse = await api.get("/organization/invitations")
        setPendingInvitations(invitationsResponse?.invitations || [])
      } catch (invitationError) {
        console.error("Error fetching invitations:", invitationError)
        // No establecemos error global aquí, solo para invitaciones
        setPendingInvitations([])
      }
    } catch (err) {
      console.error("Error fetching members:", err)
      setError("No se pudieron cargar los miembros de la organización")
      toast.error("No se pudieron cargar los miembros de la organización")
    } finally {
      setIsLoading(false)
      setIsLoadingInvitations(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setInviteForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setInviteForm((prev) => ({ ...prev, role: value }))
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteForm.email) {
      toast.error("El correo electrónico es obligatorio")
      return
    }

    try {
      setIsInviting(true)

      // Usar el cliente API en lugar de fetch directamente
      await api.post("/organization/invite", {
        email: inviteForm.email,
        role: inviteForm.role,
        name: inviteForm.name,
        lastname: inviteForm.lastname,
      })

      toast.success(`Invitación enviada a ${inviteForm.email}`)
      setInviteForm({
        email: "",
        role: "USER",
        name: "",
        lastname: "",
      })
      setIsDialogOpen(false)

      // Refrescar la lista de miembros e invitaciones
      fetchMembers()
    } catch (err: any) {
      console.error("Error inviting user:", err)
      toast.error(err.message || "Error al invitar al usuario")
    } finally {
      setIsInviting(false)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await api.post(`/organization/invitations/${invitationId}/resend`)
      toast.success("La invitación ha sido reenviada exitosamente")
      // Refrescar la lista de invitaciones
      fetchMembers()
    } catch (error) {
      console.error("Error resending invitation:", error)
      toast.error("No se pudo reenviar la invitación")
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await api.delete(`/organization/invitations/${invitationId}`)
      // Actualizar la lista de invitaciones pendientes
      setPendingInvitations(pendingInvitations.filter((inv) => inv.id !== invitationId))
      toast.success("La invitación ha sido cancelada exitosamente")
      // Refrescar la lista de invitaciones
      fetchMembers()
    } catch (error) {
      console.error("Error canceling invitation:", error)
      toast.error("No se pudo cancelar la invitación")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lista de Usuarios</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sidebar text-white hover:bg-sidebar/90">Añadir Usuario</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Envía una invitación por correo electrónico para que un nuevo usuario se una a tu organización.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email*
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={inviteForm.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastname" className="text-right">
                    Apellido
                  </Label>
                  <Input
                    id="lastname"
                    name="lastname"
                    value={inviteForm.lastname}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rol
                  </Label>
                  <Select value={inviteForm.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Propietario</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="USER">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90" disabled={isInviting}>
                  {isInviting ? "Enviando..." : "Enviar Invitación"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Miembros de la Organización</CardTitle>
          <CardDescription>Gestiona los usuarios de tu organización</CardDescription>
        </CardHeader>
        <CardContent2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">Cargando miembros...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : members.length === 0 ? (
              <div className="text-center py-4">No hay miembros en esta organización</div>
            ) : (
              // Filtramos los miembros para excluir aquellos con invitaciones pendientes
              (() => {
                const filteredMembers = members.filter((member) => {
                  // Verificamos si el miembro tiene una invitación pendiente
                  const hasPendingInvitation = pendingInvitations.some(
                    (invitation) => invitation.email === member.email,
                  )
                  // Solo mostramos miembros sin invitaciones pendientes
                  return !hasPendingInvitation
                })

                if (filteredMembers.length === 0) {
                  return <div className="text-center py-4">Todos los usuarios tienen invitaciones pendientes</div>
                }

                return filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {member.avatar ? (
                          <img
                            src={member.avatar || "/placeholder.svg"}
                            alt={`${member.name || ""} ${member.lastname || ""}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-sidebar text-white">
                            {(member.name?.[0] || "") + (member.lastname?.[0] || "")}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{`${member.name || ""} ${member.lastname || ""}`}</p>
                        <p className="text-sm text-gray-500">{`${member.email} • ${member.role || "Usuario"}`}</p>
                      </div>
                    </div>
                    {currentUserProfile?.id === member.id ? (
                      <div className="px-2 py-1 bg-sidebar text-white rounded-full text-xs">Tú</div>
                    ) : (
                      <Button variant="outline" size="sm">
                        Gestionar
                      </Button>
                    )}
                  </div>
                ))
              })()
            )}
          </div>
        </CardContent2>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Invitaciones Pendientes</CardTitle>
          <CardDescription>Invitaciones enviadas que aún no han sido aceptadas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvitations ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No hay invitaciones pendientes</div>
          ) : (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{invitation.full_name || invitation.email}</div>
                    <div className="text-sm text-gray-500">{invitation.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Invitado el {new Date(invitation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleResendInvitation(invitation.id)}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reenviar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
