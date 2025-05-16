import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

// Verificación simple de configuración
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Obtiene el cliente de Supabase para componentes del servidor
 * Esta función es segura para usar en componentes del servidor de React
 */
export function getSupabaseServer() {
  try {
    // Si Supabase no está configurado, devolver un cliente simulado
    if (!isSupabaseConfigured) {
      console.warn("[Server] Supabase no está configurado. Usando cliente simulado.")
      return createDummyClient()
    }

    // Crear una nueva instancia para cada solicitud (esto es seguro en el servidor)
    const cookieStore = cookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } catch (error) {
    console.error("[Server] Error al crear el cliente de Supabase:", error)
    return createDummyClient()
  }
}

/**
 * Obtiene el cliente de Supabase para Route Handlers y Server Actions
 * Esta función es segura para usar en Route Handlers y Server Actions
 */
export function getSupabaseRouteHandler() {
  try {
    // Si Supabase no está configurado, devolver un cliente simulado
    if (!isSupabaseConfigured) {
      console.warn("[Server] Supabase no está configurado. Usando cliente simulado.")
      return createDummyClient()
    }

    // Crear una nueva instancia para cada solicitud (esto es seguro en el servidor)
    const cookieStore = cookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } catch (error) {
    console.error("[Server] Error al crear el cliente de Supabase:", error)
    return createDummyClient()
  }
}

/**
 * Crea un cliente simulado para desarrollo y pruebas
 * cuando Supabase no está configurado
 */
function createDummyClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: null, error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  } as any
}

// Exportar el tipo para facilitar su uso en otros archivos
export type SupabaseServerClient = ReturnType<typeof getSupabaseServer>
