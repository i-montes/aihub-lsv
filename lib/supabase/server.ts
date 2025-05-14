import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

// Cliente para operaciones del lado del servidor (con autenticación de usuario)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Cliente con rol de servicio para operaciones administrativas
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY no está definido")
    // Fallback al cliente normal si no hay service role key
    return createServerClient()
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
}
