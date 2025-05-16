import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get("filter") || "all"

  const supabase = getSupabaseServer()

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return errorResponse("Not authenticated", 401)
  }

  // Build the query
  let query = supabase.from("content").select("*").order("updatedAt", { ascending: false })

  // Apply filters
  if (filter === "mine") {
    query = query.eq("userId", session.user.id)
  } else if (filter === "published") {
    query = query.eq("status", "PUBLISHED")
  } else if (filter === "draft") {
    query = query.eq("status", "DRAFT")
  }

  const { data, error } = await query

  if (error) {
    return errorResponse(error.message, 400)
  }

  return successResponse({ contents: data || [] })
})

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { title, description } = body

  if (!title) {
    return errorResponse("Title is required", 400)
  }

  const supabase = getSupabaseServer()

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return errorResponse("Not authenticated", 401)
  }

  // Get user profile for organizationId
  const { data: profile } = await supabase.from("profiles").select("organizationId").eq("id", session.user.id).single()

  // Create new content
  const { data, error } = await supabase.from("content").insert({
    title,
    description,
    userId: session.user.id,
    organizationId: profile?.organizationId,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  if (error) {
    return errorResponse(error.message, 400)
  }

  return successResponse({ success: true })
})
