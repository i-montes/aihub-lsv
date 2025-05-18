import { type NextRequest, NextResponse } from "next/server"

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  status: number
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      status,
    },
    { status },
  )
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      status,
    },
    { status },
  )
}

// Añadir la función handleApiError después de la función errorResponse

export function handleApiError(error: any): NextResponse<ApiResponse> {
  console.error("API error:", error)

  // Determinar el tipo de error y devolver la respuesta adecuada
  if (error.status && error.message) {
    // Si el error ya tiene un status y mensaje, usarlos
    return errorResponse(error.message, error.status)
  } else if (error.code === "23505") {
    // Error de duplicado en PostgreSQL
    return errorResponse("Ya existe un registro con esos datos", 409)
  } else if (error.code === "23503") {
    // Error de clave foránea en PostgreSQL
    return errorResponse("No se puede realizar esta operación debido a restricciones de integridad", 400)
  } else if (error.code === "42P01") {
    // Tabla no existe en PostgreSQL
    return errorResponse("Error en la estructura de la base de datos", 500)
  } else if (error.code === "42703") {
    // Columna no existe en PostgreSQL
    return errorResponse("Error en la estructura de la base de datos", 500)
  } else if (error.message) {
    // Si solo tiene mensaje, usar código 400
    return errorResponse(error.message, 400)
  }

  // Error genérico
  return errorResponse("Error interno del servidor", 500)
}

export function createApiHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error: any) {
      console.error("API handler error:", error)
      return errorResponse(error.message || "Internal server error", 500)
    }
  }
}

// Añadiendo la exportación faltante
export interface BaseHandler {
  handle: (req: NextRequest) => Promise<NextResponse>
}

// Clase de implementación básica para mantener compatibilidad
export class BaseHandlerImpl implements BaseHandler {
  async handle(req: NextRequest): Promise<NextResponse> {
    throw new Error("Method not implemented. Override this method in your handler.")
  }
}
