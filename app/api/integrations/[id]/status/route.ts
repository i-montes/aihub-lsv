import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types.ts"

type ApiKeyStatus = Database["public"]["Enums"]["api_key_status"]

export const PATCH = createApiHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id
  const body = await req.json()
  const { status } = body as { status: ApiKeyStatus }

  if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
    return errorResponse("Valid status (ACTIVE or INACTIVE) is required", 400)
  }

  const supabase = await getSupabaseServer()

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return errorResponse("Not authenticated", 401)
  }

  // Get the profile to find organizationId and role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organizationId, role")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return errorResponse(profileError.message, 400)
  }

  if (!profile?.organizationId) {
    return errorResponse("User is not part of an organization", 400)
  }

  // Check if user has permission to update API keys
  if (profile.role !== "OWNER" && profile.role !== "ADMIN") {
    return errorResponse("Only organization owners or admins can update API keys", 403)
  }

  // Get the API key to check if it belongs to the user's organization
  const { data: apiKey, error: apiKeyError } = await supabase
    .from("api_key_table")
    .select("organizationId, provider, status")
    .eq("id", id)
    .single()

  if (apiKeyError) {
    return errorResponse(apiKeyError.message, 400)
  }

  if (apiKey.organizationId !== profile.organizationId) {
    return errorResponse("You don't have permission to update this API key", 403)
  }

  // If the status is already what we want to set it to, return early
  if (apiKey.status === status) {
    return successResponse({
      success: true,
      message: `API key is already ${status === "ACTIVE" ? "active" : "inactive"}`,
    })
  }

  // Update the API key status
  const { error: updateError } = await supabase
    .from("api_key_table")
    .update({
      status,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)

  if (updateError) {
    return errorResponse(updateError.message, 400)
  }

  // Log the activity
  await supabase.from("activity").insert({
    action: status === "ACTIVE" ? "API_KEY_ACTIVATED" : "API_KEY_DEACTIVATED",
    userId: session.user.id,
    details: {
      provider: apiKey.provider,
      timestamp: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  })

  return successResponse({
    success: true,
    message:
      status === "ACTIVE"
        ? "API key activated successfully"
        : "API key deactivated successfully. You can reactivate it later if needed.",
  })
})
