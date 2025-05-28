import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { email, password, name, lastname } = body

  if (!email || !password) {
    return errorResponse("Email and password are required", 400)
  }

  const supabase = getSupabaseServer()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        lastname,
        role: "USER",
      },
    },
  })

  if (error) {
    return errorResponse(error.message, 400)
  }

  // If there's a session, the user is automatically signed in
  if (data.session) {
    // Create a profile if it doesn't exist
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user!.id,
      email,
      name,
      lastname,
      role: "USER",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
    }
  }

  return successResponse({
    user: data.user,
    session: data.session,
  })
})
