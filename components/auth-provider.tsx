"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabaseClient, subscribeToAuthChanges } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Definir el tipo para el perfil de usuario extendido
type UserProfile = User & {
  name?: string | null
  lastname?: string | null
  avatar?: string | null
  role?: Database["public"]["Enums"]["role"]
  organizationId?: string | null
}

// Definir el tipo para el contexto de autenticación
type AuthContextType = {
  user: UserProfile | null
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
})

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext)

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Database["public"]["Tables"]["profiles"]["Row"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Función para obtener el usuario y su perfil
    const fetchUserAndProfile = async () => {
      setIsLoading(true)
      const supabase = getSupabaseClient()

      // Obtener la sesión actual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)

        // Obtener el perfil del usuario desde la tabla personalizada
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(userProfile)
      } else {
        setUser(null)
        setProfile(null)
      }

      setIsLoading(false)
    }

    // Obtener el usuario inicial
    fetchUserAndProfile()

    // Suscribirse a cambios en la autenticación
    const subscription = subscribeToAuthChanges(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser(session.user)

          // Obtener el perfil del usuario
          const supabase = getSupabaseClient()
          const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          setProfile(userProfile)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      } else if (event === "USER_UPDATED") {
        setUser(session?.user || null)
      }

      setIsLoading(false)
    })

    // Limpiar la suscripción al desmontar
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Valor del contexto
  const value = {
    user: user as UserProfile | null,
    profile,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
