import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

// Determine cookie names dynamically using the Supabase project ref
const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").split(".")[0]
const accessTokenCookie = projectRef ? `sb-${projectRef}-auth-token` : "sb-access-token"
const refreshTokenCookie = projectRef ? `sb-${projectRef}-refresh-token` : "sb-refresh-token"

export const POST = createApiHandler(async (req: NextRequest) => {
  try {
    const supabase = getSupabaseServer()

    // Verificar si hay un usuario activo antes de intentar cerrar sesión
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Si no hay usuario, simplemente limpiar las cookies y retornar éxito
      const cookieStore = cookies()
      cookieStore.delete(accessTokenCookie)
      cookieStore.delete(refreshTokenCookie)

      return successResponse({ success: true, message: "No active session" })
    }

    // Intentar cerrar la sesión
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Supabase signOut error:", error)
      // Incluso si hay un error, intentar limpiar las cookies
      const cookieStore = cookies()
      cookieStore.delete(accessTokenCookie)
      cookieStore.delete(refreshTokenCookie)

      return errorResponse(`Error al cerrar sesión: ${error.message}`, 400)
    }

    // Limpiar las cookies manualmente para asegurar que se eliminen
    const cookieStore = cookies()
    cookieStore.delete(accessTokenCookie)
    cookieStore.delete(refreshTokenCookie)

    return successResponse({ success: true, message: "Sesión cerrada exitosamente" })
  } catch (error: any) {
    console.error("Logout route error:", error)

    // En caso de cualquier error, intentar limpiar las cookies
    try {
      const cookieStore = cookies()
      cookieStore.delete(accessTokenCookie)
      cookieStore.delete(refreshTokenCookie)
    } catch (cookieError) {
      console.error("Error clearing cookies:", cookieError)
    }

    return errorResponse(error.message || "Error interno del servidor al cerrar sesión", 500)
  }
})
