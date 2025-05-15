"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"
import type { ProfileFormValues } from "../schemas/profile"

// Cliente para acciones del servidor
const getSupabaseAction = () => {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
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

export async function updateUserProfile(values: ProfileFormValues) {
  try {
    const supabase = getSupabaseAction()
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
      email: values.email,
      data: {
        name: values.name,
        lastname: values.lastname,
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
        name: values.name,
        lastname: values.lastname,
        email: values.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      return {
        error: profileError.message,
      }
    }

    // Registrar la actividad
    try {
      await serviceClient.from("activity").insert({
        id: crypto.randomUUID(),
        userId: user.id,
        action: "PROFILE_UPDATED",
        createdAt: new Date().toISOString(),
        details: {
          fields: ["name", "lastname", "email"],
        },
      })
    } catch (activityError) {
      console.error("Error al registrar actividad:", activityError)
      // No bloqueamos el flujo si falla el registro de actividad
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return {
      error: "Ocurrió un error inesperado al actualizar el perfil",
    }
  }
}

export async function getCurrentUserProfile() {
  try {
    const supabase = getSupabaseAction()
    const serviceClient = getServiceClient() // Usar el cliente de servicio

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Usar el cliente de servicio para consultar la tabla profiles
    const { data, error } = await serviceClient.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Error al obtener perfil:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    return null
  }
}
