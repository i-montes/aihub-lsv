import { NextResponse } from "next/server"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario es requerido" }, { status: 400 })
    }

    const supabase = await getSupabaseRouteHandler()

    // Obtener el usuario
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !userData.user) {
      console.error("Error al obtener usuario:", userError)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Si el email ya está confirmado, no hacer nada
    if (userData.user.email_confirmed_at) {
      return NextResponse.json({ message: "Email ya confirmado" })
    }

    // Confirmar el email automáticamente
    const { error: confirmError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (confirmError) {
      console.error("Error al confirmar email:", confirmError)
      return NextResponse.json({ error: "No se pudo confirmar el email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Email confirmado correctamente" })
  } catch (error) {
    console.error("Error al confirmar email:", error)
    return NextResponse.json({ error: "Error al procesar la confirmación" }, { status: 500 })
  }
}
