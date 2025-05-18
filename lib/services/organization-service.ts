import { api } from "@/lib/api-client"
import type { Profile } from "./auth-service"

export interface Organization {
  id: string
  name: string
  description: string | null
  website: string | null
  contactemail: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  logo: string | null
  createdAt: string
  updatedAt: string
}

export interface PendingInvitation {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

export const OrganizationService = {
  async getOrganization(): Promise<{ organization: Organization | null }> {
    try {
      const response = await api.get("/organization")
      return response.data
    } catch (error) {
      console.error("Error getting organization:", error)
      return { organization: null }
    }
  },

  async updateOrganization(data: {
    name: string
    description?: string
    website?: string
    contactemail?: string
    address?: string
    city?: string
    state?: string
    country?: string
  }): Promise<{ success: boolean }> {
    try {
      const response = await api.put("/organization", data)
      return response.data
    } catch (error) {
      console.error("Error updating organization:", error)
      throw error
    }
  },

  async getMembers(): Promise<{ members: Profile[] }> {
    try {
      const response = await api.get("/organization/members")
      return response.data
    } catch (error) {
      console.error("Error getting members:", error)
      return { members: [] }
    }
  },

  async getPendingInvitations(): Promise<{ invitations: PendingInvitation[] }> {
    try {
      const response = await api.get("/organization/invitations")
      return response.data
    } catch (error) {
      console.error("Error getting pending invitations:", error)
      return { invitations: [] }
    }
  },

  async resendInvitation(invitationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/organization/invitations/${invitationId}/resend`)
      return response.data
    } catch (error) {
      console.error("Error resending invitation:", error)
      throw error
    }
  },

  async cancelInvitation(invitationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/organization/invitations/${invitationId}`)
      return response.data
    } catch (error) {
      console.error("Error canceling invitation:", error)
      throw error
    }
  },
}
