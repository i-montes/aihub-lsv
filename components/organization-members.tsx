"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { UserCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Profile = {
  id: string
  name: string
  lastname: string
  email: string
  avatar: string
  role: "OWNER" | "WORKSPACE_ADMIN" | "USER"
  organizationId: string
}

export function OrganizationMembers() {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true)

        // Primero obtenemos el usuario actual para saber su organización
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("No se pudo obtener el usuario actual")
          setLoading(false)
          return
        }

        // Ahora obtenemos todos los perfiles de la misma organización
        // Las políticas RLS se encargarán de filtrar los resultados
        const { data, error } = await supabase.from("profiles").select("*")

        if (error) {
          console.error("Error al obtener miembros:", error)
          setError("Error al cargar los miembros de la organización")
        } else {
          setMembers(data || [])
        }
      } catch (err) {
        console.error("Error inesperado:", err)
        setError("Ocurrió un error inesperado")
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  // Función para obtener el color de la insignia según el rol
  const getRoleBadgeColor = (role: Profile["role"]) => {
    switch (role) {
      case "OWNER":
        return "bg-coral hover:bg-coral/80"
      case "WORKSPACE_ADMIN":
        return "bg-sidebar hover:bg-sidebar/80"
      default:
        return "bg-gray-500 hover:bg-gray-500/80"
    }
  }

  // Función para obtener el texto del rol en español
  const getRoleText = (role: Profile["role"]) => {
    switch (role) {
      case "OWNER":
        return "Propietario"
      case "WORKSPACE_ADMIN":
        return "Administrador"
      default:
        return "Usuario"
    }
  }

  // Función para obtener las iniciales para el avatar
  const getInitials = (name: string, lastname: string) => {
    return `${name?.charAt(0) || ""}${lastname?.charAt(0) || ""}`.toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-sidebar" />
          Miembros de la Organización
        </CardTitle>
        <CardDescription>Miembros que pertenecen a tu organización</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          // Esqueleto de carga
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Mensaje de error
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>
        ) : members.length === 0 ? (
          // Mensaje cuando no hay miembros
          <div className="text-center py-6 text-gray-500">No se encontraron miembros en tu organización</div>
        ) : (
          // Lista de miembros
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={`${member.name} ${member.lastname}`} />
                    <AvatarFallback>{getInitials(member.name, member.lastname)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.name} {member.lastname}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <Badge className={getRoleBadgeColor(member.role)}>{getRoleText(member.role)}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
