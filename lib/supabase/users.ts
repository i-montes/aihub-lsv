"use server"
import { getServiceClient } from "./db"

export async function getAllUsers() {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, name, lastname, email, avatar, role, organizationId, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data || []
}

export async function getUserById(userId: string) {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, name, lastname, email, avatar, role, organizationId, created_at")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function getUsersByOrganization(organizationId: string) {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, name, lastname, email, avatar, role, created_at")
    .eq("organizationId", organizationId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching organization users:", error)
    return []
  }

  return data || []
}

export async function updateUserProfile(
  userId: string,
  { name, lastname, email }: { name: string; lastname: string; email: string },
) {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from("profiles")
    .update({
      name,
      lastname,
      email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Error updating user profile:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteUser(userId: string) {
  const serviceClient = getServiceClient()

  // Verificar que el usuario no sea el propietario de una organización
  const { data: user, error: userError } = await serviceClient
    .from("profiles")
    .select("role, organizationId")
    .eq("id", userId)
    .single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return { error: userError.message }
  }

  if (user.role === "OWNER") {
    // Verificar si hay más propietarios en la organización
    const { data: owners, error: ownersError } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("organizationId", user.organizationId)
      .eq("role", "OWNER")

    if (ownersError) {
      console.error("Error fetching owners:", ownersError)
      return { error: ownersError.message }
    }

    if (owners.length === 1) {
      return { error: "No puedes eliminar al único propietario de una organización" }
    }
  }

  // Eliminar el usuario de Auth
  const { error: authError } = await serviceClient.auth.admin.deleteUser(userId)

  if (authError) {
    console.error("Error deleting user from Auth:", authError)
    return { error: authError.message }
  }

  // Eliminar el perfil del usuario
  const { error } = await serviceClient.from("profiles").delete().eq("id", userId)

  if (error) {
    console.error("Error deleting user profile:", error)
    return { error: error.message }
  }

  return { success: true }
}
