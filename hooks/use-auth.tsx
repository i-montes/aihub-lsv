"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthService, type User, type Profile, type Session, type AuthError } from "@/lib/services/auth-service"
import { Organization } from "@/lib/services/organization-service"

// Definir el tipo para el contexto de autenticación
type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    name: string,
    lastname: string,
  ) => Promise<{ success: boolean; error?: AuthError }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (code: string, newPassword: string, confirmPassword: string) => Promise<void>
  isLoading: boolean
  organization: Organization | null
}

// Crear el contexto con valores por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  isLoading: false,
  organization: null,
})

export const useAuth = () => useContext(AuthContext)

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
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
              const { profile, organization } = await AuthService.getProfile()
              setProfile(profile)
              setOrganization(organization)
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

      return { success: true }
    } catch (error: any) {
      console.error("Error signing in:", error)
      toast.error(error.message || "Error al iniciar sesión")
      return { success: false, error: error.message || "Error al iniciar sesión" }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, lastname: string) => {
    setIsLoading(true)
    try {
      const result = await AuthService.signUp({ email, password, name, lastname })
      console.log("Signup result:", result) // Añadir para depuración

      // Verificar si hay un error en la respuesta
      if (!result) {
        // Si result es undefined, devolver un error genérico
        return {
          success: false,
          error: {
            message: "Error en el servidor. Por favor, inténtalo de nuevo más tarde.",
            code: "SERVER_ERROR",
          },
        }
      }

      if ("error" in result) {
        // No mostramos toast aquí para permitir que el componente lo maneje
        return {
          success: false,
          error: result.error,
        }
      }

      // Si llegamos aquí, tenemos un resultado exitoso
      const { user, session } = result

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
      return { success: true }
    } catch (error: any) {
      console.error("Error signing up:", error)

      // Crear un objeto de error con código genérico
      const authError: AuthError = {
        message: error.message || "Error al crear la cuenta",
        code: "UNKNOWN_ERROR",
      }

      return {
        success: false,
        error: authError,
      }
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

  const updatePassword = async (code: string, newPassword: string, confirmPassword: string) => {
    setIsLoading(true)
    try {
      await AuthService.updatePassword(code, newPassword, confirmPassword)

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
    organization,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
