import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = await getSupabaseServer()

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return errorResponse("Not authenticated", 401)
  }

  // Get the profile to find organizationId
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organizationId")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return errorResponse(profileError.message, 400)
  }

  if (!profile?.organizationId) {
    return successResponse({ members: [] })
  }

  // Get organization members
  const { data: members, error: membersError } = await supabase
    .from("profiles")
    .select("id, name, lastname, email, avatar, role")
    .eq("organizationId", profile.organizationId)

  if (membersError) {
    return errorResponse(membersError.message, 400)
  }

  return successResponse({ members: members || [] })
})
