export interface Tool {
  id: number
  title: string
  description: string
  tags: string[]
  category: string
  favorite: boolean
  usageCount: number
  lastUsed: string
}
