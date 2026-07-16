export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
          role: 'donor' | 'creator' | 'admin'
          department: string | null
          city: string | null
          kyc_verified: boolean
          kyc_document_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          role?: 'donor' | 'creator' | 'admin'
          department?: string | null
          city?: string | null
          kyc_verified?: boolean
          kyc_document_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          role?: 'donor' | 'creator' | 'admin'
          department?: string | null
          city?: string | null
          kyc_verified?: boolean
          kyc_document_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          creator_id: string
          title: string
          slug: string
          description: string
          category: 'bienestar_animal' | 'ayuda_social' | 'salud' | 'deporte'
          department: string
          city: string
          goal_amount: number
          collected_amount: number
          cover_image_url: string | null
          images: string[]
          status: 'pending' | 'active' | 'executing' | 'finished' | 'rejected'
          deadline: string
          execution_deadline: string | null
          budget_breakdown: Json
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          slug: string
          description: string
          category: 'bienestar_animal' | 'ayuda_social' | 'salud' | 'deporte'
          department: string
          city: string
          goal_amount: number
          collected_amount?: number
          cover_image_url?: string | null
          images?: string[]
          status?: 'pending' | 'active' | 'executing' | 'finished' | 'rejected'
          deadline: string
          execution_deadline?: string | null
          budget_breakdown?: Json
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          slug?: string
          description?: string
          category?: 'bienestar_animal' | 'ayuda_social' | 'salud' | 'deporte'
          department?: string
          city?: string
          goal_amount?: number
          collected_amount?: number
          cover_image_url?: string | null
          images?: string[]
          status?: 'pending' | 'active' | 'executing' | 'finished' | 'rejected'
          deadline?: string
          execution_deadline?: string | null
          budget_breakdown?: Json
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          id: string
          campaign_id: string
          donor_id: string | null
          amount: number
          wompi_transaction_id: string | null
          wompi_reference: string | null
          status: 'pending' | 'approved' | 'declined'
          donor_name: string | null
          donor_message: string | null
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          donor_id?: string | null
          amount: number
          wompi_transaction_id?: string | null
          wompi_reference?: string | null
          status?: 'pending' | 'approved' | 'declined'
          donor_name?: string | null
          donor_message?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          donor_id?: string | null
          amount?: number
          wompi_transaction_id?: string | null
          wompi_reference?: string | null
          status?: 'pending' | 'approved' | 'declined'
          donor_name?: string | null
          donor_message?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      traceability_updates: {
        Row: {
          id: string
          campaign_id: string
          stage: 'initial' | 'execution' | 'final'
          title: string
          description: string
          images: string[]
          receipt_urls: string[]
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          stage: 'initial' | 'execution' | 'final'
          title: string
          description: string
          images?: string[]
          receipt_urls?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          stage?: 'initial' | 'execution' | 'final'
          title?: string
          description?: string
          images?: string[]
          receipt_urls?: string[]
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      platform_stats: {
        Row: {
          total_collected: number
          active_campaigns: number
          total_donations: number
          total_users: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type TraceabilityUpdate = Database['public']['Tables']['traceability_updates']['Row']
export type PlatformStats = Database['public']['Views']['platform_stats']['Row']
