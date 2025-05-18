import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"
import { errorResponse } from "@/app/api/base-handler"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const invitationId = params.id
    if (!invitationId) {
      return errorResponse("ID de invitación no proporcionado", 400)
    }

    // Crear cliente de Supabase con cookies para autenticación
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verificar que el usuario esté autenticado
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return errorResponse("No autorizado", 401)
    }

    // Obtener el perfil del usuario actual para verificar permisos
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError || !currentUserProfile) {
      return errorResponse("Error al obtener el perfil del usuario", 500)
    }

    // Verificar que el usuario tenga permisos (sea ADMIN o OWNER)
    if (currentUserProfile.role !== "ADMIN" && currentUserProfile.role !== "OWNER") {
      return errorResponse("No tienes permisos para cancelar invitaciones", 403)
    }

    // Obtener la información del usuario invitado
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(invitationId)

    if (userError || !user) {
      console.error("Error al obtener usuario:", userError)
      return errorResponse("Usuario no encontrado", 404)
    }

    // Obtener el perfil del usuario invitado para verificar que pertenece a la organización
    const { data: invitedUserProfile, error: invitedProfileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", invitationId)
      .single()

    if (invitedProfileError || !invitedUserProfile) {
      return errorResponse("El usuario no pertenece a esta organización", 404)
    }

    // Verificar que el usuario invitado pertenezca a la misma organización que el usuario actual
    if (invitedUserProfile.organization_id !== currentUserProfile.organization_id) {
      return errorResponse("El usuario no pertenece a tu organización", 403)
    }

    // Eliminar el usuario de Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(invitationId)

    if (deleteAuthError) {
      console.error("Error al eliminar usuario de Auth:", deleteAuthError)
      return errorResponse("Error al cancelar la invitación", 500)
    }

    // Eliminar el perfil del usuario
    const { error: deleteProfileError } = await supabase.from("profiles").delete().eq("id", invitationId)

    if (deleteProfileError) {
      console.error("Error al eliminar perfil:", deleteProfileError)
      // No devolvemos error aquí porque el usuario ya fue eliminado de Auth
      // y la eliminación en cascada debería encargarse del perfil
    }

    return NextResponse.json({
      success: true,
      message: "Invitación cancelada correctamente",
    })
  } catch (error) {
    console.error("Error al cancelar invitación:", error)
    return errorResponse("Error interno del servidor", 500)
  }
}
