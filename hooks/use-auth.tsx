"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthService, type User, type Profile, type Session } from "@/lib/services/auth-service"

// Definir el tipo para el contexto de autenticación
type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, lastname: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

// Crear el contexto con valores por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  isLoading: false,
  refreshProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Inicializar el estado de autenticación
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      try {
        // Enviar petición para obtener la sesión actual
        const response = await fetch("/api/auth/session", {
          credentials: "include", // Importante: incluir las cookies en la petición
        })

        if (response.ok) {
          const { data } = await response.json()

          if (data?.user) {
            setUser(data.user)
            setSession(data.session)

            // Obtener datos del perfil
            try {
              const { profile } = await AuthService.getProfile()
              setProfile(profile)
            } catch (error) {
              console.error("Failed to load profile:", error)
            }
          } else {
            setUser(null)
            setProfile(null)
            setSession(null)
          }
        } else {
          setUser(null)
          setProfile(null)
          setSession(null)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setUser(null)
        setProfile(null)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    const handleAuthUpdate = async () => {
      // Recargar el perfil cuando se dispare el evento auth-update
      await refreshProfile()
    }

    // Añadir el event listener
    window.addEventListener("auth-update", handleAuthUpdate)

    // Limpiar el event listener
    return () => {
      window.removeEventListener("auth-update", handleAuthUpdate)
    }
  }, [])

  const refreshProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()
      if (data.success && data.profile) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error("Error refreshing profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await AuthService.signIn({ email, password })
      console.log("Login result:", result) // Añadir para depuración

      // Verificar que tenemos todos los datos necesarios
      if (!result.user) {
        throw new Error("No se recibieron datos del usuario")
      }

      // No lanzar error si no hay sesión, solo registrar en consola
      if (!result.session) {
        console.warn("No se recibió sesión del servidor, pero continuamos con el login")
      }

      setUser(result.user)
      setProfile(result.profile || null)
      setSession(result.session)

      toast.success("Inicio de sesión exitoso")

      // Importante: Agregamos una pequeña pausa para asegurar que las cookies sean establecidas
      // antes de redirigir al dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 300) // Aumentamos el tiempo de espera a 300ms
    } catch (error: any) {
      console.error("Error signing in:", error)
      toast.error(error.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, lastname: string) => {
    setIsLoading(true)
    try {
      const { user, session } = await AuthService.signUp({ email, password, name, lastname })

      if (!session) {
        toast.info("Por favor revisa tu correo para confirmar tu cuenta")
        router.push("/login")
      } else {
        setUser(user)
        setSession(session)

        // Crear un perfil básico a partir de los metadatos del usuario
        const profileData: Profile = {
          id: user.id,
          email,
          name,
          lastname,
          role: "USER",
          avatar: null,
          organizationId: null,
        }

        setProfile(profileData)

        // Añadimos una pequeña pausa antes de la redirección
        setTimeout(() => {
          router.push("/dashboard")
        }, 300)
      }

      toast.success("Cuenta creada exitosamente")
    } catch (error: any) {
      console.error("Error signing up:", error)
      toast.error(error.message || "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await AuthService.signOut()

      setUser(null)
      setProfile(null)
      setSession(null)

      toast.success("Sesión cerrada exitosamente")
      router.push("/login")
    } catch (error: any) {
      console.error("Error signing out:", error)
      toast.error(error.message || "Error al cerrar sesión")
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      await AuthService.resetPassword(email, `${window.location.origin}/reset-password/update`)

      toast.success("Instrucciones enviadas a tu correo")
    } catch (error: any) {
      console.error("Error resetting password:", error)
      toast.error(error.message || "Error al enviar instrucciones")
    } finally {
      setIsLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    setIsLoading(true)
    try {
      await AuthService.updatePassword(password)

      toast.success("Contraseña actualizada exitosamente")
      router.push("/login")
    } catch (error: any) {
      console.error("Error updating password:", error)
      toast.error(error.message || "Error al actualizar contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isLoading,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
