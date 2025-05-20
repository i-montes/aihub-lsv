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
}
