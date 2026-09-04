import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"
import { createOrgToken } from "@/lib/services/org-token"
import { isSuperAdminEmail } from "@/lib/admin/super-admins"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_TTL_SECONDS = 60 * 60 // 1 hora
const DEFAULT_TTL_SECONDS = 5 * 60

/**
 * POST /api/admin/organization/token
 *
 * Emite un token de acceso a la API para *cualquier* organización, desde el
 * panel de administración.
 *
 * A diferencia de `POST /api/internal/llm-keys/token`, aquí el id de la
 * organización sí viene del cliente, así que la autorización no puede ser el
 * rol `OWNER`/`ADMIN`: ese rol lo tiene el responsable de cada organización y
 * le permitiría sacar las claves de todas las demás. Se exige estar en la lista
 * de administradores del panel (`lib/admin/super-admins.ts`).
 *
 * Cuerpo: { "organizationId": "<uuid>", "ttlSeconds": 300 }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteHandler()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado. Debe iniciar sesión." }, { status: 401 })
    }

    if (!isSuperAdminEmail(user.email)) {
      return NextResponse.json(
        { error: "Acceso denegado. Solo los administradores del panel pueden generar tokens." },
        { status: 403 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const organizationId = typeof body?.organizationId === "string" ? body.organizationId : null

    if (!organizationId) {
      return NextResponse.json({ error: "El ID de la organización es requerido." }, { status: 400 })
    }

    let ttlSeconds = DEFAULT_TTL_SECONDS
    if (typeof body?.ttlSeconds === "number" && Number.isFinite(body.ttlSeconds)) {
      ttlSeconds = Math.min(Math.max(60, Math.floor(body.ttlSeconds)), MAX_TTL_SECONDS)
    }

    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organization")
      .select("id, name")
      .eq("id", organizationId)
      .maybeSingle()

    if (orgError) {
      console.error("[admin/organization/token] Error al buscar la organización:", orgError)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }

    if (!organization) {
      return NextResponse.json({ error: "Organización no encontrada." }, { status: 404 })
    }

    const token = createOrgToken(organization.id, ttlSeconds)

    console.info(
      `[admin/organization/token] ${user.email} emitió un token para la organización ${organization.id} (${ttlSeconds}s)`,
    )

    return NextResponse.json(
      {
        token,
        organizationId: organization.id,
        organizationName: organization.name,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("[admin/organization/token] Error al emitir el token:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
