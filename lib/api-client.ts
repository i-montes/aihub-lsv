/**
 * Utility function for making API requests
 */

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: any
  headers?: Record<string, string>
  cache?: RequestCache
}

/**
 * Wrapper around fetch to handle API requests with error handling and JSON parsing
 */
export async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, cache } = options

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    credentials: "include", // Importante para incluir cookies
    cache,
  }

  if (body) {
    // Asegurarse de que el body sea serializable
    try {
      config.body = JSON.stringify(body)
    } catch (error) {
      console.error("Error al serializar el body:", error)
      throw new Error("Error al procesar los datos de la solicitud")
    }
  }

  try {
    const response = await fetch(`/api${endpoint}`, config)

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (contentType && !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      return response as any
    }

    // Parse JSON response
    const data = await response.json()

    // Handle API errors
    if (!response.ok) {
      const error = new Error(data.error || response.statusText)
      // Añadir información adicional al error
      ;(error as any).status = response.status
      ;(error as any).data = data
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error)
    throw error
  }
}

/**
 * HTTP method wrappers for easier API calls
 */
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchApi<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body: any, options?: Omit<FetchOptions, "method">) =>
    fetchApi<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = any>(endpoint: string, body: any, options?: Omit<FetchOptions, "method">) =>
    fetchApi<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T = any>(endpoint: string, body: any, options?: Omit<FetchOptions, "method">) =>
    fetchApi<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T = any>(endpoint: string, options?: Omit<FetchOptions, "method">) =>
    fetchApi<T>(endpoint, { ...options, method: "DELETE" }),
}
