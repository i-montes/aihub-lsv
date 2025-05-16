import type { NextRequest } from "next/server"
import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { AuditService } from "@/lib/services/audit-service"
import { getSupabaseServer } from "@/lib/supabase/server"

export const GET = createApiHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params

  // Verificar si el usuario tiene permisos de administrador
  const supabase = await getSupabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return errorResponse("No autenticado", 401)
  }

  // Obtener el perfil del usuario para verificar su rol
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Verificar si el usuario tiene permisos de administrador
  if (!profile || (profile.role !== "OWNER" && profile.role !== "WORKSPACE_ADMIN")) {
    return errorResponse("No autorizado", 403)
  }

  try {
    // Obtener el registro de auditoría
    const log = await AuditService.getAuditLogById(id)

    if (!log) {
      return errorResponse("Registro de auditoría no encontrado", 404)
    }

    // Si hay un usuario asociado, obtener su información
    let user = null
    if (log.user_id) {
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, name, lastname, email")
        .eq("id", log.user_id)
        .single()

      if (userData) {
        user = {
          id: userData.id,
          name: `${userData.name || ""} ${userData.lastname || ""}`.trim() || userData.email,
          email: userData.email,
        }
      }
    }

    return successResponse({
      log,
      user,
    })
  } catch (error) {
    console.error(`Error al obtener registro de auditoría con ID ${id}:`, error)
    return errorResponse("Error al obtener registro de auditoría", 500)
  }
})
