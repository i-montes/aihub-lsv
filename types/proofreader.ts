export type SuggestionType = "spelling" | "grammar" | "style"

export type Suggestion = {
  id: string
  type: SuggestionType
  original: string
  suggestion: string
  explanation: string
  startIndex: number
  endIndex: number
  severity: number // 1-3, where 1 is minor, 3 is critical
}

export type WordPressPost = {
  id: number
  title: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  content: {
    rendered: string
  }
  link: string
  date: string
}

export type WordPressConnection = {
  id: string
  organizationId: string
  url: string
  username?: string
  password?: string
  active: boolean
  apiKey?: string
  siteName?: string
  createdAt: string
  site_url: string
}
