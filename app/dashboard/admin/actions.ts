"use server"

import { createServiceClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/supabase/server"
import { logActivity } from "@/lib/supabase/db"
import { revalidatePath } from "next/cache"

// Acción para añadir un nuevo usuario
export async function addUser(userData: {
  name: string
  lastname: string
  email: string
  role: string
}) {
  try {
    const currentUser = await getServerUser()

    if (!currentUser) {
      return { error: "No estás autenticado" }
    }

    if (!["OWNER", "WORKSPACE_ADMIN"].includes(currentUser.role)) {
      return { error: "No tienes permisos para realizar esta acción" }
    }

    const supabase = createServiceClient()

    // Generar una contraseña temporal
    const tempPassword = generateRandomPassword()

    // 1. Crear el usuario en Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        lastname: userData.lastname,
        role: userData.role,
      },
    })

    if (authError || !user) {
      return { error: authError?.message || "Error al crear el usuario" }
    }

    // 2. Crear el perfil del usuario
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: userData.email,
      name: userData.name,
      lastname: userData.lastname,
      role: userData.role,
      organizationId: currentUser.organizationId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      // Si hay un error al crear el perfil, eliminamos el usuario de Auth
      await supabase.auth.admin.deleteUser(user.id)
      return { error: "Error al crear el perfil del usuario: " + profileError.message }
    }

    // 3. Registrar la actividad
    await logActivity(currentUser.id, "USER_ADDED", {
      addedUserId: user.id,
      addedUserEmail: userData.email,
    })

    // 4. Enviar email de invitación con la contraseña temporal
    // Aquí se implementaría el envío de email (no incluido en este ejemplo)

    revalidatePath("/dashboard/admin")

    return { success: true, tempPassword }
  } catch (error) {
    console.error("Error al añadir usuario:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}

// Acción para actualizar un usuario existente
export async function updateUser(userData: {
  id: string
  name: string
  lastname: string
  email: string
  role: string
}) {
  try {
    const currentUser = await getServerUser()

    if (!currentUser) {
      return { error: "No estás autenticado" }
    }

    if (!["OWNER", "WORKSPACE_ADMIN"].includes(currentUser.role)) {
      return { error: "No tienes permisos para realizar esta acción" }
    }

    const supabase = createServiceClient()

    // 1. Actualizar los datos en Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userData.id, {
      email: userData.email,
      user_metadata: {
        name: userData.name,
        lastname: userData.lastname,
        role: userData.role,
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    // 2. Actualizar el perfil en la tabla personalizada
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        email: userData.email,
        name: userData.name,
        lastname: userData.lastname,
        role: userData.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.id)

    if (profileError) {
      return { error: profileError.message }
    }

    // 3. Registrar la actividad
    await logActivity(currentUser.id, "USER_UPDATED", {
      updatedUserId: userData.id,
      updatedUserEmail: userData.email,
    })

    revalidatePath("/dashboard/admin")

    return { success: true }
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}

// Acción para eliminar un usuario
export async function deleteUser(userId: string) {
  try {
    const currentUser = await getServerUser()

    if (!currentUser) {
      return { error: "No estás autenticado" }
    }

    if (!["OWNER", "WORKSPACE_ADMIN"].includes(currentUser.role)) {
      return { error: "No tienes permisos para realizar esta acción" }
    }

    // No permitir eliminar al propio usuario
    if (userId === currentUser.id) {
      return { error: "No puedes eliminarte a ti mismo" }
    }

    const supabase = createServiceClient()

    // 1. Obtener información del usuario antes de eliminarlo
    const { data: userData } = await supabase.from("profiles").select("email, role").eq("id", userId).single()

    // 2. Eliminar el perfil de la tabla personalizada
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

    if (profileError) {
      return { error: profileError.message }
    }

    // 3. Eliminar el usuario de Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      return { error: authError.message }
    }

    // 4. Registrar la actividad
    await logActivity(currentUser.id, "USER_DELETED", {
      deletedUserId: userId,
      deletedUserEmail: userData?.email,
    })

    revalidatePath("/dashboard/admin")

    return { success: true }
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}

// Función auxiliar para generar una contraseña aleatoria
function generateRandomPassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-="
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}
