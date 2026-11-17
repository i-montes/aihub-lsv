import { randomBytes } from "crypto"
import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import type { NextRequest } from "next/server"

const LONGITUD_MINIMA = 8

// Un administrador de la organización fija o genera la contraseña de otro miembro.
// Sin `password` en el cuerpo se genera una aleatoria y se devuelve una sola vez.
export const POST = createApiHandler(async (req: NextRequest) => {
  const segments = new URL(req.url).pathname.split("/")
  const userId = segments[segments.length - 2]

  const { password } = (await req.json().catch(() => ({}))) as { password?: unknown }
  if (password !== undefined && (typeof password !== "string" || password.length < LONGITUD_MINIMA)) {
    return errorResponse(`La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres`, 400)
  }

  const supabase = await getSupabaseServer()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    return errorResponse("No autenticado", 401)
  }
  if (userId === currentUser.id) {
    return errorResponse("Para cambiar tu propia contraseña usa tu perfil", 400)
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role, organizationId")
    .eq("id", currentUser.id)
    .single()
  if (!currentProfile || (currentProfile.role !== "ADMIN" && currentProfile.role !== "OWNER")) {
    return errorResponse("No tiene permisos para restablecer contraseñas", 403)
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("organizationId, role")
    .eq("id", userId)
    .single()
  if (!targetProfile || targetProfile.organizationId !== currentProfile.organizationId) {
    return errorResponse("El usuario no pertenece a su organización", 403)
  }
  if (targetProfile.role === "OWNER" && currentProfile.role !== "OWNER") {
    return errorResponse("Solo un propietario puede restablecer la contraseña de otro propietario", 403)
  }

  const nuevaPassword = (password as string | undefined) ?? randomBytes(12).toString("base64url")
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(userId, { password: nuevaPassword })
  if (error) {
    return errorResponse(`Error al restablecer la contraseña: ${error.message}`, 500)
  }

  // Solo se devuelve la generada: la que escribió el admin ya la conoce.
  return successResponse({ password: password === undefined ? nuevaPassword : null })
})
