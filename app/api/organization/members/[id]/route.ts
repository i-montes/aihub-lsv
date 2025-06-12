import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseRouteHandler, getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

// Manejador para eliminar un miembro de la organización
export const DELETE = createApiHandler(async (req: NextRequest) => {
  try {
    // Obtener el ID del usuario desde la URL
    const url = new URL(req.url)
    const pathSegments = url.pathname.split("/")
    const userId = pathSegments[pathSegments.length - 1]

    if (!userId) {
      return errorResponse("ID de usuario no proporcionado", 400)
    }

    // Obtener el cliente de Supabase con privilegios de servidor
    const supabase = await getSupabaseServer()
    const adminClient = await getSupabaseRouteHandler()

    // Verificar que el usuario actual está autenticado
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return errorResponse("No autenticado", 401)
    }

    // Obtener el perfil del usuario actual para verificar permisos
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role, organizationId")
      .eq("id", currentUser.id)
      .single()

    if (profileError) {
      return errorResponse("Error al obtener el perfil del usuario", 400)
    }

    // Verificar que el usuario tiene permisos de administrador
    if (currentProfile.role !== "ADMIN" && currentProfile.role !== "OWNER") {
      return errorResponse("No tiene permisos para eliminar usuarios", 403)
    }

    // Verificar que el usuario a eliminar pertenece a la misma organización
    const { data: targetProfile, error: targetProfileError } = await supabase
      .from("profiles")
      .select("organizationId, role")
      .eq("id", userId)
      .single()

    if (targetProfileError) {
      return errorResponse("Usuario no encontrado", 404)
    }

    if (targetProfile.organizationId !== currentProfile.organizationId) {
      return errorResponse("El usuario no pertenece a su organización", 403)
    }

    // No permitir eliminar al propietario de la organización
    if (targetProfile.role === "owner") {
      return errorResponse("No se puede eliminar al propietario de la organización", 403)
    }

    // Eliminar el perfil del usuario primero
    const { error: deleteProfileError } = await adminClient.from("profiles").delete().eq("id", userId)

    if (deleteProfileError) {
      return errorResponse(`Error al eliminar el perfil: ${deleteProfileError.message}`, 500)
    }

    // Eliminar el usuario de Auth
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      return errorResponse(`Error al eliminar el usuario: ${deleteUserError.message}`, 500)
    }

    return successResponse({
      message: "Usuario eliminado correctamente",
      userId,
    })
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error)
    return errorResponse(`Error interno del servidor: ${error.message}`, 500)
  }
})
