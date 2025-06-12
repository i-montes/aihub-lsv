import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Crear cliente de Supabase con las cookies
    const supabase = await getSupabaseServer()

    // Intentar iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase signIn error:", error)

      // Manejar específicamente el error de email no confirmado
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json({ error: "Email not confirmed" }, { status: 400 })
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "No se pudo obtener información del usuario" }, { status: 400 })
    }

    // Obtener perfil del usuario
    let profile = null
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (!profileError && profileData) {
        profile = profileData
      }
    } catch (profileError) {
      console.error("Error fetching profile:", profileError)
    }

    // Retornar respuesta exitosa
    return NextResponse.json({
      data: {
        user: data.user,
        session: data.session,
        profile,
      },
    })
  } catch (error) {
    console.error("Unexpected error in login route:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
