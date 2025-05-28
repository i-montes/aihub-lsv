import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const POST = createApiHandler(async (req: NextRequest) => {
  const supabase = getSupabaseServer()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return errorResponse(error.message, 400)
  }

  return successResponse({ success: true })
})
