import { NextResponse } from "next/server"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import { errorResponse } from "@/app/api/base-handler"

export async function GET() {
  try {
    const supabase = await getSupabaseRouteHandler()

    // Obtener la sesión actual para verificar permisos
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el perfil del usuario actual para verificar si es administrador
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role, organizationId")
      .eq("id", sessionData.session.user.id)
      .single()

    if (!profileData || ["OWNER", "ADMIN"].includes(profileData.role) === false) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const organizationId = profileData.organizationId


    // Obtener todos los usuarios de la organización
    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers()

    if (usersError) {
      return errorResponse("Error al obtener usuarios", 400, usersError)
    }

    // Obtener todos los perfiles para poder filtrar por organización
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, organizationId, email, name, lastname, role")
      .eq("organizationId", organizationId)

    if (profilesError) {
      return errorResponse("Error al obtener perfiles", 400, profilesError)
    }
    
    // Crear un mapa de perfiles por ID para búsqueda rápida
    const profileMap = new Map()
    profiles.forEach((profile) => {
      profileMap.set(profile.id, profile)
    })

    // Filtrar usuarios con invitaciones pendientes
    // Un usuario tiene una invitación pendiente si:
    // 1. Está en la tabla de perfiles con la organización correcta
    // 2. No ha confirmado su email o no ha iniciado sesión nunca (last_sign_in_at es null)
    const pendingInvitations = users
      .filter((user) => {
        const profile = profileMap.get(user.id)
        return profile && (!user.email_confirmed_at || !user.last_sign_in_at)
      })
      .map((user) => {
        const profile = profileMap.get(user.id)
        return {
          id: user.id,
          email: user.email,
          name: profile?.name || "",
          lastname: profile?.lastname || "",
          full_name: `${profile?.name || ""} ${profile?.lastname || ""}`.trim(),
          role: profile?.role || "member",
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
        }
      })
    
    return NextResponse.json({ invitations: pendingInvitations })
  } catch (error: any) {
    console.error("Error fetching pending invitations:", error)
    return errorResponse(error.message || "Error al obtener invitaciones pendientes", 500)
  }
}
