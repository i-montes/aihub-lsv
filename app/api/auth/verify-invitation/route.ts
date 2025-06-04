import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const id = requestUrl.searchParams.get("id")
  const supabase = createRouteHandlerClient({ cookies })

  if (!id) {
    return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 })
  }

  // En lugar de solo devolver la invitación, devolver también el usuario
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id)

  if (userError || !userData.user) {
    console.error("Error al obtener usuario:", userError)
    return NextResponse.json({ error: "Usuario no encontrado o invitación inválida" }, { status: 404 })
  }

  // Obtener información de la organización si existe
  let organizationName = null
  if (userData.user.user_metadata?.organizationId) {
    const { data: orgData } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", userData.user.user_metadata.organizationId)
      .single()

    organizationName = orgData?.name
  }

  return NextResponse.json({
    user: userData.user,
    organizationName,
    message: "Invitación válida",
  })
}
