import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"
import { errorResponse } from "@/app/api/base-handler"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const invitationId = await params.then((p) => p.id)
    if (!invitationId) {
      return errorResponse("ID de invitación no proporcionado", 400)
    }

    // Crear cliente de Supabase con cookies para autenticación
    const supabase = await getSupabaseRouteHandler()

    // Verificar que el usuario esté autenticado
    const {
      data: { user: verifiedUser },
      error: verifiedUserError,
    } = await supabase.auth.getUser()

    if (verifiedUserError || !verifiedUser) {
      return errorResponse("No autorizado", 401)
    }

    // Obtener el perfil del usuario actual para verificar permisos
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", verifiedUser.id)
      .single()

    if (profileError || !currentUserProfile) {
      return errorResponse("Error al obtener el perfil del usuario", 500)
    }

    // Verificar que el usuario tenga permisos (sea ADMIN o OWNER)
    if (currentUserProfile.role !== "ADMIN" && currentUserProfile.role !== "OWNER") {
      return errorResponse("No tienes permisos para reenviar invitaciones", 403)
    }

    // Obtener la información del usuario invitado
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(invitationId)

    if (userError || !user) {
      console.error("Error al obtener usuario:", userError)
      return errorResponse("Usuario no encontrado", 404)
    }

    // Verificar que el usuario tenga una invitación pendiente
    if (user.user.email_confirmed_at) {
      return errorResponse("Este usuario ya ha confirmado su correo electrónico", 400)
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

    // Generar un enlace de invitación
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(user.user.email!, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?userId=${invitationId}`,
      data: {
        organization_id: currentUserProfile.organization_id,
        role: invitedUserProfile.role,
        name: invitedUserProfile.name,
        lastname: invitedUserProfile.lastname,
      },
    })

    if (inviteError) {
      console.error("Error al reenviar invitación:", inviteError)
      return errorResponse("Error al reenviar la invitación", 500)
    }

    // Actualizar la fecha de invitación en el perfil
    await supabase.from("profiles").update({ updated_at: new Date().toISOString() }).eq("id", invitationId)

    return NextResponse.json({
      success: true,
      message: "Invitación reenviada correctamente",
    })
  } catch (error) {
    console.error("Error al reenviar invitación:", error)
    return errorResponse("Error interno del servidor", 500)
  }
}
