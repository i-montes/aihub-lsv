import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = getSupabaseServer()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    return errorResponse(error.message, 400)
  }

  if (!session) {
    return successResponse({ session: null, user: null })
  }

  return successResponse({
    session,
    user: session.user,
  })
})
