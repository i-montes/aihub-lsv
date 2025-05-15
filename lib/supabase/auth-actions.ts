"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import type { Database } from "../database.types"
import { createServerClient } from "./server"

// Cliente para acciones del servidor - con manejo explícito de cookies
const getSupabaseAction = () => {
  return createServerActionClient<Database>({ cookies })
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

// Iniciar sesión con email y contraseña
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectUrl = (formData.get("redirectUrl") as string) || "/dashboard"

  if (!email || !password) {
    return {
      error: "Email y contraseña son requeridos",
    }
  }

  const supabase = await getSupabaseAction()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  // Asegurarnos de que la sesión se ha establecido antes de redirigir
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // Usar return redirect en lugar de redirect directamente
    return { redirect: redirectUrl }
  }

  return { success: true }
}

// Registrar un nuevo usuario y crear su organización
export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const lastname = formData.get("lastname") as string
  const redirectUrl = (formData.get("redirectUrl") as string) || "/dashboard"

  if (!email || !password) {
    return {
      error: "Email y contraseña son requeridos",
    }
  }

  // Usamos el cliente normal para la autenticación - ahora con await
  const supabase = await getSupabaseAction()

  // Y el cliente de servicio para operaciones en la base de datos
  const serviceClient = getServiceClient()

  try {
    // 1. Registrar el usuario en Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          lastname,
          role: "OWNER",
        },
      },
    })

    if (authError || !user) {
      return {
        error: authError?.message || "Error al crear el usuario",
      }
    }

    // 2. Crear una organización para el usuario usando el cliente de servicio
    const organizationName = `${name || email.split("@")[0]}`

    // Generar un ID para la organización
    const organizationId = crypto.randomUUID()

    const { error: orgError } = await serviceClient.from("organization").insert({
      id: organizationId, // Especificar el ID explícitamente
      name: `${organizationName}'s Workspace`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    if (orgError) {
      // Si hay un error al crear la organización, eliminamos el usuario de Auth
      await serviceClient.auth.admin.deleteUser(user.id)
      return {
        error: "Error al crear la organización: " + orgError.message,
      }
    }

    // 3. Crear o actualizar el perfil del usuario vinculado a la organización (UPSERT)
    const { error: profileError } = await serviceClient.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      name,
      lastname,
      avatar: `https://api.dicebear.com/9.x/bottts/jpg?seed=${user.id}`,
      role: "OWNER", // El usuario es propietario de su organización
      organizationId: organizationId, // Usar el mismo ID que usamos para crear la organización
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      // Si hay un error al crear el perfil, eliminamos el usuario y la organización
      await serviceClient.from("organization").delete().eq("id", organizationId)
      await serviceClient.auth.admin.deleteUser(user.id)
      return {
        error: "Error al crear el perfil del usuario: " + profileError.message,
      }
    }

    // 4. Registrar la actividad de creación de cuenta
    try {
      await serviceClient.from("activity").insert({
        id: crypto.randomUUID(),
        userId: user.id,
        action: "ACCOUNT_CREATED",
        createdAt: new Date().toISOString(),
        details: {
          organizationId,
          email,
        },
      })
    } catch (activityError) {
      console.error("Error al registrar actividad:", activityError)
      // No bloqueamos el flujo si falla el registro de actividad
    }

    // 5. Crear o actualizar preferencias de usuario por defecto (UPSERT)
    try {
      await serviceClient.from("user_preference").upsert(
        {
          id: crypto.randomUUID(),
          userId: user.id,
          theme: "light",
          language: "es",
          emailNotifications: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          onConflict: "userId",
          ignoreDuplicates: false,
        },
      )
    } catch (prefError) {
      console.error("Error al crear preferencias:", prefError)
      // No bloqueamos el flujo si falla la creación de preferencias
    }

    return { success: true }
  } catch (error) {
    console.error("Error en el proceso de registro:", error)
    return {
      error: "Ocurrió un error inesperado durante el registro. Por favor, inténtalo de nuevo.",
    }
  }
}

// Cerrar sesión
export async function signOut() {
  const supabase = await getSupabaseAction()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

// Solicitar restablecimiento de contraseña
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return {
      error: "El correo electrónico es requerido",
    }
  }

  const supabase = await getSupabaseAction()

  // URL de redirección después de hacer clic en el enlace del correo
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  return {
    success: true,
  }
}

// Establecer nueva contraseña
export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string

  if (!password) {
    return {
      error: "La nueva contraseña es requerida",
    }
  }

  const supabase = await getSupabaseAction()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  return {
    success: true,
  }
}

// Actualizar perfil de usuario
export async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string
  const lastname = formData.get("lastname") as string
  const avatar = formData.get("avatar") as string

  const supabase = await getSupabaseAction()
  const serviceClient = getServiceClient()

  // Obtener el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: "Usuario no autenticado",
    }
  }

  // Actualizar los datos en Auth
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      name,
      lastname,
    },
  })

  if (authError) {
    return {
      error: authError.message,
    }
  }

  // Actualizar el perfil en la tabla personalizada usando el cliente de servicio
  const { error: profileError } = await serviceClient
    .from("profiles")
    .update({
      name,
      lastname,
      avatar,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (profileError) {
    return {
      error: profileError.message,
    }
  }

  return {
    success: true,
  }
}

/**
 * Obtiene el usuario actual
 */
export async function getCurrentUser() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return data
}

/**
 * Obtiene la organización del usuario actual
 */
export async function getCurrentUserOrganization() {
  const user = await getCurrentUser()

  if (!user || !user.organizationId) return null

  const supabase = await createServerClient()

  const { data } = await supabase.from("organization").select("*").eq("id", user.organizationId).single()

  return data
}

/**
 * Reenvía el correo de confirmación al usuario
 */
export async function resendConfirmationEmail(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return {
      error: "El correo electrónico es obligatorio",
    }
  }

  try {
    const supabase = await getSupabaseAction()

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })

    if (error) {
      return {
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error al reenviar el correo de confirmación:", error)
    return {
      error: "Ocurrió un error al reenviar el correo de confirmación",
    }
  }
}
