export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          display_name: string | null
          avatar_url: string | null
          avatar_color: string | null
          avatar_accessories: string[] | null
          streak_count: number
          last_login: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          display_name?: string | null
          avatar_url?: string | null
          avatar_color?: string | null
          avatar_accessories?: string[] | null
          streak_count?: number
          last_login?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          display_name?: string | null
          avatar_url?: string | null
          avatar_color?: string | null
          avatar_accessories?: string[] | null
          streak_count?: number
          last_login?: string | null
        }
      }
      speech_exercises: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          exercise_type: string
          content: Json
          difficulty_level: number
          age_group: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          exercise_type: string
          content: Json
          difficulty_level: number
          age_group?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          exercise_type?: string
          content?: Json
          difficulty_level?: number
          age_group?: string | null
        }
      }
      user_progress: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          exercise_id: string
          completed_at: string | null
          score: number | null
          attempts: number
          feedback: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          exercise_id: string
          completed_at?: string | null
          score?: number | null
          attempts?: number
          feedback?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          exercise_id?: string
          completed_at?: string | null
          score?: number | null
          attempts?: number
          feedback?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          icon_url: string | null
          criteria: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          icon_url?: string | null
          criteria: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          icon_url?: string | null
          criteria?: Json
        }
      }
      user_achievements: {
        Row: {
          id: string
          created_at: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for Supabase tables
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type SpeechExercise = Database['public']['Tables']['speech_exercises']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'] 