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
