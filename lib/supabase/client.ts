"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "../database.types"

// Implementamos el patrón singleton para evitar múltiples instancias del cliente
let supabase: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }
  return supabase
}

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const supabase = getSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user || null
}

// Función para obtener la sesión actual
export const getSession = async () => {
  const supabase = getSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// Función para suscribirse a cambios en la autenticación
export const subscribeToAuthChanges = (
  callback: (event: "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED" | "TOKEN_REFRESHED", session: any) => void,
) => {
  const supabase = getSupabaseClient()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)
  return subscription
}

// Exportamos el cliente directamente para casos de uso específicos
export const supabaseClient = getSupabaseClient()
