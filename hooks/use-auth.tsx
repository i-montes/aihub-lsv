"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthService, type User, type Profile } from "@/lib/services/auth-service"

// Define the type for the authentication context
type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, lastname: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  isLoading: boolean
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  isLoading: false,
})

export const useAuth = () => useContext(AuthContext)

// Authentication provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      try {
        // Send request to get current session
        const response = await fetch("/api/auth/session")

        if (response.ok) {
          const { data } = await response.json()

          if (data?.user) {
            setUser(data.user)

            // Get profile data
            try {
              const { profile } = await AuthService.getProfile()
              setProfile(profile)
            } catch (error) {
              console.error("Failed to load profile:", error)
            }
          } else {
            setUser(null)
            setProfile(null)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { user, profile } = await AuthService.signIn({ email, password })

      setUser(user)
      setProfile(profile || null)

      toast.success("Inicio de sesión exitoso")
      router.push("/dashboard")
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

        // Create a basic profile from user metadata
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

        router.push("/dashboard")
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
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
