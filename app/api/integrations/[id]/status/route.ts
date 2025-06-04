import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

/**
 * PATCH /api/integrations/[id]/status
 * Actualiza el estado de una clave API (activar/desactivar)
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseRouteHandler()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID de la organización del usuario actual
    const { data: userData } = await supabase
      .from("profiles")
      .select("organizationId, role")
      .eq("id", user.id)
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

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 })
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
        status: status as Database["public"]["Enums"]["api_key_status"],
        updatedAt: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      console.error("Error al actualizar estado de clave API:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Registrar la actividad
    await supabase.from("activity").insert({
      id: crypto.randomUUID(),
      action: status === "ACTIVE" ? "INTEGRATION_ACTIVATED" : "INTEGRATION_DEACTIVATED",
      userId: user.id,
      details: {
        integrationId: params.id,
        provider: apiKey.provider,
        status,
      },
      createdAt: new Date().toISOString(),
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({
      success: true,
      message: status === "ACTIVE" ? "Integración activada correctamente" : "Integración desactivada correctamente",
    })
  } catch (error) {
    console.error(`Error en la ruta PATCH /api/integrations/${params.id}/status:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
