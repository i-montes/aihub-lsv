import { createServiceClient } from "./server"
import type { Database } from "../database.types"

type Organization = Database["public"]["Tables"]["organization"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Obtener una organización por ID
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from("organization").select("*").eq("id", id).single()

  if (error) {
    console.error("Error al obtener la organización:", error)
    return null
  }

  return data
}

// Obtener todos los miembros de una organización
export async function getOrganizationMembers(organizationId: string): Promise<Profile[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("organizationId", organizationId)
    .order("role", { ascending: false }) // Ordenar por rol (OWNER primero)

  if (error) {
    console.error("Error al obtener los miembros de la organización:", error)
    return []
  }

  return data
}

// Actualizar una organización
export async function updateOrganization(
  id: string,
  updates: Partial<Database["public"]["Tables"]["organization"]["Update"]>,
): Promise<Organization | null> {
  const supabase = createServiceClient()

  // Asegurarse de que updatedAt esté actualizado
  const updatesWithTimestamp = {
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("organization")
    .update(updatesWithTimestamp)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar la organización:", error)
    return null
  }

  return data
}

// Invitar a un usuario a una organización
export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: Database["public"]["Enums"]["role"] = "USER",
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  // Verificar si el usuario ya existe
  const { data: existingUser } = await supabase.from("profiles").select("id, email").eq("email", email).single()

  if (existingUser) {
    // Si el usuario ya existe, verificar si ya está en la organización
    const { data: existingMember } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", existingUser.id)
      .eq("organizationId", organizationId)
      .single()

    if (existingMember) {
      return { success: false, error: "El usuario ya es miembro de esta organización" }
    }

    // Actualizar el perfil del usuario para añadirlo a la organización
    const { error } = await supabase.from("profiles").update({ organizationId, role }).eq("id", existingUser.id)

    if (error) {
      return { success: false, error: "Error al añadir el usuario a la organización" }
    }

    return { success: true }
  } else {
    // TODO: Implementar lógica para invitar a un usuario que no existe
    // Esto requeriría enviar un email con un enlace de invitación
    return {
      success: false,
      error: "La invitación a usuarios que no existen aún no está implementada",
    }
  }
}

// Eliminar un miembro de la organización
export async function removeOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  // Verificar que el usuario no sea el propietario
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .eq("organizationId", organizationId)
    .single()

  if (!userProfile) {
    return { success: false, error: "El usuario no es miembro de esta organización" }
  }

  if (userProfile.role === "OWNER") {
    return { success: false, error: "No se puede eliminar al propietario de la organización" }
  }

  // Eliminar al usuario de la organización (establecer organizationId a null)
  const { error } = await supabase
    .from("profiles")
    .update({ organizationId: null })
    .eq("id", userId)
    .eq("organizationId", organizationId)

  if (error) {
    return { success: false, error: "Error al eliminar el miembro de la organización" }
  }

  return { success: true }
}
