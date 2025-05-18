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
    const response = await api.get("/organization")
    return response.data
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
    return api.put("/organization", data)
  },

  async getMembers(): Promise<{ members: Profile[] }> {
    const response = await api.get("/organization/members")
    return response.data
  },

  async getPendingInvitations(): Promise<{ invitations: PendingInvitation[] }> {
    const response = await api.get("/organization/invitations")
    return response.data
  },

  async resendInvitation(invitationId: string): Promise<{ success: boolean }> {
    const response = await api.post(`/organization/invitations/${invitationId}/resend`)
    return response.data
  },

  async cancelInvitation(invitationId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/organization/invitations/${invitationId}`)
    return response.data
  },
}
