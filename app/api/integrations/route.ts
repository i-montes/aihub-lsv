import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

/**
 * GET /api/integrations
 * Obtiene todas las claves API de la organización actual
 * Opcionalmente filtra por proveedor con ?provider=OPENAI
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID de la organización del usuario actual
    const { data: userData } = await supabase
      .from("profiles")
      .select("organizationId")
      .eq("id", session.session.user.id)
      .single()

    if (!userData?.organizationId) {
      return NextResponse.json({ error: "Usuario sin organización" }, { status: 400 })
    }

    // Verificar si hay un parámetro de consulta para filtrar por proveedor
    const url = new URL(request.url)
    const provider = url.searchParams.get("provider") as Database["public"]["Enums"]["provider_ai"] | null

    let query = supabase.from("api_key_table").select("*").eq("organizationId", userData.organizationId)

    // Aplicar filtro por proveedor si existe
    if (provider) {
      query = query.eq("provider", provider)
    }

    const { data: apiKeys, error } = await query.order("createdAt", { ascending: false })

    if (error) {
      console.error("Error al obtener claves API:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Ocultar las claves completas por seguridad
    const safeApiKeys = apiKeys.map((key) => ({
      ...key,
      key: `${key.key.substring(0, 4)}...${key.key.substring(key.key.length - 4)}`,
    }))

    return NextResponse.json({ apiKeys: safeApiKeys })
  } catch (error) {
    console.error("Error en la ruta /api/integrations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

/**
 * POST /api/integrations
 * Crea una nueva clave API
 */
export async function POST(request: NextRequest) {
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

    // Verificar si el usuario tiene permisos para crear claves API
    if (userData.role !== "OWNER" && userData.role !== "ADMIN") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 })
    }

    const body = await request.json()
    const { key, provider, models, id_channel } = body

    if (!key || !provider) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Crear nueva clave API
    const { data: apiKey, error } = await supabase
      .from("api_key_table")
      .insert({
        key,
        provider,
        models: models || null,
        id_channel: id_channel || null,
        organizationId: userData.organizationId,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error al crear clave API:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, apiKey })
  } catch (error) {
    console.error("Error en la ruta POST /api/integrations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
