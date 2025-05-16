import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = await getSupabaseServer()

  // First get the current user from the session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return errorResponse("Not authenticated", 401)
  }

  // Use the user metadata instead of querying the profiles table directly
  // This avoids the problematic RLS policy
  const profile = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || null,
    lastname: user.user_metadata?.lastname || null,
    avatar: user.user_metadata?.avatar || null,
    role: user.user_metadata?.role || null,
    organizationId: user.user_metadata?.organizationId || null,
  }

  return successResponse({ profile })
})
