import { api } from "@/lib/api-client"

export interface Content {
  id: string
  title: string
  description: string | null
  userId: string
  organizationId: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export const ContentService = {
  async getContents(filter?: string): Promise<{ contents: Content[] }> {
    const queryParams = filter ? `?filter=${filter}` : ""
    return api.get(`/content${queryParams}`)
  },

  async getContent(id: string): Promise<{ content: Content }> {
    return api.get(`/content/${id}`)
  },

  async createContent(data: { title: string; description?: string }): Promise<{ success: boolean }> {
    return api.post("/content", data)
  },

  async updateContent(id: string, data: { title: string; description?: string }): Promise<{ success: boolean }> {
    return api.put(`/content/${id}`, data)
  },

  async deleteContent(id: string): Promise<{ success: boolean }> {
    return api.delete(`/content/${id}`)
  },
}
