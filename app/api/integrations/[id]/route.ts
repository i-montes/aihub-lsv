import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

/**
 * PATCH /api/integrations/[id]
 * Actualiza el estado de una clave API
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseRouteHandler()
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID de la organización del usuario actual
    const { data: userData } = await supabase
      .from("profiles")
      .select("organizationId, role")
      .eq("id", session.session.user.id)
      .single()

    if (!userData?.organizationId) {
      return NextResponse.json({ error: "Usuario sin organización" }, { status: 400 })
    }

    // Verificar si el usuario tiene permisos para actualizar claves API
    if (userData.role !== "OWNER" && userData.role !== "ADMIN") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Falta el campo status" }, { status: 400 })
    }

    // Verificar que la clave API pertenece a la organización del usuario
    const { data: apiKey } = await supabase
      .from("api_key_table")
      .select("*")
      .eq("id", params.id)
      .eq("organizationId", userData.organizationId)
      .single()

    if (!apiKey) {
      return NextResponse.json({ error: "Clave API no encontrada" }, { status: 404 })
    }

    // Actualizar el estado de la clave API
    const { error } = await supabase
      .from("api_key_table")
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      console.error("Error al actualizar clave API:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error en la ruta PATCH /api/integrations/${params.id}:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

/**
 * DELETE /api/integrations/[id]
 * Elimina una clave API
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID de la organización del usuario actual
    const { data: userData } = await supabase
      .from("profiles")
      .select("organizationId, role")
      .eq("id", session.session.user.id)
      .single()

    if (!userData?.organizationId) {
      return NextResponse.json({ error: "Usuario sin organización" }, { status: 400 })
    }

    // Verificar si el usuario tiene permisos para eliminar claves API
    if (userData.role !== "OWNER" && userData.role !== "ADMIN") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 })
    }

    // Verificar que la clave API pertenece a la organización del usuario
    const { data: apiKey } = await supabase
      .from("api_key_table")
      .select("*")
      .eq("id", params.id)
      .eq("organizationId", userData.organizationId)
      .single()

    if (!apiKey) {
      return NextResponse.json({ error: "Clave API no encontrada" }, { status: 404 })
    }

    // Eliminar la clave API
    const { error } = await supabase.from("api_key_table").delete().eq("id", params.id)

    if (error) {
      console.error("Error al eliminar clave API:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error en la ruta DELETE /api/integrations/${params.id}:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
