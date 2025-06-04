import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = await getSupabaseServer()

  // Authenticate the user by verifying with Supabase
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return errorResponse("Not authenticated", 401)
  }

  // Get the profile to find organizationId
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organizationId")
    .eq("id", user.id)
    .single()

  if (profileError) {
    return errorResponse(profileError.message, 400)
  }

  if (!profile?.organizationId) {
    return successResponse({ organization: null })
  }

  // Get organization details
  const { data: organization, error: organizationError } = await supabase
    .from("organization")
    .select("*")
    .eq("id", profile.organizationId)
    .single()

  if (organizationError) {
    return errorResponse(organizationError.message, 400)
  }

  return successResponse({ organization })
})

export const PUT = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { name, description, website, contactemail, address, city, state, country } = body

  if (!name) {
    return errorResponse("Organization name is required", 400)
  }

  const supabase = await getSupabaseServer()

  // Authenticate the user by verifying with Supabase
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return errorResponse("Not authenticated", 401)
  }

  // Get the profile to find organizationId
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organizationId, role")
    .eq("id", user.id)
    .single()

  if (profileError) {
    return errorResponse(profileError.message, 400)
  }

  if (!profile?.organizationId) {
    return errorResponse("User is not part of an organization", 400)
  }

  // Check if user has permission to update organization
  if (profile.role !== "OWNER" && profile.role !== "WORKSPACE_ADMIN") {
    return errorResponse("Only organization owners or admins can update organization details", 403)
  }

  // Update organization
  const { error: updateError } = await supabase
    .from("organization")
    .update({
      name,
      description,
      website,
      contactemail,
      address,
      city,
      state,
      country,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", profile.organizationId)

  if (updateError) {
    return errorResponse(updateError.message, 400)
  }

  return successResponse({ success: true })
})
