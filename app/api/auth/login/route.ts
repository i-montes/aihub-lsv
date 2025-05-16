import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return errorResponse("Email and password are required", 400)
  }

  const supabase = await getSupabaseServer()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase auth error:", error)
      return errorResponse(error.message, 401)
    }

    if (!data.session) {
      console.error("No session returned from Supabase")
      return errorResponse("No se pudo establecer la sesión", 500)
    }

    // Usar los metadatos del usuario en lugar de consultar la tabla profiles
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

    // Devolver la sesión completa
    return successResponse({
      user: data.user,
      profile,
      session: data.session,
    })
  } catch (error: any) {
    console.error("Unexpected error during login:", error)
    return errorResponse(error.message || "Error durante el inicio de sesión", 500)
  }
})
