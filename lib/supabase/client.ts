"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types.ts"

// Variable para almacenar la instancia del cliente
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

/**
 * Obtiene una instancia singleton del cliente de Supabase para componentes del cliente
 * Esta función garantiza que solo se cree una instancia del cliente en el navegador
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    try {
      supabaseClient = createClientComponentClient<Database>()
      if (process.env.NODE_ENV !== "production") {
        console.log("[Client] Creando nueva instancia de Supabase client")
      }
    } catch (error) {
      console.error("[Client] Error al crear el cliente de Supabase:", error)
      // Devolver un cliente simulado en caso de error
      return createDummyClient()
    }
  }
  return supabaseClient
}

/**
 * Crea un cliente simulado para desarrollo y pruebas
 * cuando hay un error al crear el cliente real
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
  } as ReturnType<typeof createClientComponentClient<Database>>
}

// Exportar el tipo para facilitar su uso en otros archivos
export type SupabaseClient = ReturnType<typeof getSupabaseClient>
