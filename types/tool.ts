export interface Tool {
  id: number | string
  title: string
  description: string
  tags: string[]
  favorite: boolean
  usageCount: number
  lastUsed: string
  isDefault?: boolean
  identity?: string
  schema?: any
  prompts?: any
  temperature?: number
  topP?: number
  /** Cuánto razona el modelo: OpenAI `reasoningEffort`, Anthropic `effort` */
  reasoningEffort?: string
  /** Longitud y detalle de la respuesta. Sólo lo aplica OpenAI */
  verbosity?: string
  models?: {
    provider: string
    model: string
  }[]
}

/** Niveles de esfuerzo de razonamiento por proveedor */
export const REASONING_EFFORTS = ["low", "medium", "high", "xhigh"] as const

/** Niveles de verbosidad (OpenAI) */
export const VERBOSITY_LEVELS = ["low", "medium", "high"] as const

export const DEFAULT_REASONING_EFFORT = "medium"
export const DEFAULT_VERBOSITY = "medium"
