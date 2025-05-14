"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserPlus } from "lucide-react"
import { removeOrganizationMember } from "@/lib/supabase/organization"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface MembersTableProps {
  members: Profile[]
}

export function MembersTable({ members }: MembersTableProps) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const getInitials = (name?: string | null, lastname?: string | null) => {
    if (!name && !lastname) return "U"
    return `${name?.[0] || ""}${lastname?.[0] || ""}`.toUpperCase()
  }

  const getRoleName = (role: Database["public"]["Enums"]["role"]) => {
    switch (role) {
      case "OWNER":
        return "Propietario"
      case "WORKSPACE_ADMIN":
        return "Administrador"
      case "USER":
        return "Usuario"
      default:
        return role
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar a este miembro?")) {
      return
    }

    setIsRemoving(userId)

    try {
      // Asumimos que todos los miembros pertenecen a la misma organización
      const organizationId = members[0].organizationId

      if (!organizationId) {
        alert("No se pudo determinar la organización")
        return
      }

      const result = await removeOrganizationMember(organizationId, userId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "No se pudo eliminar al miembro")
      }
    } catch (error) {
      console.error("Error al eliminar miembro:", error)
      alert("Ocurrió un error al eliminar al miembro")
    } finally {
      setIsRemoving(null)
    }
  }

  const handleInviteMember = () => {
    // Implementar en el futuro
    alert("Funcionalidad de invitación en desarrollo")
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleInviteMember}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar miembro
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar || undefined} alt={member.name || ""} />
                  <AvatarFallback>{getInitials(member.name, member.lastname)}</AvatarFallback>
                </Avatar>
                <span>
                  {member.name} {member.lastname}
                </span>
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{getRoleName(member.role)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role !== "OWNER" && (
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isRemoving === member.id}
                        className="text-red-600"
                      >
                        {isRemoving === member.id ? "Eliminando..." : "Eliminar"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {members.length === 0 && (
        <div className="text-center py-4 text-gray-500">No hay miembros en esta organización</div>
      )}
    </div>
  )
}
