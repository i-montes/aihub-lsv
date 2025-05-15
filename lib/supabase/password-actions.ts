"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

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

export async function changePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const supabase = getSupabaseAction()
    const serviceClient = getServiceClient()

    // 1. Obtener el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        error: "Usuario no autenticado",
      }
    }

    // 2. Verificar la contraseña actual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return {
        error: "La contraseña actual es incorrecta",
      }
    }

    // 3. Actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return {
        error: updateError.message,
      }
    }

    // 4. Registrar la actividad
    try {
      await serviceClient.from("activity").insert({
        id: crypto.randomUUID(),
        userId: user.id,
        action: "PASSWORD_CHANGED",
        createdAt: new Date().toISOString(),
        details: {
          timestamp: new Date().toISOString(),
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
    console.error("Error al cambiar contraseña:", error)
    return {
      error: "Ocurrió un error inesperado al cambiar la contraseña",
    }
  }
}
