import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/server"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { baseHandler } from "@/app/api/base-handler"

export const POST = baseHandler(async (req) => {
  try {
    const { email, role } = await req.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Email y rol son requeridos" }, { status: 400 })
    }

    // Validar que el rol sea válido
    const validRoles = ["ADMIN", "EDITOR", "USER", "VIEWER"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    // Obtener el usuario actual y verificar permisos
    const supabase = createServerActionClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el perfil del usuario actual
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    // Verificar que el usuario tenga permisos para invitar
    if (!profile || (profile.role !== "OWNER" && profile.role !== "ADMIN")) {
      return NextResponse.json({ error: "No tienes permisos para invitar usuarios" }, { status: 403 })
    }

    // Obtener la organización del usuario
    const { data: userOrg } = await supabase
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", session.user.id)
      .single()

    if (!userOrg || !userOrg.organization_id) {
      return NextResponse.json({ error: "No se encontró la organización" }, { status: 404 })
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", email).single()

    // Obtener el cliente admin para operaciones privilegiadas
    const supabaseAdmin = await getSupabaseAdmin()

    // Si el usuario ya existe, añadirlo directamente a la organización
    if (existingUser) {
      // Verificar que no esté ya en la organización
      const { data: existingMember } = await supabase
        .from("user_organizations")
        .select("*")
        .eq("user_id", existingUser.id)
        .eq("organization_id", userOrg.organization_id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: "El usuario ya es miembro de la organización" }, { status: 400 })
      }

      // Añadir el usuario a la organización
      await supabaseAdmin.from("user_organizations").insert({
        user_id: existingUser.id,
        organization_id: userOrg.organization_id,
        role: role,
      })

      return NextResponse.json({
        success: true,
        message: "Usuario añadido a la organización",
      })
    }

    // Si el usuario no existe, crear una invitación
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("invitations")
      .insert({
        email,
        organization_id: userOrg.organization_id,
        role,
        invited_by: session.user.id,
        status: "PENDING",
      })
      .select()

    if (invitationError) {
      console.error("Error creating invitation:", invitationError)
      return NextResponse.json({ error: "Error al crear la invitación" }, { status: 500 })
    }

    // Aquí se enviaría un email con la invitación
    // Por ahora, solo simulamos que se ha enviado

    return NextResponse.json({
      success: true,
      message: "Invitación enviada correctamente",
      invitation: invitation[0],
    })
  } catch (error) {
    console.error("Error inviting user:", error)
    return NextResponse.json({ error: "Error al procesar la invitación" }, { status: 500 })
  }
})
