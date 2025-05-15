"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "../database.types"

export async function changePassword(formData: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const { currentPassword, newPassword } = formData

    if (!currentPassword || !newPassword) {
      return {
        error: "Todos los campos son requeridos",
      }
    }

    const cookieStore = cookies()
    const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })

    // Verificar la sesión actual
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        error: "No hay sesión activa",
      }
    }

    // Verificar la contraseña actual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return {
        error: "La contraseña actual es incorrecta",
      }
    }

    // Cambiar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return {
        error: updateError.message,
      }
    }

    // Registrar la actividad
    try {
      await supabase.from("activity").insert({
        id: crypto.randomUUID(),
        userId: session.user.id,
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
    console.error("Error al cambiar la contraseña:", error)
    return {
      error: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
    }
  }
}
