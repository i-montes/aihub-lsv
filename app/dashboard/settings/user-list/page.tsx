"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent as CardContent2 } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { OrganizationService } from "@/lib/services/organization-service"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function UserListSettingsPage() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [pendingInvitations, setPendingInvitations] = useState([])

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
      EDITOR: "Editor",
      USER: "Usuario",
      VIEWER: "Visualizador",
    }
    return roleMap[role] || role
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lista de Usuarios</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Añadir Usuario</Button>
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
    </div>
  )
}
