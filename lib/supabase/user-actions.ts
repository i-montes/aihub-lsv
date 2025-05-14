"use server"

import { createServerClient } from "./server"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

// Tipo para los datos del usuario
type UserData = {
  id?: string
  name: string
  lastname?: string
  email: string
  role: string
  department?: string
  status: "active" | "inactive"
  organizationId?: string
}

// Cliente con rol de servicio (bypass RLS)
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Faltan variables de entorno para Supabase")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

/**
 * Obtiene todos los usuarios de la organización actual
 */
export async function getOrganizationUsers() {
  const supabase = createServerClient()

  // Obtener el usuario actual para verificar permisos
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // Obtener el perfil del usuario para verificar su rol y organización
  const { data: profile } = await supabase.from("profiles").select("role, organizationId").eq("id", user.id).single()

  if (!profile) return { error: "Perfil no encontrado" }

  // Verificar si el usuario tiene permisos para ver otros usuarios
  if (!["OWNER", "WORKSPACE_ADMIN"].includes(profile.role)) {
    return { error: "No tienes permisos para ver usuarios" }
  }

  // Obtener todos los usuarios de la organización
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("organizationId", profile.organizationId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error al obtener usuarios:", error)
    return { error: error.message }
  }

  return { users }
}

/**
 * Actualiza la información de un usuario
 */
