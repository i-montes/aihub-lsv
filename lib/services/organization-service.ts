import { api } from "@/lib/api-client"
import type { Profile } from "./auth-service"

export interface Organization {
  id: string
  name: string
  address: string | null
  city: string | null
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
    address?: string
    city?: string
    country?: string
  }): Promise<{ success: boolean }> {
    return api.put("/organization", data)
  },

  async getMembers(): Promise<{ members: Profile[] }> {
    return api.get("/organization/members")
  },
}
