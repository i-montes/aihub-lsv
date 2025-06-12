"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent as CardContent2 } from "@/components/ui/card"
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
import { Trash2, Edit } from "lucide-react"

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

  const [isDeleting, setIsDeleting] = useState(false)
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchMembers = async () => {
    try {
      setIsLoading(true)

      // Obtener miembros
      const membersResponse = await OrganizationService.getMembers()
      setMembers(membersResponse?.members || [])
    } catch (err) {
      console.error("Error fetching members:", err)
      setError("No se pudieron cargar los miembros de la organización")
      toast.error("No se pudieron cargar los miembros de la organización")
    } finally {
      setIsLoading(false)
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

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsDeleting(true)

      await api.delete(`/organization/members/${userId}`)

      toast.success("Usuario eliminado exitosamente")

      // Actualizar la lista de miembros
      setMembers(members.filter((member) => member.id !== userId))

      // Cerrar el diálogo
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast.error(error.message || "Error al eliminar el usuario")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lista de Usuarios</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
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
              members.map((member) => (
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="p-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 text-red-500 hover:text-red-700"
                        onClick={() => {
                          setUserToDelete(member)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent2>
      </Card>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {userToDelete?.name} {userToDelete?.lastname}? Esta acción no se
              puede deshacer y el usuario perderá acceso a la organización.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setUserToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
