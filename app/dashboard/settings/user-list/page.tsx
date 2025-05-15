"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Filter, Edit, Trash, MoreVertical, FileText, ChevronLeft, ChevronRight, Plus } from "lucide-react"

export default function UserListPage() {
  // Estado para controlar el modal de nuevo usuario
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)
  // Estado para controlar el modal de edición de usuario
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  // Estado para almacenar el usuario que se está editando
  const [editingUser, setEditingUser] = useState(null)

  // Datos de ejemplo para la lista de usuarios
  const users = [
    {
      id: 1,
      name: "Amanda Johnson",
      email: "amanda@example.com",
      role: "Administrador",
      department: "Marketing",
      status: "active",
      avatar: "/empowered-trainer.png",
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      role: "Editor",
      department: "Redacción",
      status: "active",
      avatar: "/thoughtful-man-profile.png",
    },
    {
      id: 3,
      name: "María García",
      email: "maria@example.com",
      role: "Visualizador",
      department: "Diseño",
      status: "active",
      avatar: "/serene-woman-gaze.png",
    },
    {
      id: 4,
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "Editor",
      department: "Investigación",
      status: "inactive",
      avatar: "/thoughtful-man-profile.png",
    },
    {
      id: 5,
      name: "Laura Sánchez",
      email: "laura@example.com",
      role: "Redactor",
      department: "Noticias",
      status: "active",
      avatar: "/serene-woman-gaze.png",
    },
  ]

  // Función para manejar la creación de un nuevo usuario
  const handleCreateUser = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para crear un nuevo usuario
    setIsNewUserModalOpen(false)
    // Mostrar alguna notificación de éxito
  }

  // Función para abrir el modal de edición con los datos del usuario
  const handleEditUser = (user) => {
    setEditingUser(user)
    setIsEditUserModalOpen(true)
  }

  // Función para guardar los cambios del usuario
  const handleSaveUserChanges = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar los datos del usuario
    setIsEditUserModalOpen(false)
    setEditingUser(null)
    // Mostrar alguna notificación de éxito
  }

  // Función para exportar usuarios a CSV
  const exportUsersToCSV = () => {
    // Encabezados del CSV
    const headers = ["Nombre", "Correo Electrónico", "Rol", "Departamento", "Estado"]

    // Convertir datos de usuarios a formato CSV
    const userDataCSV = users.map((user) => [
      user.name,
      user.email,
      user.role,
      user.department,
      user.status === "active" ? "Activo" : "Inactivo",
    ])

    // Combinar encabezados y datos
    const csvContent = [headers.join(","), ...userDataCSV.map((row) => row.join(","))].join("\n")

    // Crear un blob con el contenido CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Crear URL para el blob
    const url = URL.createObjectURL(blob)

    // Crear un elemento de enlace para descargar
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `usuarios_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    // Añadir al DOM, hacer clic y eliminar
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Lista de Usuarios</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={exportUsersToCSV}>
                <FileText size={16} />
                Exportar
              </Button>
              <Button className="bg-sidebar text-white hover:bg-sidebar/90" onClick={() => setIsNewUserModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Añadir Usuario
              </Button>
            </div>
          </div>

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
                      <Input id="firstName" placeholder="Nombre" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input id="lastName" placeholder="Apellido" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" placeholder="correo@ejemplo.com" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <select
                        id="role"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Seleccionar rol</option>
                        <option value="admin">Administrador</option>
                        <option value="editor">Editor</option>
                        <option value="redactor">Redactor</option>
                        <option value="visualizador">Visualizador</option>
                        <option value="fotografo">Fotógrafo</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <select
                        id="department"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Seleccionar departamento</option>
                        <option value="marketing">Marketing</option>
                        <option value="redaccion">Redacción</option>
                        <option value="diseno">Diseño</option>
                        <option value="investigacion">Investigación</option>
                        <option value="noticias">Noticias</option>
                        <option value="multimedia">Multimedia</option>
                        <option value="internacional">Internacional</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" placeholder="Contraseña" required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="active" defaultChecked />
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
                        <Input id="editFirstName" defaultValue={editingUser.name.split(" ")[0]} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editLastName">Apellido</Label>
                        <Input id="editLastName" defaultValue={editingUser.name.split(" ")[1] || ""} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEmail">Correo Electrónico</Label>
                      <Input id="editEmail" type="email" defaultValue={editingUser.email} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editRole">Rol</Label>
                        <select
                          id="editRole"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          defaultValue={editingUser.role.toLowerCase()}
                          required
                        >
                          <option value="administrador">Administrador</option>
                          <option value="editor">Editor</option>
                          <option value="redactor">Redactor</option>
                          <option value="visualizador">Visualizador</option>
                          <option value="fotógrafo">Fotógrafo</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editDepartment">Departamento</Label>
                        <select
                          id="editDepartment"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          defaultValue={editingUser.department.toLowerCase()}
                          required
                        >
                          <option value="marketing">Marketing</option>
                          <option value="redacción">Redacción</option>
                          <option value="diseño">Diseño</option>
                          <option value="investigación">Investigación</option>
                          <option value="noticias">Noticias</option>
                          <option value="multimedia">Multimedia</option>
                          <option value="internacional">Internacional</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="editActive" defaultChecked={editingUser.status === "active"} />
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

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input className="pl-9 w-[300px] bg-white" placeholder="Buscar usuario..." />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter size={14} />
                Filtrar
              </Button>
              <select className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">Todos los departamentos</option>
                <option value="marketing">Marketing</option>
                <option value="redaccion">Redacción</option>
                <option value="diseno">Diseño</option>
                <option value="investigacion">Investigación</option>
                <option value="noticias">Noticias</option>
                <option value="multimedia">Multimedia</option>
                <option value="internacional">Internacional</option>
              </select>
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
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{user.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{user.department}</span>
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
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash size={16} />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={16} />
                          <span className="sr-only">Más opciones</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="py-4 px-6 bg-gray-50 border-t flex items-center justify-between">
              <div className="text-sm text-gray-500">Mostrando 1-5 de 5 usuarios</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft size={16} />
                  <span className="sr-only">Página anterior</span>
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight size={16} />
                  <span className="sr-only">Página siguiente</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
