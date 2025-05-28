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

export const AuthService = {
  async signIn(
    credentials: LoginCredentials,
  ): Promise<{ user: User; profile: Profile | null; session: Session | null }> {
    try {
      const response = await api.post("/auth/login", credentials)
      return response.data
    } catch (error) {
      console.error("Error in AuthService.signIn:", error)
      throw error
    }
  },

  async signUp(data: RegisterData): Promise<{ user: User; session: Session | null }> {
    const response = await api.post("/auth/register", data)
    return response.data
  },

  async signOut(): Promise<void> {
    await api.post("/auth/logout", {})
  },

  async resetPassword(email: string, redirectTo: string): Promise<void> {
    await api.post("/auth/reset-password", { email, redirectTo })
  },

  async updatePassword(password: string): Promise<void> {
    await api.post("/auth/update-password", { password })
  },

  async getProfile(): Promise<{ profile: Profile }> {
    const response = await api.get("/profile")
    return response.data
  },
}
