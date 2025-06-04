import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = await getSupabaseServer()

  try {
    // First, authenticate the user securely using getUser()
    const { 
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error authenticating user:", userError)
      return errorResponse(userError.message, 400)
    }

    if (!user) {
      return successResponse({ session: null, user: null })
    }

    // Also get session data for compatibility with the existing API
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting session:", sessionError)
      // Still return the authenticated user even if session retrieval fails
      return successResponse({ user })
    }

    // Include both the authenticated user and session in the response
    return successResponse({
      session,
      user
    })
  } catch (error: any) {
    console.error("Error retrieving authentication data:", error)
    return errorResponse("Error retrieving authentication data", 500)
  }
})
