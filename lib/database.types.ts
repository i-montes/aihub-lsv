export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      account: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id: string
          id_token?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity: {
        Row: {
          action: string
          createdAt: string
          details: Json
          id: string
          userId: string
        }
        Insert: {
          action: string
          createdAt: string
          details: Json
          id: string
          userId: string
        }
        Update: {
          action?: string
          createdAt?: string
          details?: Json
          id?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_table: {
        Row: {
          createdAt: string
          id: string
          id_channel: string | null
          key: string
          models: string[] | null
          organizationId: string
          provider: Database["public"]["Enums"]["provider_ai"]
          status: Database["public"]["Enums"]["api_key_status"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          id_channel?: string | null
          key: string
          models?: string[] | null
          organizationId: string
          provider: Database["public"]["Enums"]["provider_ai"]
          status?: Database["public"]["Enums"]["api_key_status"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          id_channel?: string | null
          key?: string
          models?: string[] | null
          organizationId?: string
          provider?: Database["public"]["Enums"]["provider_ai"]
          status?: Database["public"]["Enums"]["api_key_status"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_key_table_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          contentType: Database["public"]["Enums"]["content_type"]
          createdAt: string
          description: string | null
          id: string
          organizationId: string
          publishedAt: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updatedAt: string
          userId: string
        }
        Insert: {
          contentType: Database["public"]["Enums"]["content_type"]
          createdAt?: string
          description?: string | null
          id: string
          organizationId: string
          publishedAt?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updatedAt: string
          userId: string
        }
        Update: {
          contentType?: Database["public"]["Enums"]["content_type"]
          createdAt?: string
          description?: string | null
          id?: string
          organizationId?: string
          publishedAt?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_metrics: {
        Row: {
          contentId: string
          createdAt: string
          id: string
          likes: number
          revisions: number
          shares: number
          updatedAt: string
        }
        Insert: {
          contentId: string
          createdAt?: string
          id: string
          likes?: number
          revisions?: number
          shares?: number
          updatedAt: string
        }
        Update: {
          contentId?: string
          createdAt?: string
          id?: string
          likes?: number
          revisions?: number
          shares?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_metrics_contentId_fkey"
            columns: ["contentId"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_version: {
        Row: {
          contentId: string
          createdAt: string
          data: Json
          id: string
          versionNumber: number
        }
        Insert: {
          contentId: string
          createdAt?: string
          data: Json
          id: string
          versionNumber: number
        }
        Update: {
          contentId?: string
          createdAt?: string
          data?: Json
          id?: string
          versionNumber?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_version_contentId_fkey"
            columns: ["contentId"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice: {
        Row: {
          amount: number
          currency: string
          dueDate: string
          id: string
          invoiceNumber: string
          issuedDate: string
          paidDate: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subscriptionId: string
        }
        Insert: {
          amount: number
          currency?: string
          dueDate: string
          id: string
          invoiceNumber: string
          issuedDate: string
          paidDate?: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subscriptionId: string
        }
        Update: {
          amount?: number
          currency?: string
          dueDate?: string
          id?: string
          invoiceNumber?: string
          issuedDate?: string
          paidDate?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscriptionId?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_subscriptionId_fkey"
            columns: ["subscriptionId"]
            isOneToOne: false
            referencedRelation: "subscription"
            referencedColumns: ["id"]
          },
        ]
      }
      organization: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          createdAt: string
          id: string
          logo: string | null
          name: string
          updatedAt: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          createdAt?: string
          id?: string
          logo?: string | null
          name: string
          updatedAt: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          createdAt?: string
          id?: string
          logo?: string | null
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          lastname: string | null
          name: string | null
          organizationId: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at: string
          email: string
          id: string
          lastname?: string | null
          name?: string | null
          organizationId?: string | null
          role?: string | null
          updated_at: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          lastname?: string | null
          name?: string | null
          organizationId?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          content: string
          createdAt: string
          id: string
          isPublic: boolean
          name: string
          organizationId: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          content: string
          createdAt: string
          id: string
          isPublic?: boolean
          name: string
          organizationId?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          content?: string
          createdAt?: string
          id?: string
          isPublic?: boolean
          name?: string
          organizationId?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          author: string
          createdAt: string
          description: string | null
          id: string
          organizationId: string
          status: Database["public"]["Enums"]["resource_status"]
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updatedAt: string
          url: string
        }
        Insert: {
          author: string
          createdAt?: string
          description?: string | null
          id: string
          organizationId: string
          status?: Database["public"]["Enums"]["resource_status"]
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updatedAt: string
          url: string
        }
        Update: {
          author?: string
          createdAt?: string
          description?: string | null
          id?: string
          organizationId?: string
          status?: Database["public"]["Enums"]["resource_status"]
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          updatedAt?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription: {
        Row: {
          amount: number
          billingCycle: Database["public"]["Enums"]["billing_cycle"]
          createdAt: string
          currency: string
          endDate: string | null
          id: string
          organizationId: string
          plan: string
          startDate: string
          status: Database["public"]["Enums"]["subscription_status"]
          updatedAt: string
        }
        Insert: {
          amount: number
          billingCycle: Database["public"]["Enums"]["billing_cycle"]
          createdAt?: string
          currency?: string
          endDate?: string | null
          id: string
          organizationId: string
          plan: string
          startDate: string
          status: Database["public"]["Enums"]["subscription_status"]
          updatedAt: string
        }
        Update: {
          amount?: number
          billingCycle?: Database["public"]["Enums"]["billing_cycle"]
          createdAt?: string
          currency?: string
          endDate?: string | null
          id?: string
          organizationId?: string
          plan?: string
          startDate?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preference: {
        Row: {
          createdAt: string
          emailNotifications: boolean
          id: string
          language: string
          theme: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt: string
          emailNotifications?: boolean
          id: string
          language?: string
          theme?: string
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          emailNotifications?: boolean
          id?: string
          language?: string
          theme?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preference_userId_fkey"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wordpress_integration_table: {
        Row: {
          active: boolean
          api_path: string
          createdAt: string
          id: string
          organizationId: string
          password: string
          permissions: Json | null
          site_name: string | null
          site_url: string
          updatedAt: string
          username: string
        }
        Insert: {
          active?: boolean
          api_path: string
          createdAt?: string
          id: string
          organizationId: string
          password: string
          permissions?: Json | null
          site_name?: string | null
          site_url: string
          updatedAt: string
          username: string
        }
        Update: {
          active?: boolean
          api_path?: string
          createdAt?: string
          id?: string
          organizationId?: string
          password?: string
          permissions?: Json | null
          site_name?: string | null
          site_url?: string
          updatedAt?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "wordpress_integration_table_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      writing_assistant: {
        Row: {
          additionalContext: string | null
          contentId: string
          generatedContent: string
          id: string
          imageUrls: string[] | null
          model: string
          rating: string | null
          topic: string
          verificationMethod: string | null
        }
        Insert: {
          additionalContext?: string | null
          contentId: string
          generatedContent: string
          id: string
          imageUrls?: string[] | null
          model: string
          rating?: string | null
          topic: string
          verificationMethod?: string | null
        }
        Update: {
          additionalContext?: string | null
          contentId?: string
          generatedContent?: string
          id?: string
          imageUrls?: string[] | null
          model?: string
          rating?: string | null
          topic?: string
          verificationMethod?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "writing_assistant_contentId_fkey"
            columns: ["contentId"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      api_key_status: "ACTIVE" | "INACTIVE"
      billing_cycle: "MONTHLY" | "YEARLY"
      content_status: "DRAFT" | "GENERATING" | "ERROR" | "PUBLISHED" | "ARCHIVED"
      content_type: "TWITTER_THREAD" | "NEWSLETTER" | "FRANBOT" | "ENVIBOT" | "WRITING_ASSISTANT" | "FACT_CHECKING"
      invoice_status: "DRAFT" | "ISSUED" | "PAID" | "VOID"
      provider_ai: "OPENAI" | "GOOGLE" | "PERPLEXITY"
      resource_status: "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DELETED"
      resource_type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT"
      role: "OWNER" | "WORKSPACE_ADMIN" | "USER"
      subscription_status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "EXPIRED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      api_key_status: ["ACTIVE", "INACTIVE"],
      billing_cycle: ["MONTHLY", "YEARLY"],
      content_status: ["DRAFT", "GENERATING", "ERROR", "PUBLISHED", "ARCHIVED"],
      content_type: ["TWITTER_THREAD", "NEWSLETTER", "FRANBOT", "ENVIBOT", "WRITING_ASSISTANT", "FACT_CHECKING"],
      invoice_status: ["DRAFT", "ISSUED", "PAID", "VOID"],
      provider_ai: ["OPENAI", "GOOGLE", "PERPLEXITY"],
      resource_status: ["ACTIVE", "INACTIVE", "ARCHIVED", "DELETED"],
      resource_type: ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"],
      role: ["OWNER", "WORKSPACE_ADMIN", "USER"],
      subscription_status: ["ACTIVE", "PAST_DUE", "CANCELED", "TRIALING", "EXPIRED"],
    },
  },
} as const

export type User = {
  id: string
  email?: string
  name?: string
  lastname?: string
  avatar?: string
  role?: string
  organizationId?: string
}
