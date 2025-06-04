import { NextResponse } from "next/server"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import { createApiHandler } from "@/app/api/base-handler"

export const POST = createApiHandler(async (req) => {
  try {
    const { email, role, name, lastname } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }

    const supabase = await getSupabaseRouteHandler()

    // Verificar el usuario actual de forma segura
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el perfil del usuario actual para verificar permisos
    const { data: currentUserProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Verificar si el usuario tiene permisos para invitar (OWNER o ADMIN)
    if (!currentUserProfile || (currentUserProfile.role !== "OWNER" && currentUserProfile.role !== "ADMIN")) {
      return NextResponse.json({ error: "No tienes permisos para invitar usuarios" }, { status: 403 })
    }

    // Obtener la organización del usuario actual
    const organizationId = currentUserProfile.organizationId

    if (!organizationId) {
      return NextResponse.json({ error: "No tienes una organización asignada" }, { status: 400 })
    }

    // Crear la URL de redirección
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite`

    // Invitar al usuario usando la API de administrador de Supabase
    const { data: user, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        role,
        name,
        lastname,
        organizationId,
      },
    })

    if (inviteError) {
      console.error("Error inviting user:", inviteError)
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    // Verificar que el usuario se haya creado correctamente
    if (!user || !user.user || !user.user.id) {
      return NextResponse.json(
        {
          error: "Usuario invitado pero no se pudo obtener su ID para actualizar el perfil",
        },
        { status: 500 },
      )
    }

    // Actualizar el perfil del usuario con el organizationId
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        organizationId,
        role: role || "USER",
        name: name || "",
        lastname: lastname || "",
      })
      .eq("id", user.user.id)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      return NextResponse.json(
        {
          message: "Invitación enviada pero hubo un error al actualizar el perfil",
          error: updateError.message,
          user,
        },
        { status: 200 },
      ) // Devolvemos 200 porque la invitación fue exitosa
    }

    return NextResponse.json({
      message: "Invitación enviada y perfil actualizado correctamente",
      user,
    })
  } catch (error: any) {
    console.error("Error in invite API:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
})
