import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return errorResponse("Email and password are required", 400)
  }

  const supabase = getSupabaseServer()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return errorResponse(error.message, 401)
  }

  // Instead of fetching the profile directly, use the user metadata
  // This avoids triggering the problematic RLS policy
  const user = data.user
  const profile = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || null,
    lastname: user.user_metadata?.lastname || null,
    avatar: user.user_metadata?.avatar || null,
    role: user.user_metadata?.role || null,
    organizationId: user.user_metadata?.organizationId || null,
  }

  return successResponse({
    user: data.user,
    profile,
  })
})
