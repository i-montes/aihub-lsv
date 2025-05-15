"use server"
import { getServiceClient } from "./db"

export async function exportUsers() {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, name, lastname, email, role, created_at, updated_at, organizationId")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error exporting users:", error)
    return { error: error.message }
  }

  return { success: true, data }
}

export async function getUsersForExport() {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, name, lastname, email, role, created_at, updated_at, organizationId")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users for export:", error)
    return []
  }

  return data || []
}

export async function getOrganizationUsers(organizationId: string) {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, name, lastname, email, role, created_at, updated_at, avatar")
    .eq("organizationId", organizationId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching organization users:", error)
    return []
  }

  return data || []
}

export async function createUser({
  email,
  name,
  lastname,
  role,
  organizationId,
}: {
  email: string
  name: string
  lastname: string
  role: string
  organizationId: string
}) {
  const serviceClient = getServiceClient()

  // Generar una contraseña temporal
  const temporaryPassword = Math.random().toString(36).slice(-8)

  // Crear el usuario en Auth
  const { data, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      name,
      lastname,
      role,
    },
  })

  if (authError || !data.user) {
    console.error("Error creating user in Auth:", authError)
    return { error: authError?.message || "Error al crear el usuario" }
  }

  // Crear el perfil del usuario
  const { error: profileError } = await serviceClient.from("profiles").insert({
    id: data.user.id,
    email,
    name,
    lastname,
    role,
    organizationId,
    avatar: `https://api.dicebear.com/9.x/bottts/jpg?seed=${data.user.id}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    // Si hay un error al crear el perfil, eliminamos el usuario de Auth
    await serviceClient.auth.admin.deleteUser(data.user.id)
    console.error("Error creating user profile:", profileError)
    return { error: profileError.message }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId: data.user.id,
      action: "USER_CREATED",
      createdAt: new Date().toISOString(),
      details: {
        createdBy: "ADMIN",
        email,
        role,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return {
    success: true,
    user: {
      id: data.user.id,
      email,
      name,
      lastname,
      role,
      temporaryPassword,
    },
  }
}

export async function updateUser({
  userId,
  name,
  lastname,
  email,
  role,
}: {
  userId: string
  name?: string
  lastname?: string
  email?: string
  role?: string
}) {
  const serviceClient = getServiceClient()

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (name) updates.name = name
  if (lastname) updates.lastname = lastname
  if (email) updates.email = email
  if (role) updates.role = role

  // Actualizar el perfil del usuario
  const { error: profileError } = await serviceClient.from("profiles").update(updates).eq("id", userId)

  if (profileError) {
    console.error("Error updating user profile:", profileError)
    return { error: profileError.message }
  }

  // Actualizar los metadatos del usuario en Auth si es necesario
  if (name || lastname || role) {
    const metadata: Record<string, any> = {}
    if (name) metadata.name = name
    if (lastname) metadata.lastname = lastname
    if (role) metadata.role = role

    const { error: authError } = await serviceClient.auth.admin.updateUserById(userId, {
      email,
      user_metadata: metadata,
    })

    if (authError) {
      console.error("Error updating user in Auth:", authError)
      return { error: authError.message }
    }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId,
      action: "USER_UPDATED",
      createdAt: new Date().toISOString(),
      details: {
        updatedFields: Object.keys(updates).filter((key) => key !== "updated_at"),
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true }
}

export async function updateUserRole(userId: string, role: string) {
  const serviceClient = getServiceClient()

  // Actualizar el rol en el perfil
  const { error: profileError } = await serviceClient
    .from("profiles")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (profileError) {
    console.error("Error updating user role in profile:", profileError)
    return { error: profileError.message }
  }

  // Actualizar los metadatos del usuario en Auth
  const { error: authError } = await serviceClient.auth.admin.updateUserById(userId, {
    user_metadata: {
      role,
    },
  })

  if (authError) {
    console.error("Error updating user metadata in Auth:", authError)
    return { error: authError.message }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId,
      action: "ROLE_UPDATED",
      createdAt: new Date().toISOString(),
      details: {
        newRole: role,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true }
}

export async function deleteUser(userId: string) {
  const serviceClient = getServiceClient()

  // Eliminar el usuario de Auth
  const { error: authError } = await serviceClient.auth.admin.deleteUser(userId)

  if (authError) {
    console.error("Error deleting user from Auth:", authError)
    return { error: authError.message }
  }

  // Eliminar el perfil del usuario
  const { error: profileError } = await serviceClient.from("profiles").delete().eq("id", userId)

  if (profileError) {
    console.error("Error deleting user profile:", profileError)
    return { error: profileError.message }
  }

  // Registrar la actividad (con un usuario de sistema ya que el usuario fue eliminado)
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId: "system",
      action: "USER_DELETED",
      createdAt: new Date().toISOString(),
      details: {
        deletedUserId: userId,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true }
}

export async function deleteUserAccount(userId: string) {
  return deleteUser(userId)
}
