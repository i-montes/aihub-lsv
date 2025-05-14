import { createServiceClient } from "./server"
import type { Database } from "../database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

/**
 * Obtiene todos los usuarios de una organización
 */
export async function getOrganizationUsers(organizationId: string): Promise<Profile[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("organizationId", organizationId)
    .order("role", { ascending: false })
    .order("createdAt", { ascending: false })

  if (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }

  return data || []
}

/**
 * Obtiene los datos de usuarios formateados para exportación
 */
export async function getUsersForExport(organizationId: string) {
  const users = await getOrganizationUsers(organizationId)

  // Formatear los datos para exportación
  return users.map((user) => ({
    ID: user.id,
    Nombre: user.name || "",
    Email: user.email || "",
    Rol: user.role || "",
    "Fecha de creación": formatDate(user.createdAt),
    "Último acceso": formatDate(user.lastLogin),
    Estado: user.active ? "Activo" : "Inactivo",
  }))
}

/**
 * Formatea una fecha para exportación
 */
function formatDate(date: string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}
