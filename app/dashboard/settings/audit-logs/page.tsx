"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import { Filter, RefreshCw, Download, Eye, Clock, User, Activity, FileText, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function AuditLogsPage() {
  const { user, profile, isLoading } = useAuth()
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState({})
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    entityType: "",
    fromDate: "",
    toDate: "",
  })
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    total: 0,
  })

  // Verificar si el usuario tiene permisos de administrador
  const isAdmin = profile?.role === "OWNER" || profile?.role === "WORKSPACE_ADMIN"

  useEffect(() => {
    if (isAdmin) {
      fetchLogs()
    }
  }, [isAdmin, pagination.offset, pagination.limit])

  const fetchLogs = async () => {
    setIsLoadingLogs(true)
    try {
      // Construir la URL con los filtros
      let url = `/api/admin/audit-logs?offset=${pagination.offset}&limit=${pagination.limit}`

      if (filters.userId) url += `&userId=${filters.userId}`
      if (filters.action) url += `&action=${filters.action}`
      if (filters.entityType) url += `&entityType=${filters.entityType}`
      if (filters.fromDate) url += `&fromDate=${filters.fromDate}`
      if (filters.toDate) url += `&toDate=${filters.toDate}`

      const response = await api.get(url)

      if (response.data) {
        setLogs(response.data.logs || [])
        setUsers(response.data.users || {})
        setPagination({
          ...pagination,
          total: response.data.pagination?.total || 0,
        })
      }
    } catch (error) {
      console.error("Error al obtener registros de auditoría:", error)
      toast.error("Error al cargar los registros de auditoría")
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const applyFilters = () => {
    setPagination({
      ...pagination,
      offset: 0, // Reiniciar a la primera página
    })
    fetchLogs()
  }

  const resetFilters = () => {
    setFilters({
      userId: "",
      action: "",
      entityType: "",
      fromDate: "",
      toDate: "",
    })
    setPagination({
      ...pagination,
      offset: 0,
    })
    fetchLogs()
  }

  const handlePageChange = (newOffset) => {
    setPagination({
      ...pagination,
      offset: newOffset,
    })
  }

  const exportToCSV = () => {
    // Implementación básica de exportación a CSV
    const headers = ["Fecha", "Usuario", "Acción", "Tipo de Entidad", "ID de Entidad", "Detalles", "Dirección IP"]

    const csvRows = [
      headers.join(","),
      ...logs.map((log) => {
        const user = log.user_id ? users[log.user_id]?.name || log.user_id : "Sistema"
        const date = new Date(log.created_at).toLocaleString()
        const details = JSON.stringify(log.details || {}).replace(/"/g, '""')

        return [
          `"${date}"`,
          `"${user}"`,
          `"${log.action}"`,
          `"${log.entity_type || ""}"`,
          `"${log.entity_id || ""}"`,
          `"${details}"`,
          `"${log.ip_address || ""}"`,
        ].join(",")
      }),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `audit-logs-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const viewLogDetails = (logId) => {
    // Implementar visualización de detalles (podría ser un modal o una nueva página)
    toast.info(`Ver detalles del registro ${logId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Card className="bg-white rounded-3xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-gray-500 mb-6">
              No tienes permisos para acceder a los registros de auditoría. Esta sección está reservada para
              administradores.
            </p>
            <Button onClick={() => window.history.back()}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardHeader>
        <CardTitle>Registros de Auditoría</CardTitle>
        <CardDescription>Visualiza y filtra las acciones administrativas realizadas en el sistema</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filtros */}
        <div className="bg-gray-50 p-4 rounded-xl mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-medium">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="action">Acción</Label>
              <Input
                id="action"
                placeholder="Ej: user.create"
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Tipo de Entidad</Label>
              <Select value={filters.entityType} onValueChange={(value) => handleFilterChange("entityType", value)}>
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="profile">Perfil</SelectItem>
                  <SelectItem value="organization">Organización</SelectItem>
                  <SelectItem value="content">Contenido</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="settings">Configuración</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">Usuario</Label>
              <Input
                id="userId"
                placeholder="ID de usuario"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">Desde</Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">Hasta</Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetFilters}>
              Limpiar
            </Button>
            <Button onClick={applyFilters}>Aplicar Filtros</Button>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {isLoadingLogs ? (
              <span className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Cargando...
              </span>
            ) : (
              <span>Mostrando {logs.length} registros</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-1" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Tabla de registros */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entidad
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {isLoadingLogs ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sidebar"></div>
                      </div>
                    ) : (
                      "No se encontraron registros de auditoría"
                    )}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const user = log.user_id ? users[log.user_id]?.name || log.user_id : "Sistema"
                  const date = new Date(log.created_at)

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {format(date, "dd MMM yyyy", { locale: es })}
                            </div>
                            <div className="text-xs text-gray-500">{format(date, "HH:mm:ss", { locale: es })}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-gray-900">{log.entity_type || "-"}</div>
                            {log.entity_id && <div className="text-xs text-gray-500">{log.entity_id}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewLogDetails(log.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
            disabled={pagination.offset === 0 || isLoadingLogs}
          >
            Anterior
          </Button>

          <span className="text-sm text-gray-500">Página {Math.floor(pagination.offset / pagination.limit) + 1}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.offset + pagination.limit)}
            disabled={logs.length < pagination.limit || isLoadingLogs}
          >
            Siguiente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
