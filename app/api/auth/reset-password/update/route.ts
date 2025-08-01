import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const PUT = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { newPassword, confirmPassword, code } = body

  // Validar que todos los campos requeridos estén presentes
  if (!newPassword || !confirmPassword || !code) {
    return errorResponse("Todos los campos son requeridos", 400)
  }

  // Validar que la nueva contraseña y la confirmación coincidan
  if (newPassword !== confirmPassword) {
    return errorResponse("La nueva contraseña y la confirmación no coinciden", 400)
  }

  try {
    // Obtener el cliente de Supabase
    const supabase = await getSupabaseServer()

    // Intercambiar el código por una sesión
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Error al intercambiar código por sesión:", sessionError.message)
      return errorResponse("Código de verificación inválido o expirado", 400)
    }

    if (!sessionData.session) {
      return errorResponse("No se pudo establecer la sesión", 400)
    }

    // Ahora que tenemos una sesión válida, actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error("Error al actualizar contraseña:", updateError.message)
      return errorResponse(updateError.message, 400)
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
