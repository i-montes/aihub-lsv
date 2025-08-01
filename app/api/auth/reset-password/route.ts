import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { email, redirectTo } = body

  if (!email) {
    return errorResponse("Email is required", 400)
  }

  const supabase = await getSupabaseServer()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${req.nextUrl.origin}/reset-password/update`,
  })

  if (error) {
    return errorResponse(error.message, 400)
  }

  return successResponse({ success: true })
})
