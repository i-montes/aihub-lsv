import { NextResponse } from "next/server"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json()

    if (!id || !password) {
      return NextResponse.json({ error: "ID de usuario y contraseña son requeridos" }, { status: 400 })
    }

    const supabase = await getSupabaseRouteHandler()

    // Verificar si el usuario existe
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id)

    if (userError || !userData.user) {
      console.error("Error al obtener usuario:", userError)
      return NextResponse.json({ error: "Usuario no encontrado o invitación inválida" }, { status: 404 })
    }

    // Actualizar la contraseña del usuario
    const { error: updateError } = await supabase.auth.admin.updateUserById(id, { password })

    if (updateError) {
      console.error("Error al actualizar contraseña:", updateError)
      return NextResponse.json({ error: "No se pudo establecer la contraseña" }, { status: 500 })
    }

    // Iniciar sesión automáticamente
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email!,
      password,
    })

    if (signInError) {
      console.error("Error al iniciar sesión:", signInError)
      // No devolvemos error aquí, ya que la contraseña se estableció correctamente
    }

    return NextResponse.json({
      message: "Invitación aceptada correctamente",
    })
  } catch (error) {
    console.error("Error al aceptar invitación:", error)
    return NextResponse.json({ error: "Error al procesar la invitación" }, { status: 500 })
  }
}
