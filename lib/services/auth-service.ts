import { api } from "@/lib/api-client"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  lastname: string
}

export interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    lastname?: string
    avatar?: string
    role?: string
    organizationId?: string
  }
}

export interface Profile {
  id: string
  email: string
  name: string | null
  lastname: string | null
  avatar: string | null
  role: string | null
  organizationId: string | null
}

export interface AuthResponse {
  user: User
  profile?: Profile | null
  session?: any
}

export const AuthService = {
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post("/auth/login", credentials)
  },

  async signUp(data: RegisterData): Promise<AuthResponse> {
    return api.post("/auth/register", data)
  },

  async signOut(): Promise<{ success: boolean }> {
    return api.post("/auth/logout", {})
  },

  async resetPassword(email: string, redirectTo?: string): Promise<{ success: boolean }> {
    return api.post("/auth/reset-password", { email, redirectTo })
  },

  async updatePassword(password: string): Promise<{ success: boolean }> {
    return api.post("/auth/update-password", { password })
  },

  async getProfile(): Promise<{ profile: Profile | null }> {
    return api.get("/profile/get")
  },

  async updateProfile(profileData: Partial<Profile>): Promise<{ success: boolean; emailUpdated?: boolean }> {
    return api.put("/profile", profileData)
  },
}
