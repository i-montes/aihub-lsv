"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Filter, Edit, Trash, MoreVertical, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import type { Database } from "@/lib/database.types"
import { updateUser, createUser, deleteUser } from "@/lib/supabase/user-actions"
import { useToast } from "@/hooks/use-toast"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface UsersTableProps {
  users: Profile[]
}

// Tipo para los datos del usuario
type User = {
  id: string
  name: string
  lastname?: string
  email: string
  role: string
  department?: string
  status: "active" | "inactive"
  avatar?: string
  created_at?: string
  updated_at?: string
}

export function UsersTable({ users: initialUsers }: { initialUsers: User[] }) {
  // Estado para los usuarios
  const [users, setUsers] = useState<User[]>(initialUsers as any)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers as any)

  // Estado para la búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  // Estado para los modales
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  // Estado para el formulario de nuevo usuario
  const [newUser, setNewUser] = useState({
    name: "",
    lastname: "",
    email: "",
    role: "USER",
    department: "",
    password: "",
    status: "active" as const,
  })

  // Toast para notificaciones
  const { toast } = useToast()

  // Efecto para filtrar usuarios cuando cambia la búsqueda o el filtro
  useEffect(() => {
    let result = [...users]

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.department && user.department.toLowerCase().includes(term)),
      )
    }

    // Aplicar filtro de departamento
    if (departmentFilter !== "all") {
      result = result.filter(
        (user) => user.department && user.department.toLowerCase() === departmentFilter.toLowerCase(),
      )
    }

    setFilteredUsers(result)
  }, [users, searchTerm, departmentFilter])

  // Función para abrir el modal de edición
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditUserModalOpen(true)
  }

  // Función para abrir el modal de eliminación
  const handleDeleteUserClick = (userId: string) => {
    setDeletingUserId(userId)
    setIsDeleteUserModalOpen(true)
  }

  // Función para guardar los cambios del usuario
  const handleSaveUserChanges = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    try {
      const result = await updateUser(editingUser)

      if (result.error) {
        toast({
          title: "Error al actualizar usuario",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Actualizar el usuario en el estado local
      setUsers(users.map((user) => (user.id === editingUser.id ? editingUser : user)))

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario se han actualizado correctamente.",
      })

      setIsEditUserModalOpen(false)
      setEditingUser(null)
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      toast({
        title: "Error al actualizar usuario",
        description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para crear un nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await createUser({
        ...newUser,
        status: newUser.status as "active" | "inactive",
      })

      if (result.error) {
        toast({
          title: "Error al crear usuario",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Añadir el nuevo usuario al estado local
      const createdUser: User = {
        id: result.userId || crypto.randomUUID(),
        name: newUser.name,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        status: newUser.status,
      }

      setUsers([...users, createdUser])

      toast({
        title: "Usuario creado",
        description: "El nuevo usuario se ha creado correctamente.",
      })

      // Resetear el formulario
      setNewUser({
        name: "",
        lastname: "",
        email: "",
        role: "USER",
        department: "",
        password: "",
        status: "active",
      })

      setIsNewUserModalOpen(false)
    } catch (error) {
      console.error("Error al crear usuario:", error)
      toast({
        title: "Error al crear usuario",
        description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un usuario
  const handleDeleteUser = async () => {
    if (!deletingUserId) return

    try {
      const result = await deleteUser(deletingUserId)

      if (result.error) {
        toast({
          title: "Error al eliminar usuario",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Eliminar el usuario del estado local
      setUsers(users.filter((user) => user.id !== deletingUserId))

      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente.",
      })

      setIsDeleteUserModalOpen(false)
      setDeletingUserId(null)
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error al eliminar usuario",
        description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Obtener departamentos únicos para el filtro
  const departments = ["all", ...new Set(users.map((user) => user.department).filter(Boolean))]

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Nunca"
    return new Date(date).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Badge className="bg-purple-500">Propietario</Badge>
      case "WORKSPACE_ADMIN":
        return <Badge className="bg-blue-500">Administrador</Badge>
      case "USER":
        return <Badge variant="outline">Usuario</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-500">No hay usuarios</h3>
        <p className="text-sm text-gray-400 mt-1">Añade usuarios a tu organización para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            className="pl-9 w-[300px] bg-white"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter size={14} />
            Filtrar
          </Button>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">Todos los departamentos</option>
            {departments
              .filter((d) => d !== "all")
              .map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
          </select>
          <Button className="bg-sidebar text-white hover:bg-sidebar/90" onClick={() => setIsNewUserModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Añadir Usuario
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Usuario</th>
              <th className="py-3 px-4 text-left font-medium">Rol</th>
              <th className="py-3 px-4 text-left font-medium">Departamento</th>
              <th className="py-3 px-4 text-left font-medium">Estado</th>
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No se encontraron usuarios con los criterios de búsqueda.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <img
                          src={user.avatar || `/placeholder.svg?height=40&width=40&query=avatar`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.name} {user.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{user.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{user.department || "-"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditUser(user)}>
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteUserClick(user.id)}
                      >
                        <Trash size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="py-4 px-6 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para editar usuario */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifique la información del usuario.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleSaveUserChanges}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName">Nombre</Label>
                    <Input
                      id="editFirstName"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName">Apellido</Label>
                    <Input
                      id="editLastName"
                      value={editingUser.lastname || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, lastname: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Correo Electrónico</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editRole">Rol</Label>
                    <select
                      id="editRole"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      required
                    >
                      <option value="OWNER">Propietario</option>
                      <option value="WORKSPACE_ADMIN">Administrador</option>
                      <option value="USER">Usuario</option>
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Visualizador</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDepartment">Departamento</Label>
                    <Input
                      id="editDepartment"
                      value={editingUser.department || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editActive"
                    checked={editingUser.status === "active"}
                    onCheckedChange={(checked) =>
                      setEditingUser({ ...editingUser, status: checked ? "active" : "inactive" })
                    }
                  />
                  <Label htmlFor="editActive">Usuario activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditUserModalOpen(false)
                    setEditingUser(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90">
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para crear nuevo usuario */}
      <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>Complete el formulario para agregar un nuevo usuario al sistema.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    placeholder="Nombre"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    placeholder="Apellido"
                    value={newUser.lastname}
                    onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <select
                    id="role"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="WORKSPACE_ADMIN">Administrador</option>
                    <option value="USER">Usuario</option>
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Visualizador</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    placeholder="Departamento"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newUser.status === "active"}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, status: checked ? "active" : "inactive" })}
                />
                <Label htmlFor="active">Usuario activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90">
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar eliminación */}
      <Dialog open={isDeleteUserModalOpen} onOpenChange={setIsDeleteUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
