import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = await getSupabaseRouteHandler()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return errorResponse(error.message, 400)
    }

    if (!session) {
      return successResponse({ session: null, user: null })
    }

    // Include the complete session in the response
    return successResponse({
      session,
      user: session.user,
    })
  } catch (error: any) {
    console.error("Error getting session:", error)
    return errorResponse("Error retrieving session", 500)
  }
})
