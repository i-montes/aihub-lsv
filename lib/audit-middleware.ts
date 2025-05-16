import { type NextRequest, NextResponse } from "next/server"
import { AuditService, type AuditAction, type EntityType } from "@/lib/services/audit-service"
import { getSupabaseServer } from "@/lib/supabase/server"

export interface AuditOptions {
  action: AuditAction
  entityType?: EntityType
  getEntityId?: (req: NextRequest, res: NextResponse) => string | Promise<string>
  getDetails?: (body: any, req: NextRequest, res: NextResponse) => Record<string, any> | Promise<Record<string, any>>
  skipAudit?: (req: NextRequest, res: NextResponse) => boolean | Promise<boolean>
}

/**
 * Middleware para registrar automáticamente acciones administrativas
 */
export function withAudit(handler: (req: NextRequest) => Promise<NextResponse>, options: AuditOptions) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Extraer el cuerpo de la solicitud una sola vez al inicio
    let bodyData: any = null

    try {
      // Solo intentar extraer el cuerpo si es un método que puede tener cuerpo
      if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
        try {
          // Clonar la solicitud para leer el cuerpo sin consumirlo
          const clonedReq = req.clone()
          const contentType = req.headers.get("content-type") || ""

          if (contentType.includes("application/json")) {
            const text = await clonedReq.text()
            if (text) {
              bodyData = JSON.parse(text)
            }
          }
        } catch (e) {
          console.warn("[AuditMiddleware] Could not parse request body:", e)
          // Continuar sin el cuerpo
        }
      }

      // Ejecutar el handler original
      const response = await handler(req)

      // Verificar si debemos omitir el registro de auditoría
      if (options.skipAudit && (await options.skipAudit(req, response))) {
        return response
      }

      // Solo registrar acciones exitosas (códigos 2xx)
      if (response.status >= 200 && response.status < 300) {
        const supabase = await getSupabaseServer()

        // Obtener la sesión actual para identificar al usuario
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const userId = session?.user?.id

        // Obtener la IP del cliente
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

        // Obtener el ID de la entidad si se proporcionó una función
        let entityId: string | undefined
        if (options.getEntityId) {
          entityId = await options.getEntityId(req, response)
        }

        // Obtener detalles adicionales si se proporcionó una función
        let details: Record<string, any> = {}
        if (options.getDetails && bodyData !== null) {
          details = await options.getDetails(bodyData, req, response)
        }

        // Registrar la acción
        await AuditService.logAction(
          {
            user_id: userId,
            action: options.action,
            entity_type: options.entityType,
            entity_id: entityId,
            details,
          },
          { ip },
        )
      }

      return response
    } catch (error) {
      console.error("[AuditMiddleware] Error:", error)
      // Si hay un error en el middleware, aún así devolvemos la respuesta original
      // o un error 500 si no se pudo generar la respuesta
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
  }
}
