import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export type ApiResponse<T = any> = {
  data?: T
  error?: string
  status: number
}

export type ApiHandler = (req: NextRequest, params?: any) => Promise<NextResponse<ApiResponse>>

export function createApiHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, params?: any) => {
    try {
      return await handler(req, params)
    } catch (error: any) {
      console.error("API error:", error)

      return NextResponse.json(
        {
          error: error.message || "Internal Server Error",
          status: 500,
        },
        { status: 500 },
      )
    }
  }
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, status }, { status })
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ error, status }, { status })
}

export function getSupabase() {
  return getSupabaseServer()
}
