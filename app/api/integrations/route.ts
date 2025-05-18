import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types.ts"

type ApiKeyProvider = Database["public"]["Enums"]["provider_ai"]

export const GET = createApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get("provider") as ApiKeyProvider | null

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
    return successResponse({ apiKeys: [] })
  }

  // Build the query
  let query = supabase
    .from("api_key_table")
    .select("*")
    .eq("organizationId", profile.organizationId)
    .order("createdAt", { ascending: false })

  // Apply provider filter if provided
  if (provider) {
    query = query.eq("provider", provider)
  }

  const { data, error } = await query

  if (error) {
    return errorResponse(error.message, 400)
  }

  return successResponse({ apiKeys: data || [] })
})

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { key, provider, models, id_channel } = body

  if (!key || !provider) {
    return errorResponse("Key and provider are required", 400)
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

  // Get the profile to find organizationId
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

  // Check if user has permission to add API keys
  if (profile.role !== "OWNER" && profile.role !== "ADMIN") {
    return errorResponse("Only organization owners or admins can add API keys", 403)
  }

  // Check if a key for this provider already exists
  const { data: existingKeys, error: existingKeysError } = await supabase
    .from("api_key_table")
    .select("id")
    .eq("organizationId", profile.organizationId)
    .eq("provider", provider)

  if (existingKeysError) {
    return errorResponse(existingKeysError.message, 400)
  }

  if (existingKeys && existingKeys.length > 0) {
    return errorResponse(`A key for ${provider} already exists. Please update or delete the existing key.`, 400)
  }

  // Create new API key
  const now = new Date().toISOString()
  const { data: apiKey, error: insertError } = await supabase
    .from("api_key_table")
    .insert({
      key,
      provider,
      models: models || null,
      id_channel: id_channel || null,
      organizationId: profile.organizationId,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single()

  if (insertError) {
    return errorResponse(insertError.message, 400)
  }

  // Log the activity
  await supabase.from("activity").insert({
    action: "API_KEY_ADDED",
    userId: session.user.id,
    details: {
      provider,
      timestamp: now,
    },
    createdAt: now,
    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  })

  return successResponse({
    success: true,
    apiKey,
    message: `${provider} API key added successfully`,
  })
})
