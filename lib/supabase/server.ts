import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export function getSupabaseServer() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // El error aquí es esperado cuando se llama desde un Server Component
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // El error aquí es esperado cuando se llama desde un Server Component
        }
      },
    },
  })
}

// Función para Route Handlers
export function getSupabaseRouteHandler() {
  return createRouteHandlerClient({ cookies })
}
