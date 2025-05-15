"use server"

import { createServerClient } from "./server"
import { getServiceClient } from "./db"

export async function getOrganizationMembers(organizationId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, lastname, email, avatar, role, created_at")
    .eq("organizationId", organizationId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching organization members:", error)
    return []
  }

  return data || []
}

export async function updateOrganization(organizationId: string, name: string) {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from("organization")
    .update({
      name,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", organizationId)

  if (error) {
    console.error("Error updating organization:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function inviteUserToOrganization(email: string, organizationId: string, role: string) {
  // Esta función simula el envío de una invitación por correo electrónico
  // En una implementación real, enviarías un correo electrónico con un enlace de invitación

  const serviceClient = getServiceClient()

  // Registrar la invitación en la base de datos
  const { error } = await serviceClient.from("invitations").insert({
    id: crypto.randomUUID(),
    email,
    organizationId,
    role,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
  })

  if (error) {
    console.error("Error creating invitation:", error)
    return { error: error.message }
  }

  // Aquí iría la lógica para enviar el correo electrónico

  return { success: true }
}

export async function removeUserFromOrganization(userId: string, organizationId: string) {
  const serviceClient = getServiceClient()

  // Verificar que el usuario no sea el propietario de la organización
  const { data: user, error: userError } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .eq("organizationId", organizationId)
    .single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return { error: userError.message }
  }

  if (user.role === "OWNER") {
    return { error: "No puedes eliminar al propietario de la organización" }
  }

  // Actualizar el perfil del usuario para desvincularlo de la organización
  const { error } = await serviceClient
    .from("profiles")
    .update({
      organizationId: null,
      role: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("organizationId", organizationId)

  if (error) {
    console.error("Error removing user from organization:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function removeOrganizationMember(userId: string, organizationId: string) {
  return removeUserFromOrganization(userId, organizationId)
}

export async function updateUserRole(userId: string, organizationId: string, role: string) {
  const serviceClient = getServiceClient()

  // Verificar que no estemos cambiando el rol del propietario
  if (role !== "OWNER") {
    const { data: owners, error: ownersError } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("organizationId", organizationId)
      .eq("role", "OWNER")

    if (ownersError) {
      console.error("Error fetching owners:", ownersError)
      return { error: ownersError.message }
    }

    // Si el usuario es el único propietario, no permitir cambiar su rol
    if (owners.length === 1 && owners[0].id === userId) {
      return { error: "La organización debe tener al menos un propietario" }
    }
  }

  // Actualizar el rol del usuario
  const { error } = await serviceClient
    .from("profiles")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("organizationId", organizationId)

  if (error) {
    console.error("Error updating user role:", error)
    return { error: error.message }
  }

  return { success: true }
}
