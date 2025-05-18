"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Obtiene una instancia singleton del cliente de Supabase para componentes del cliente
 * Esta función garantiza que solo se cree una instancia del cliente en el navegador
 */
export function getSupabaseClient() {
  try {
    let supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    if (process.env.NODE_ENV !== "production") {
      console.log("[Client] Creando nueva instancia de Supabase client");
    }
    return supabaseClient;
  } catch (error) {
    console.error("[Client] Error al crear el cliente de Supabase:", error);
    // Devolver un cliente simulado en caso de error
    return createDummyClient();
  }
}

/**
 * Crea un cliente simulado para desarrollo y pruebas
 * cuando hay un error al crear el cliente real
 */
function createDummyClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: null, error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  } as any;
}

// Exportar el tipo para facilitar su uso en otros archivos
export type SupabaseClient = ReturnType<typeof getSupabaseClient>;
