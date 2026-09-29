import { type NextRequest, NextResponse } from "next/server"
import { normalizarProveedor, PROVEEDORES } from "@/lib/proveedores/tipos"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { getTokenFromAuthorizationHeader, verifyOrgToken, type OrgTokenError } from "@/lib/services/org-token"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Respuesta genérica: no revelamos por qué falló el token a quien no lo tiene. */
const UNAUTHORIZED = { error: "Token inválido o expirado" }

/** Cabeceras para que ningún proxy ni el navegador cacheen claves en claro. */
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
}

function unauthorized(reason: OrgTokenError) {
  console.warn(`[internal/llm-keys] Token rechazado: ${reason}`)
  return NextResponse.json(UNAUTHORIZED, { status: 401, headers: NO_STORE_HEADERS })
}

/**
 * POST /api/internal/llm-keys
 *
 * Devuelve las claves de Quién es quién de una organización, configuradas en
 * Ajustes > Herramientas. La organización viene en un token base64 firmado
 * (ver `lib/services/org-token.ts`), que se envía en la cabecera
 * `Authorization: Bearer <token>` o, en su defecto, en el cuerpo.
 *
 * Se usa POST y no GET a propósito: así el token no queda en la URL, ni por
 * tanto en logs de acceso, historial o cabeceras `Referer`.
 *
 * Cuerpo opcional:
 *   {
 *     "token": "<token>",              // alternativa a la cabecera Authorization
 *     "provider": "OPENAI",            // filtra por proveedor
 *     "includeInactive": false         // por defecto solo devuelve las ACTIVE
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {}
    try {
      body = (await request.json()) ?? {}
    } catch {
      // Cuerpo vacío o no-JSON: válido si el token viaja en la cabecera.
    }

    const token =
      getTokenFromAuthorizationHeader(request.headers.get("authorization")) ??
      (typeof body.token === "string" ? body.token : null)

    const result = verifyOrgToken(token)
    if (!result.valid) {
      return unauthorized(result.error)
    }

    const { organizationId } = result.payload

    const provider = body.provider === undefined || body.provider === null ? null : normalizarProveedor(body.provider)
    if (body.provider !== undefined && body.provider !== null && !provider) {
      return NextResponse.json(
        { error: `Proveedor no válido. Valores permitidos: ${PROVEEDORES.join(", ")}` },
        { status: 400, headers: NO_STORE_HEADERS },
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Comprobamos que la organización existe: un token firmado para una
    // organización borrada no debe devolver una lista vacía silenciosamente.
    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organization")
      .select("id, name")
      .eq("id", organizationId)
      .maybeSingle()

    if (orgError) {
      console.error("[internal/llm-keys] Error al buscar la organización:", orgError)
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500, headers: NO_STORE_HEADERS },
      )
    }

    if (!organization) {
      return NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 404, headers: NO_STORE_HEADERS },
      )
    }

    // Las claves de Quién es quién: el servicio externo las pide con el token
    // de organización. La respuesta conserva la misma forma que antes para no
    // tocar el servicio externo; `includeInactive` ya no aplica porque un
    // proveedor sin clave simplemente no tiene fila.
    let query = supabaseAdmin
      .from("herramienta_proveedores")
      .select("proveedor, api_key, modelo, created_at, updated_at")
      .eq("organization_id", organizationId)
      .eq("herramienta", "quien-es-quien")
      .order("posicion", { ascending: true })

    if (provider) {
      query = query.eq("proveedor", provider)
    }

    const { data: filas, error } = await query
    const apiKeys = (filas ?? []).map((f) => ({
      id: `quien-es-quien:${f.proveedor}`,
      provider: f.proveedor,
      key: f.api_key,
      models: [f.modelo],
      id_channel: null,
      status: "ACTIVE",
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }))

    if (error) {
      console.error("[internal/llm-keys] Error al obtener las claves API:", error)
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500, headers: NO_STORE_HEADERS },
      )
    }

    console.info(
      `[internal/llm-keys] ${apiKeys.length} clave(s) entregadas a la organización ${organizationId} (jti ${result.payload.jti})`,
    )

    return NextResponse.json(
      {
        organizationId,
        organizationName: organization.name,
        apiKeys,
      },
      { headers: NO_STORE_HEADERS },
    )
  } catch (error) {
    console.error("[internal/llm-keys] Error en la ruta POST:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
