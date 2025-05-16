import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  try {
    const supabase = await getSupabaseServer()

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return errorResponse("Not authenticated", 401)
    }

    // Get admin client
    const supabaseAdmin = await getSupabaseAdmin()

    // Get the user profile using admin client to bypass RLS policies
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, name, lastname, avatar, role, organizationId")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return errorResponse(profileError.message, 400)
    }

    return successResponse({ profile })
  } catch (error) {
    console.error("Unexpected error in profile GET:", error)
    return errorResponse("Error retrieving profile data", 500)
  }
})

export const PUT = createApiHandler(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, lastname, email, avatar } = body

    console.log("Profile update request:", { name, lastname, email, avatar })

    const supabase = await getSupabaseServer()

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return errorResponse("Not authenticated", 401)
    }

    // Get admin client
    const supabaseAdmin = await getSupabaseAdmin()

    // Prepare updates object
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updates.name = name
    if (lastname !== undefined) updates.lastname = lastname
    if (avatar !== undefined) updates.avatar = avatar

    console.log("Updating profile with:", updates)

    // Update profile in the database using admin client to bypass RLS
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return errorResponse(updateError.message, 400)
    }

    console.log("Profile updated successfully:", updateData)

    // If email is changing, update email in auth
    let emailUpdateResult = null
    if (email && email !== session.user.email) {
      console.log("Updating email from", session.user.email, "to", email)

      const { data: emailData, error: emailError } = await supabase.auth.updateUser({
        email: email,
      })

      if (emailError) {
        console.error("Error updating email in auth:", emailError)
        return errorResponse(emailError.message, 400)
      }

      emailUpdateResult = emailData
      console.log("Email update initiated:", emailUpdateResult)

      // Also update email in profiles table using admin client
      const { error: emailUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({ email })
        .eq("id", session.user.id)

      if (emailUpdateError) {
        console.error("Error updating email in profile:", emailUpdateError)
        // Continue anyway as the auth email update is more important
      }
    }

    // Update auth metadata as well
    if (name !== undefined || lastname !== undefined) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: name,
          lastname: lastname,
        },
      })

      if (metadataError) {
        console.error("Error updating auth metadata:", metadataError)
        // Continue anyway as this is not critical
      }
    }

    return successResponse({
      success: true,
      emailUpdated: !!emailUpdateResult,
    })
  } catch (error: any) {
    console.error("Unexpected error in profile PUT:", error)
    return errorResponse(error?.message || "Error updating profile data", 500)
  }
})
