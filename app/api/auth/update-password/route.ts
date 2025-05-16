import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { password } = body

  if (!password) {
    return errorResponse("Password is required", 400)
  }

  const supabase = getSupabaseServer()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return errorResponse(error.message, 400)
  }

  return successResponse({ success: true })
})
