import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"
import { createOrgToken } from "@/lib/services/org-token"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_TTL_SECONDS = 365 * 24 * 60 * 60 // 1 año
const DEFAULT_TTL_SECONDS = 5 * 60

/**
 * POST /api/internal/llm-keys/token
 *
 * Emite el token firmado que consume `POST /api/internal/llm-keys`. Solo el
 * OWNER o ADMIN de la organización puede emitirlo, y siempre para su propia
 * organización: el id no se acepta del cliente, se lee del perfil autenticado.
 *
 * Cuerpo opcional: { "ttlSeconds": 300 }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteHandler()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("organizationId, role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.organizationId) {
      return NextResponse.json({ error: "Usuario sin organización" }, { status: 400 })
    }

    if (profile.role !== "OWNER" && profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 })
    }

    let ttlSeconds = DEFAULT_TTL_SECONDS
    try {
      const body = await request.json()
      if (typeof body?.ttlSeconds === "number" && Number.isFinite(body.ttlSeconds)) {
        ttlSeconds = Math.min(Math.max(60, Math.floor(body.ttlSeconds)), MAX_TTL_SECONDS)
      }
    } catch {
      // Sin cuerpo: se usa el TTL por defecto.
    }

    const token = createOrgToken(profile.organizationId, ttlSeconds)

    return NextResponse.json(
      {
        token,
        organizationId: profile.organizationId,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("[internal/llm-keys/token] Error al emitir el token:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
