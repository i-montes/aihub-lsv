import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id

  const supabase = getSupabaseServer()

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return errorResponse("Not authenticated", 401)
  }

  // Get content by ID
  const { data, error } = await supabase.from("content").select("*").eq("id", id).single()

  if (error) {
    return errorResponse(error.message, 400)
  }

  return successResponse({ content: data })
})

export const PUT = createApiHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id
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

  // Update content
  const { error: updateError } = await supabase
    .from("content")
    .update({
      title,
      description,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)

  if (updateError) {
    return errorResponse(updateError.message, 400)
  }

  return successResponse({ success: true })
})

export const DELETE = createApiHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id

  const supabase = getSupabaseServer()

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return errorResponse("Not authenticated", 401)
  }

  // Delete content
  const { error } = await supabase.from("content").delete().eq("id", id)

  if (error) {
    return errorResponse(error.message, 400)
  }

  return successResponse({ success: true })
})
