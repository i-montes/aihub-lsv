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
              {pendingInvitations.map((invitation) => {
                // Calcular tiempo transcurrido desde la invitación
                const invitationDate = new Date(invitation.created_at)
                const now = new Date()
                const diffTime = Math.abs(now.getTime() - invitationDate.getTime())
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

                // Formatear tiempo transcurrido
                let timeAgo
                if (diffDays === 0) {
                  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
                  if (diffHours === 0) {
                    const diffMinutes = Math.floor(diffTime / (1000 * 60))
                    timeAgo = `hace ${diffMinutes} ${diffMinutes === 1 ? "minuto" : "minutos"}`
                  } else {
                    timeAgo = `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
                  }
                } else if (diffDays === 1) {
                  timeAgo = "ayer"
                } else if (diffDays < 7) {
                  timeAgo = `hace ${diffDays} días`
                } else if (diffDays < 30) {
                  const diffWeeks = Math.floor(diffDays / 7)
                  timeAgo = `hace ${diffWeeks} ${diffWeeks === 1 ? "semana" : "semanas"}`
                } else {
                  timeAgo = invitationDate.toLocaleDateString()
                }

                // Determinar el color de la etiqueta de rol
                let roleColor
                let roleName
                switch (invitation.role?.toUpperCase()) {
                  case "OWNER":
                    roleColor = "bg-purple-100 text-purple-800"
                    roleName = "Propietario"
                    break
                  case "ADMIN":
                    roleColor = "bg-blue-100 text-blue-800"
                    roleName = "Administrador"
                    break
                  default:
                    roleColor = "bg-green-100 text-green-800"
                    roleName = "Usuario"
                }

                // Determinar el estado de la invitación
                const invitationStatus = invitation.email_confirmed_at
                  ? "Confirmado"
                  : invitation.last_sign_in_at
                    ? "Visto"
                    : "Pendiente"

                const statusColor = invitation.email_confirmed_at
                  ? "bg-green-100 text-green-800"
                  : invitation.last_sign_in_at
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"

                return (
                  <div key={invitation.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-lg flex items-center">
                          {invitation.full_name || invitation.email}
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${roleColor}`}>{roleName}</span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{invitationStatus}</div>
                      </div>

                      <div className="text-sm text-gray-500 mb-1">{invitation.email}</div>

                      <div className="flex items-center text-xs text-gray-400 mt-2">
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Invitado {timeAgo}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white"
                          onClick={() => {
                            // Copiar enlace de invitación al portapapeles
                            const inviteLink = `${window.location.origin}/auth/invite?id=${invitation.id}`
                            navigator.clipboard.writeText(inviteLink)
                            toast.success("Enlace copiado al portapapeles")
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                          Copiar enlace
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white"
                          onClick={() => handleResendInvitation(invitation.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reenviar
                        </Button>
                      </div>
                      <div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 bg-white">
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Cancelar invitación</DialogTitle>
                              <DialogDescription>
                                ¿Estás seguro de que deseas cancelar la invitación para {invitation.email}? Esta acción
                                no se puede deshacer.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {}}>
                                Cancelar
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  handleCancelInvitation(invitation.id)
                                  document
                                    .querySelector('[role="dialog"]')
                                    ?.closest("div[data-state]")
                                    ?.querySelector("button[data-state]")
                                    ?.click()
                                }}
                              >
                                Sí, cancelar invitación
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
