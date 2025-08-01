import { api } from "@/lib/api-client"

export type User = {
  id: string
  email: string
  user_metadata?: Record<string, any>
}

export type Profile = {
  id: string
  email: string | null
  name: string | null
  lastname: string | null
  avatar: string | null
  role: string | null
  organizationId: string | null
}

export type Session = {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  email: string
  password: string
  name: string
  lastname: string
}

export type AuthError = {
  message: string
  code: string
}

export const AuthService = {
  async signIn(
    credentials: LoginCredentials,
  ): Promise<{ user: User; profile: Profile | null; session: Session | null }> {
    try {
      const response = await api.post("/auth/login", credentials)
      return response.data
    } catch (error: any) {
      console.error("Error in AuthService.signIn:", error)

      // Si el error tiene un mensaje específico, usarlo
      if (error.message) {
        throw error
      }

      // Si no, lanzar un error genérico
      throw new Error("Error al iniciar sesión")
    }
  },

  async signUp(data: RegisterData): Promise<{ user: User; session: Session | null } | { error: AuthError }> {
    try {
      // Volver a usar la implementación original con api.post
      const response = await api.post("/auth/register", data)

      // Verificar que la respuesta tenga datos
      if (!response || !response.data) {
        return {
          error: {
            message: "No se recibió respuesta del servidor",
            code: "EMPTY_RESPONSE",
          },
        }
      }

      return response.data
    } catch (error: any) {
      console.error("Error in AuthService.signUp:", error)

      // Extraer el código de error y el mensaje si están disponibles
      const errorMessage = error.response?.data?.error || error.message || "Error al crear la cuenta"
      const errorCode = error.response?.data?.errorCode || "UNKNOWN_ERROR"

      return {
        error: {
          message: errorMessage,
          code: errorCode,
        },
      }
    }
  },

  async signOut(): Promise<void> {
    await api.post("/auth/logout", {})
  },

  async resetPassword(email: string, redirectTo: string): Promise<void> {
    await api.post("/auth/reset-password", { email, redirectTo })
  },

  async updatePassword(code: string, newPassword: string, confirmPassword: string): Promise<void> {
    await api.put("/auth/reset-password/update", { code, newPassword, confirmPassword })
  },

  async getProfile(): Promise<{ profile: Profile }> {
    const response = await api.get("/profile")
    return response.data
  },
}
