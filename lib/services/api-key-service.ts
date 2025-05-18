import { api } from "@/lib/api-client"
import type { Database } from "@/lib/supabase/database.types.ts"

export type ApiKey = Database["public"]["Tables"]["api_key_table"]["Row"]
export type ApiKeyProvider = Database["public"]["Enums"]["provider_ai"]
export type ApiKeyStatus = Database["public"]["Enums"]["api_key_status"]

export const ApiKeyService = {
  /**
   * Obtiene todas las claves API de la organización actual
   */
  async getApiKeys(): Promise<{ apiKeys: ApiKey[] }> {
    try {
      const response = await api.get("/integrations")
      return response.data
    } catch (error) {
      console.error("Error al obtener claves API:", error)
      return { apiKeys: [] }
    }
  },

  /**
   * Obtiene las claves API filtradas por proveedor
   */
  async getApiKeysByProvider(provider: ApiKeyProvider): Promise<{ apiKeys: ApiKey[] }> {
    try {
      const response = await api.get(`/integrations?provider=${provider}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener claves API para ${provider}:`, error)
      return { apiKeys: [] }
    }
  },

  /**
   * Crea una nueva clave API
   */
  async createApiKey(data: {
    key: string
    provider: ApiKeyProvider
    models?: string[]
    id_channel?: string
  }): Promise<{ success: boolean; apiKey: ApiKey | null }> {
    try {
      const response = await api.post("/integrations", data)
      return response.data
    } catch (error) {
      console.error("Error al crear clave API:", error)
      throw error
    }
  },

  /**
   * Actualiza el estado de una clave API
   */
  async updateApiKeyStatus(id: string, status: ApiKeyStatus): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.patch(`/integrations/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error("Error al actualizar estado de clave API:", error)
      throw error
    }
  },

  /**
   * Elimina una clave API
   */
  async deleteApiKey(id: string): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`/integrations/${id}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar clave API:", error)
      throw error
    }
  },

  /**
   * Verifica si una clave API es válida
   */
  async verifyApiKey(data: {
    key: string
    provider: ApiKeyProvider
  }): Promise<{ valid: boolean; models?: string[] }> {
    try {
      const response = await api.post("/integrations/verify", data)
      return response.data
    } catch (error) {
      console.error("Error al verificar clave API:", error)
      return { valid: false }
    }
  },
}
