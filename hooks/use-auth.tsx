"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import type { User as ProfileUser } from "@/lib/supabase/database.types"

type AuthContextType = {
  user: User | null
  profile: ProfileUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, lastname: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()
  const router = useRouter()

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      // First, create a basic profile from the session user
      if (session?.user) {
        const { id, email, user_metadata } = session.user

        // Create a basic profile from session data
        const basicProfile: ProfileUser = {
          id,
          email: email || "",
          name: user_metadata?.name || null,
          lastname: user_metadata?.lastname || null,
          avatar: user_metadata?.avatar || null,
          role: user_metadata?.role || "USER",
          organizationId: user_metadata?.organizationId || null,
        }

        setProfile(basicProfile)
      }

      // Then try to get additional profile data if available
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, name, lastname, avatar, role, organizationId")
          .eq("id", userId)
          .single()

        if (!error && data) {
          setProfile(data as ProfileUser)
        }
      } catch (profileError) {
        console.log("Could not fetch extended profile data, using basic data instead")
      }
    } catch (error) {
      console.error("Error creating basic profile:", error)
    }
  }

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        }

        // Set up auth state change listener
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange(async (_event, session) => {
          setSession(session)
          setUser(session?.user || null)

          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }

          router.refresh()
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        toast.error("Error initializing authentication")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setSession(data.session)
      setUser(data.user)

      if (data.user) {
        await fetchProfile(data.user.id)
      }

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            lastname,
            role: "USER", // Default role
          },
        },
      })

      if (error) {
        throw error
      }

      toast.success("Cuenta creada exitosamente")

      // If email confirmation is required
      if (data.session === null) {
        toast.info("Por favor revisa tu correo para confirmar tu cuenta")
        router.push("/login")
      } else {
        setSession(data.session)
        setUser(data.user)

        if (data.user) {
          // Create a basic profile from user metadata
          const profileData: ProfileUser = {
            id: data.user.id,
            email: email,
            name: name,
            lastname: lastname,
            role: "USER",
            avatar: null,
            organizationId: null,
          }

          setProfile(profileData)
        }

        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Error signing up:", error)
      toast.error(error.message || "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      })

      if (error) {
        throw error
      }

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
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

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
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
