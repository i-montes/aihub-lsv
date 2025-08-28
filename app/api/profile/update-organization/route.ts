import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json()

    if (!organizationId) {
      return NextResponse.json(
        { error: "El ID de organización es requerido" },
        { status: 400 }
      )
    }

    // Obtener el usuario autenticado
    const supabase = await getSupabaseRouteHandler()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      )
    }

    // Verificar que la organización existe y está activa
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organization")
      .select("id, name, state")
      .eq("id", organizationId)
      .eq("state", "ACTIVE")
      .single()

    if (orgError || !orgData) {
      return NextResponse.json(
        { error: "Organización no encontrada o inactiva" },
        { status: 404 }
      )
    }

    // Actualizar el organizationId del usuario
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        organizationId: organizationId,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating user organization:", updateError)
      return NextResponse.json(
        { error: "Error al actualizar la organización del usuario" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Organización actualizada exitosamente",
      organization: orgData
    })

  } catch (error) {
    console.error("Error in update organization API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}