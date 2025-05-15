import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autenticación de las cookies
    const cookieStore = cookies()

    // Crear un cliente de Supabase para verificar la autenticación
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    })

    // Verificar que el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión para acceder a esta información." },
        { status: 401 },
      )
    }

    // Obtener el ID del usuario de la sesión
    const userId = session.user.id

    // Usar el mismo cliente para obtener el perfil del usuario
    // Este cliente ya tiene los permisos del usuario autenticado
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error al obtener el perfil del usuario:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Devolver los datos del perfil
    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error en el endpoint de perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
