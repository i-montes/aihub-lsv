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

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, name, lastname, avatar, role, organizationId")
    .eq("id", user.id)
    .single()

  if (profileError) {
    // If the profile is not found, return a 404 error
    if (profileError.code === "PGRST116") {
      return errorResponse("Profile not found", 404)
    }
    // If there is any other error, return a 500 error
    return errorResponse("Internal server error", 500)
  }

  return successResponse({ profile: profileData })
})
