import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getAuthenticatedUserAPI, getUserProfileAPI } from "@/lib/supabase/auth"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  // Get authenticated user using our secure method
  const { user, error: authError } = await getAuthenticatedUserAPI()

  if (authError || !user) {
    return errorResponse("Not authenticated", 401)
  }

  // Get the user profile using our secure method
  const { data: profile, error: profileError } = await getUserProfileAPI(user.id)

  if (profileError) {
    return errorResponse(profileError.message, 400)
  }

  return successResponse({ profile })
})

export const PUT = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { name, lastname, email, avatar } = body

  // Get authenticated user using our secure method
  const { user, error: authError } = await getAuthenticatedUserAPI()

  if (authError || !user) {
    return errorResponse("Not authenticated", 401)
  }

  const supabase = await getSupabaseRouteHandler()

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (name !== undefined) updates.name = name
  if (lastname !== undefined) updates.lastname = lastname
  if (avatar !== undefined) updates.avatar = avatar

  // Update profile in the database
  const { error: updateError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)

  if (updateError) {
    return errorResponse(updateError.message, 400)
  }

  // If email is changing, update email in auth
  let emailUpdateResult = null
  if (email && email !== user.email) {
    const { data: emailData, error: emailError } = await supabase.auth.updateUser({
      email: email,
    })

    if (emailError) {
      return errorResponse(emailError.message, 400)
    }

    emailUpdateResult = emailData

    // Also update email in profiles table
    await supabase.from("profiles").update({ email }).eq("id", user.id)
  }

  // Update auth metadata as well
  if (name !== undefined || lastname !== undefined) {
    await supabase.auth.updateUser({
      data: {
        name: name,
        lastname: lastname,
      },
    })
  }

  return successResponse({
    success: true,
    emailUpdated: !!emailUpdateResult,
  })
})
