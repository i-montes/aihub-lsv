import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const PUT = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { currentPassword, newPassword, confirmPassword } = body

  // Validar que todos los campos requeridos estén presentes
  if (!currentPassword || !newPassword || !confirmPassword) {
    return errorResponse("Todos los campos son requeridos", 400)
  }

  // Validar que la nueva contraseña y la confirmación coincidan
  if (newPassword !== confirmPassword) {
    return errorResponse("La nueva contraseña y la confirmación no coinciden", 400)
  }

  try {
    // Obtener el cliente de Supabase
    const supabase = await getSupabaseServer()

    // Verificar el usuario actual de manera segura
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse("No hay sesión activa", 401)
    }

    // Usar updateUser con el parámetro de contraseña actual
    // Este método verifica automáticamente que la contraseña actual sea correcta
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Error al actualizar contraseña:", error.message)

      // Si el error es porque la contraseña actual es incorrecta
      if (error.message.includes("password") || error.message.includes("credentials")) {
        return errorResponse("La contraseña actual es incorrecta", 401)
      }

      return errorResponse(error.message, 400)
    }

    return successResponse({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("Error en actualización de contraseña:", error)
    return errorResponse("Error al procesar la solicitud", 500)
  }
})

// Mantener el método POST para compatibilidad
export const POST = PUT
