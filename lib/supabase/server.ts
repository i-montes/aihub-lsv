import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

// Verificación simple de configuración
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Obtiene el cliente de Supabase para componentes del servidor
 * Esta función es segura para usar en componentes del servidor de React
 */
export async function getSupabaseServer() {
  try {
    // Si Supabase no está configurado, devolver un cliente simulado
    if (!isSupabaseConfigured) {
      console.warn("[Server] Supabase no está configurado. Usando cliente simulado.")
      return createDummyClient()
    }

    // Crear una nueva instancia para cada solicitud (esto es seguro en el servidor)
    const cookieStore = await cookies()
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )
  } catch (error) {
    console.error("[Server] Error al crear el cliente de Supabase:", error)
    return createDummyClient()
  }
}

/**
 * Obtiene el cliente de Supabase con la clave de servicio para operaciones administrativas
 * Esta función debe usarse con precaución y solo para operaciones que requieren privilegios elevados
 */
export async function getSupabaseAdmin() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("[Server] Clave de servicio de Supabase no configurada. Usando cliente simulado.")
      return createDummyClient()
    }

    return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("[Server] Error al crear el cliente admin de Supabase:", error)
    return createDummyClient()
  }
}

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
export type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServer>>
