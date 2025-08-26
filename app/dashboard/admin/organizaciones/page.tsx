"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Building, Users, Edit, Search, Filter, ChevronLeft, ChevronRight, Eye, UserPlus, Trash2, AlertTriangle } from "lucide-react"

interface Organization {
  id: string
  name: string
  address: string | null
  city: string | null
  country: string | null
  state: string | null
  contactemail: string | null
  website: string | null
  description: string | null
  logo: string | null
  createdAt: string
  updatedAt: string
  memberCount?: number
}

interface Profile {
  id: string
  name: string | null
  lastname: string | null
  email: string | null
  avatar: string | null
  role: string
  organizationId: string | null
}

export default function AdminOrganizationsPage() {
  const { user, profile } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [orgMembers, setOrgMembers] = useState<Profile[]>([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [membersModalOpen, setMembersModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    state: "",
    contactemail: "",
    website: "",
    description: ""
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteFormData, setInviteFormData] = useState({
    email: "",
    name: "",
    lastname: "",
    role: "USER"
  })
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false)
  const [createOrgLoading, setCreateOrgLoading] = useState(false)
  const [createOrgFormData, setCreateOrgFormData] = useState({
    email: "",
    name: "",
    lastname: "",
    organization_name: ""
  })

  const itemsPerPage = 10
  const supabase = getSupabaseClient()

  // Verificar permisos de administrador
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "OWNER"

  useEffect(() => {
    if (!isAdmin) {
      toast.error("No tienes permisos para acceder a esta página")
      return
    }
    fetchOrganizations()
  }, [isAdmin])

  useEffect(() => {
    filterOrganizations()
  }, [organizations, searchTerm, stateFilter])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      
      // Obtener organizaciones (excluyendo las eliminadas)
      const { data: orgsData, error: orgsError } = await supabase
        .from("organization")
        .select("*")
        .in("state", ["ACTIVE", "INACTIVE"])
        .order("createdAt", { ascending: false })

      if (orgsError) throw orgsError

      // Obtener conteo de miembros para cada organización
      const orgsWithMemberCount = await Promise.all(
        (orgsData || []).map(async (org: Organization) => {
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("organizationId", org.id)

          return {
            ...org,
            memberCount: count || 0
          }
        })
      )

      setOrganizations(orgsWithMemberCount)
    } catch (error) {
      console.error("Error fetching organizations:", error)
      toast.error("Error al cargar las organizaciones")
    } finally {
      setLoading(false)
    }
  }

  const filterOrganizations = () => {
    let filtered = organizations

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.contactemail?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (stateFilter !== "all") {
      filtered = filtered.filter(org => org.state === stateFilter)
    }

    setFilteredOrganizations(filtered)
    setCurrentPage(1)
  }

  const fetchOrgMembers = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("organizationId", orgId)
        .order("name", { ascending: true })

      if (error) throw error
      setOrgMembers(data || [])
    } catch (error) {
      console.error("Error fetching organization members:", error)
      toast.error("Error al cargar los miembros de la organización")
    }
  }

  const handleEditOrg = (org: Organization) => {
    setSelectedOrg(org)
    setEditFormData({
      name: org.name || "",
      address: org.address || "",
      city: org.city || "",
      country: org.country || "",
      state: org.state || "",
      contactemail: org.contactemail || "",
      website: org.website || "",
      description: org.description || ""
    })
    setEditModalOpen(true)
  }

  const handleViewMembers = async (org: Organization) => {
    setSelectedOrg(org)
    await fetchOrgMembers(org.id)
    setMembersModalOpen(true)
  }

  const updateOrganization = async () => {
    if (!selectedOrg) return

    try {
      const { error } = await supabase
        .from("organization")
        .update({
          ...editFormData,
          updatedAt: new Date().toISOString()
        })
        .eq("id", selectedOrg.id)

      if (error) throw error

      toast.success("Organización actualizada exitosamente")
      setEditModalOpen(false)
      fetchOrganizations()
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error("Error al actualizar la organización")
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId)

      if (error) throw error

      toast.success("Rol actualizado exitosamente")
      if (selectedOrg) {
        await fetchOrgMembers(selectedOrg.id)
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Error al actualizar el rol del usuario")
    }
  }

  const removeUserFromOrg = async (userId: string) => {
    try {
      // Llamar a la nueva API segura para eliminar usuarios
      const response = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el usuario")
      }

      toast.success(data.message || "Usuario eliminado completamente del sistema")
      
      // Actualizar la lista de miembros y organizaciones
      if (selectedOrg) {
        await fetchOrgMembers(selectedOrg.id)
        fetchOrganizations() // Actualizar conteo de miembros
      }
    } catch (error: any) {
      console.error("Error removing user:", error)
      toast.error(error.message || "Error al eliminar el usuario del sistema")
    }
  }

  const handleDeleteOrg = (org: Organization) => {
    setOrgToDelete(org)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteOrg = async () => {
    if (!orgToDelete) return

    try {
      const { error } = await supabase
        .from("organization")
        .update({ 
          state: "DELETED",
          updatedAt: new Date().toISOString()
        })
        .eq("id", orgToDelete.id)

      if (error) throw error

      toast.success("Organización eliminada exitosamente")
      setDeleteConfirmOpen(false)
      setOrgToDelete(null)
      fetchOrganizations()
    } catch (error) {
      console.error("Error deleting organization:", error)
      toast.error("Error al eliminar la organización")
    }
  }

  const inviteUser = async () => {
    if (!selectedOrg || !inviteFormData.email) {
      toast.error("El email es obligatorio")
      return
    }

    try {
      setInviteLoading(true)
      
      const response = await fetch("/api/organization/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteFormData.email,
          name: inviteFormData.name,
          lastname: inviteFormData.lastname,
          role: inviteFormData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar la invitación")
      }

      toast.success("Invitación enviada exitosamente")
      setInviteModalOpen(false)
      setInviteFormData({ email: "", name: "", lastname: "", role: "USER" })
      
      // Actualizar la lista de miembros
      if (selectedOrg) {
        await fetchOrgMembers(selectedOrg.id)
        fetchOrganizations() // Actualizar conteo de miembros
      }
    } catch (error: any) {
      console.error("Error inviting user:", error)
      toast.error(error.message || "Error al enviar la invitación")
    } finally {
      setInviteLoading(false)
    }
  }

  const createOrganization = async () => {
    // Validar campos obligatorios
    if (!createOrgFormData.email || !createOrgFormData.name || 
        !createOrgFormData.lastname || !createOrgFormData.organization_name) {
      toast.error("Todos los campos son obligatorios")
      return
    }

    try {
      setCreateOrgLoading(true)
      
      const response = await fetch("/api/organization/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createOrgFormData.email,
          name: createOrgFormData.name,
          lastname: createOrgFormData.lastname,
          organization_name: createOrgFormData.organization_name,
          role: "OWNER"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la organización")
      }

      toast.success(data.data?.message || "Organización creada exitosamente. Se ha enviado una invitación por email.")
      setCreateOrgModalOpen(false)
      setCreateOrgFormData({ 
        email: "", 
        name: "", 
        lastname: "", 
        organization_name: "" 
      })
      
      // Actualizar la lista de organizaciones
      fetchOrganizations()
    } catch (error: any) {
      console.error("Error creating organization:", error)
      toast.error(error.message || "Error al crear la organización")
    } finally {
      setCreateOrgLoading(false)
    }
  }

  // Paginación
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrganizations = filteredOrganizations.slice(startIndex, endIndex)

  const getStateColor = (state: string | null) => {
    switch (state) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800"
      case "ADMIN":
        return "bg-blue-100 text-blue-800"
      case "USER":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">Acceso Denegado</h2>
            <p className="text-gray-500 text-center">
              No tienes permisos para acceder a esta página. Solo los administradores pueden gestionar organizaciones.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Cargando organizaciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Administración de Organizaciones</h1>
            <p className="text-gray-500">
              Gestiona todas las organizaciones del sistema y sus miembros.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {filteredOrganizations.length} organizaciones
            </Badge>
            <Button
              onClick={() => setCreateOrgModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              Crear organización
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, ciudad, país o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de organizaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Organizaciones</CardTitle>
            <CardDescription>
              Lista de todas las organizaciones registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentOrganizations.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron organizaciones</h3>
                <p className="text-gray-500">
                  {searchTerm || stateFilter !== "all" 
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "No hay organizaciones registradas en el sistema"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Organización</th>
                        <th className="text-left py-3 px-4 font-medium">Estado</th>
                        <th className="text-left py-3 px-4 font-medium">Ubicación</th>
                        <th className="text-left py-3 px-4 font-medium">Miembros</th>
                        <th className="text-left py-3 px-4 font-medium">Creada</th>
                        <th className="text-right py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrganizations.map((org) => (
                        <tr key={org.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium">{org.name}</div>
                              {org.contactemail && (
                                <div className="text-sm text-gray-500">{org.contactemail}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStateColor(org.state)}>
                              {org.state || "Sin estado"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              {org.city && org.country ? `${org.city}, ${org.country}` : 
                               org.city || org.country || "No especificada"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{org.memberCount || 0}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-500">
                              {new Date(org.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewMembers(org)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditOrg(org)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteOrg(org)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredOrganizations.length)} de {filteredOrganizations.length} organizaciones
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal para editar organización */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Organización</DialogTitle>
              <DialogDescription>
                Modifica los detalles de la organización seleccionada.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre de la organización"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select
                    value={editFormData.state}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección</label>
                <Input
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Dirección"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad</label>
                  <Input
                    value={editFormData.city}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">País</label>
                  <Input
                    value={editFormData.country}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="País"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email de contacto</label>
                  <Input
                    type="email"
                    value={editFormData.contactemail}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, contactemail: e.target.value }))}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sitio web</label>
                  <Input
                    value={editFormData.website}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://ejemplo.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la organización"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={updateOrganization} className="bg-primary-600 hover:bg-primary-700">
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para gestionar miembros */}
        <Dialog open={membersModalOpen} onOpenChange={setMembersModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Miembros de {selectedOrg?.name}</DialogTitle>
                  <DialogDescription>
                    Gestiona los usuarios asociados a esta organización.
                  </DialogDescription>
                </div>
                <Button
                  onClick={() => setInviteModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar Usuario
                </Button>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden py-4">
              {orgMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Esta organización no tiene miembros.</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {orgMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={`${member.name || "Usuario"}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.name} {member.lastname}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(newRole) => updateUserRole(member.id, newRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">Usuario</SelectItem>
                            <SelectItem value="OWNER">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeUserFromOrg(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setMembersModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para invitar usuario */}
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invitar Usuario
              </DialogTitle>
              <DialogDescription>
                Envía una invitación para que un nuevo usuario se una a {selectedOrg?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={inviteFormData.name}
                  onChange={(e) => setInviteFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del usuario"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Apellido</label>
                <Input
                  value={inviteFormData.lastname}
                  onChange={(e) => setInviteFormData(prev => ({ ...prev, lastname: e.target.value }))}
                  placeholder="Apellido del usuario"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <Select
                  value={inviteFormData.role}
                  onValueChange={(value) => setInviteFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setInviteModalOpen(false)
                  setInviteFormData({ email: "", name: "", lastname: "", role: "USER" })
                }}
                disabled={inviteLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={inviteUser}
                disabled={inviteLoading || !inviteFormData.email}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {inviteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Enviar Invitación
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmación para eliminar organización */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Eliminación
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar la organización <strong>{orgToDelete?.name}</strong>?
                Esta acción cambiará el estado de la organización a "ELIMINADA" y no se mostrará en la lista.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setOrgToDelete(null)
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteOrg}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para crear organización */}
        <Dialog open={createOrgModalOpen} onOpenChange={setCreateOrgModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Crear Nueva Organización
              </DialogTitle>
              <DialogDescription>
                Crea una nueva organización y envía una invitación por email al administrador.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email del Administrador *</label>
                  <Input
                    type="email"
                    value={createOrgFormData.email}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={createOrgFormData.name}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del administrador"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Apellido *</label>
                  <Input
                    value={createOrgFormData.lastname}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, lastname: e.target.value }))}
                    placeholder="Apellido del administrador"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la Organización *</label>
                <Input
                  value={createOrgFormData.organization_name}
                  onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                  placeholder="Nombre de la nueva organización"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setCreateOrgModalOpen(false)
                  setCreateOrgFormData({ 
                    email: "", 
                    name: "", 
                    lastname: "", 
                    organization_name: "" 
                  })
                }}
                disabled={createOrgLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={createOrganization}
                disabled={createOrgLoading || !createOrgFormData.email || 
                         !createOrgFormData.name || !createOrgFormData.lastname || !createOrgFormData.organization_name}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {createOrgLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Building className="h-4 w-4 mr-2" />
                    Crear Organización
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}