import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "El correo electrónico es requerido" }, { status: 400 })
    }

    // Crear cliente de Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Reenviar correo de confirmación
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })

    if (error) {
      console.error("Error resending confirmation email:", error)
      return NextResponse.json(
        { error: error.message || "Error al reenviar el correo de confirmación" },
        { status: 500 },
      )
    }

    return NextResponse.json({ message: "Correo de confirmación reenviado exitosamente" }, { status: 200 })
  } catch (error: any) {
    console.error("Error in resend confirmation API:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
