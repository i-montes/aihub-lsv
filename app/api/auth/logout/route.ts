import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export const POST = createApiHandler(async (req: NextRequest) => {
  try {
    const supabase = getSupabaseServer()

    // Verificar si hay una sesión activa antes de intentar cerrarla
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // Si no hay sesión, simplemente limpiar las cookies y retornar éxito
      const cookieStore = cookies()
      cookieStore.delete("sb-access-token")
      cookieStore.delete("sb-refresh-token")

      return successResponse({ success: true, message: "No active session" })
    }

    // Intentar cerrar la sesión
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Supabase signOut error:", error)
      // Incluso si hay un error, intentar limpiar las cookies
      const cookieStore = cookies()
      cookieStore.delete("sb-access-token")
      cookieStore.delete("sb-refresh-token")

      return errorResponse(`Error al cerrar sesión: ${error.message}`, 400)
    }

    // Limpiar las cookies manualmente para asegurar que se eliminen
    const cookieStore = cookies()
    cookieStore.delete("sb-access-token")
    cookieStore.delete("sb-refresh-token")

    return successResponse({ success: true, message: "Sesión cerrada exitosamente" })
  } catch (error: any) {
    console.error("Logout route error:", error)

    // En caso de cualquier error, intentar limpiar las cookies
    try {
      const cookieStore = cookies()
      cookieStore.delete("sb-access-token")
      cookieStore.delete("sb-refresh-token")
    } catch (cookieError) {
      console.error("Error clearing cookies:", cookieError)
    }

    return errorResponse(error.message || "Error interno del servidor al cerrar sesión", 500)
  }
})