export async function updateUser(userData: UserData) {
  const supabase = createServerClient()
  const serviceClient = getServiceClient()

  // Obtener el usuario actual para verificar permisos
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // Obtener el perfil del usuario para verificar su rol y organización
  const { data: profile } = await supabase.from("profiles").select("role, organizationId").eq("id", user.id).single()

  if (!profile) return { error: "Perfil no encontrado" }

  // Verificar si el usuario tiene permisos para actualizar usuarios
  if (!["OWNER", "WORKSPACE_ADMIN"].includes(profile.role)) {
    return { error: "No tienes permisos para actualizar usuarios" }
  }

  // Verificar que el usuario a actualizar pertenece a la misma organización
  const { data: targetUser } = await supabase.from("profiles").select("organizationId").eq("id", userData.id).single()

  if (!targetUser || targetUser.organizationId !== profile.organizationId) {
    return { error: "No puedes editar usuarios de otra organización" }
  }

  // Actualizar el usuario en la base de datos usando el cliente de servicio para evitar problemas de permisos
  const { error } = await serviceClient
    .from("profiles")
    .update({
      name: userData.name,
      lastname: userData.lastname || null,
      email: userData.email,
      role: userData.role,
      department: userData.department || null,
      status: userData.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userData.id)

  if (error) {
    console.error("Error al actualizar usuario:", error)
    return { error: error.message }
  }

  // Registrar la actividad
  await serviceClient
    .from("activity")
    .insert({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "USER_UPDATED",
      createdAt: new Date().toISOString(),
      details: {
        targetUserId: userData.id,
        changes: {
          name: userData.name,
          role: userData.role,
          status: userData.status,
        },
      },
    })
    .catch(console.error)

  // Revalidar la página para mostrar los cambios
  revalidatePath("/dashboard/settings/users")

  return { success: true }
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(userData: UserData) {
  const supabase = createServerClient()
  const serviceClient = getServiceClient()

  // Obtener el usuario actual para verificar permisos
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // Obtener el perfil del usuario para verificar su rol y organización
  const { data: profile } = await supabase.from("profiles").select("role, organizationId").eq("id", user.id).single()

  if (!profile) return { error: "Perfil no encontrado" }

  // Verificar si el usuario tiene permisos para crear usuarios
  if (!["OWNER", "WORKSPACE_ADMIN"].includes(profile.role)) {
    return { error: "No tienes permisos para crear usuarios" }
  }

  try {
    // Crear el usuario en Auth usando el cliente de servicio
    const { data: newUser, error: authError } = await serviceClient.auth.admin.createUser({
      email: userData.email,
      password: Math.random().toString(36).slice(-8), // Contraseña temporal aleatoria
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        lastname: userData.lastname,
        role: userData.role,
        department: userData.department,
        status: userData.status,
      },
    })

    if (authError || !newUser?.user) {
      console.error("Error al crear usuario en Auth:", authError)
      return { error: authError?.message || "Error al crear usuario" }
    }

    // Crear el perfil del usuario en la tabla personalizada
    const { error: profileError } = await serviceClient.from("profiles").insert({
      id: newUser.user.id,
      name: userData.name,
      lastname: userData.lastname || null,
      email: userData.email,
      role: userData.role,
      department: userData.department || null,
      status: userData.status,
      organizationId: profile.organizationId, // Usar la organización del usuario actual
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error al crear perfil de usuario:", profileError)
      // Si hay error al crear el perfil, eliminar el usuario de Auth
      await serviceClient.auth.admin.deleteUser(newUser.user.id)
      return { error: profileError.message }
    }

    // Registrar la actividad
    await serviceClient
      .from("activity")
      .insert({
        id: crypto.randomUUID(),
        userId: user.id,
        action: "USER_CREATED",
        createdAt: new Date().toISOString(),
        details: {
          newUserId: newUser.user.id,
          email: userData.email,
          role: userData.role,
        },
      })
      .catch(console.error)

    // Revalidar la página para mostrar los cambios
    revalidatePath("/dashboard/settings/users")

    return { success: true, userId: newUser.user.id }
  } catch (error) {
    console.error("Error en el proceso de creación de usuario:", error)
    return {
      error: "Ocurrió un error inesperado durante la creación del usuario. Por favor, inténtalo de nuevo.",
    }
  }
}

/**
 * Elimina un usuario
 */
export async function deleteUser(userId: string) {
  const supabase = createServerClient()
  const serviceClient = getServiceClient()

  // Obtener el usuario actual para verificar permisos
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // Obtener el perfil del usuario para verificar su rol y organización
  const { data: profile } = await supabase.from("profiles").select("role, organizationId").eq("id", user.id).single()

  if (!profile) return { error: "Perfil no encontrado" }

  // Verificar si el usuario tiene permisos para eliminar usuarios
  if (!["OWNER", "WORKSPACE_ADMIN"].includes(profile.role)) {
    return { error: "No tienes permisos para eliminar usuarios" }
  }

  // Verificar que el usuario a eliminar pertenece a la misma organización
  const { data: targetUser } = await supabase.from("profiles").select("organizationId, role").eq("id", userId).single()

  if (!targetUser || targetUser.organizationId !== profile.organizationId) {
    return { error: "No puedes eliminar usuarios de otra organización" }
  }

  // No permitir eliminar al propietario de la organización
  if (targetUser.role === "OWNER") {
    return { error: "No puedes eliminar al propietario de la organización" }
  }

  // Eliminar el usuario de Auth usando el cliente de servicio
  const { error: authError } = await serviceClient.auth.admin.deleteUser(userId)

  if (authError) {
    console.error("Error al eliminar usuario de Auth:", authError)
    return { error: authError.message }
  }

  // Registrar la actividad
  await serviceClient
    .from("activity")
    .insert({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "USER_DELETED",
      createdAt: new Date().toISOString(),
      details: {
        deletedUserId: userId,
      },
    })
    .catch(console.error)

  // Revalidar la página para mostrar los cambios
  revalidatePath("/dashboard/settings/users")

  return { success: true }
}

/**
 * Obtiene los usuarios formateados para exportación
 */
export async function getUsersForExport() {
  const { users, error } = await getOrganizationUsers()

  if (error) {
    return { error }
  }

  // Formatear los datos para exportación
  const formattedUsers = users?.map((user) => ({
    ID: user.id,
    Nombre: user.name || "",
    Apellido: user.lastname || "",
    Email: user.email || "",
    Rol: user.role || "",
    Departamento: user.department || "",
    Estado: user.status === "active" ? "Activo" : "Inactivo",
    "Fecha de creación": user.created_at ? new Date(user.created_at).toLocaleString() : "",
    "Último acceso": user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Nunca",
  }))

  return { users: formattedUsers }
}
