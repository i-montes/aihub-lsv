import type { NextRequest } from "next/server"
import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { AuditService, type AuditLogFilter } from "@/lib/services/audit-service"
import { getSupabaseServer } from "@/lib/supabase/server"

export const GET = createApiHandler(async (req: NextRequest) => {
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

  // Obtener parámetros de consulta
  const url = new URL(req.url)
  const userId = url.searchParams.get("userId") || undefined
  const action = url.searchParams.get("action") || undefined
  const entityType = url.searchParams.get("entityType") || undefined
  const fromDateStr = url.searchParams.get("fromDate")
  const toDateStr = url.searchParams.get("toDate")
  const limitStr = url.searchParams.get("limit")
  const offsetStr = url.searchParams.get("offset")

  // Convertir parámetros
  const filter: AuditLogFilter = {
    userId,
    action,
    entityType,
  }

  if (fromDateStr) {
    filter.fromDate = new Date(fromDateStr)
  }

  if (toDateStr) {
    filter.toDate = new Date(toDateStr)
  }

  if (limitStr && !isNaN(Number.parseInt(limitStr))) {
    filter.limit = Number.parseInt(limitStr)
  }

  if (offsetStr && !isNaN(Number.parseInt(offsetStr))) {
    filter.offset = Number.parseInt(offsetStr)
  }

  try {
    // Obtener registros de auditoría
    const logs = await AuditService.getAuditLogs(filter)

    // Obtener información de usuarios para mostrar nombres en lugar de IDs
    const userIds = [...new Set(logs.filter((log) => log.user_id).map((log) => log.user_id))]

    let userMap = {}

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("profiles")
        .select("id, name, lastname, email")
        .in("id", userIds as string[])

      if (users) {
        userMap = users.reduce((acc, user) => {
          acc[user.id] = {
            name: `${user.name || ""} ${user.lastname || ""}`.trim() || user.email,
            email: user.email,
          }
          return acc
        }, {})
      }
    }

    return successResponse({
      logs,
      users: userMap,
      pagination: {
        offset: filter.offset || 0,
        limit: filter.limit || 50,
        total: logs.length, // Nota: esto no es el total real, solo el conteo de la página actual
      },
    })
  } catch (error) {
    console.error("Error al obtener registros de auditoría:", error)
    return errorResponse("Error al obtener registros de auditoría", 500)
  }
})
