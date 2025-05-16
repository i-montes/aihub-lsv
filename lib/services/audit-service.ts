import { getSupabaseServer } from "@/lib/supabase/server"

export type AuditAction =
  | "user.create"
  | "user.update"
  | "user.delete"
  | "profile.update"
  | "organization.create"
  | "organization.update"
  | "organization.delete"
  | "content.create"
  | "content.update"
  | "content.delete"
  | "api_key.create"
  | "api_key.update"
  | "api_key.delete"
  | "settings.update"
  | string // Permitir acciones personalizadas

export type EntityType = "user" | "profile" | "organization" | "content" | "api_key" | "settings" | string // Permitir tipos personalizados

export interface AuditLogEntry {
  id?: string
  user_id?: string
  action: AuditAction
  entity_type?: EntityType
  entity_id?: string
  details?: Record<string, any>
  ip_address?: string
  created_at?: string
}

export interface AuditLogFilter {
  userId?: string
  action?: string
  entityType?: string
  fromDate?: Date
  toDate?: Date
  limit?: number
  offset?: number
}

export const AuditService = {
  /**
   * Registra una acción administrativa en el log de auditoría
   */
  async logAction(entry: AuditLogEntry, requestInfo?: { ip?: string }): Promise<void> {
    try {
      const supabase = await getSupabaseServer()

      // Asegurarse de que los detalles sean un objeto JSON válido
      const details = entry.details ? entry.details : {}

      await supabase.from("audit_logs").insert({
        user_id: entry.user_id,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        details,
        ip_address: requestInfo?.ip || null,
      })

      console.log(`[Audit] Logged action: ${entry.action}`)
    } catch (error) {
      console.error("[Audit] Error logging action:", error)
      // No lanzamos el error para evitar interrumpir el flujo principal
    }
  },

  /**
   * Obtiene registros de auditoría con filtros opcionales
   */
  async getAuditLogs(filter?: AuditLogFilter): Promise<AuditLogEntry[]> {
    try {
      const supabase = await getSupabaseServer()

      let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false })

      // Aplicar filtros si existen
      if (filter?.userId) {
        query = query.eq("user_id", filter.userId)
      }

      if (filter?.action) {
        query = query.ilike("action", `%${filter.action}%`)
      }

      if (filter?.entityType) {
        query = query.eq("entity_type", filter.entityType)
      }

      if (filter?.fromDate) {
        query = query.gte("created_at", filter.fromDate.toISOString())
      }

      if (filter?.toDate) {
        query = query.lte("created_at", filter.toDate.toISOString())
      }

      // Aplicar paginación
      if (filter?.limit) {
        query = query.limit(filter.limit)
      } else {
        query = query.limit(50) // Límite predeterminado
      }

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("[Audit] Error fetching audit logs:", error)
      throw error
    }
  },

  /**
   * Obtiene un registro de auditoría específico por ID
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    try {
      const supabase = await getSupabaseServer()

      const { data, error } = await supabase.from("audit_logs").select("*").eq("id", id).single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error(`[Audit] Error fetching audit log with ID ${id}:`, error)
      return null
    }
  },
}
