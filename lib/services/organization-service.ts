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

export const OrganizationService = {
  async getOrganization(): Promise<{ organization: Organization | null }> {
    return api.get("/organization")
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
    return api.get("/organization/members")
  },
}
