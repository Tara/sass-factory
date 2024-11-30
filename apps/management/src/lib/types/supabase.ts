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
      admin_users: {
        Row: {
          user_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          created_at?: string
        }
      }
      members: {
        Row: {
          id: string
          name: string
          email: string
          photo_url: string
          member_status: 'active' | 'inactive'
          join_date: string
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          photo_url: string
          member_status?: 'active' | 'inactive'
          join_date: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          photo_url?: string
          member_status?: 'active' | 'inactive'
          join_date?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      shows: {
        Row: {
          id: string
          venue_id: string
          name: string
          date: string
          ticket_link: string | null
          image_url: string | null
          price: number | null
          status: 'scheduled' | 'performed' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          name: string
          date: string
          ticket_link?: string | null
          image_url?: string | null
          price?: number | null
          status?: 'scheduled' | 'performed' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          name?: string
          date?: string
          ticket_link?: string | null
          image_url?: string | null
          price?: number | null
          status?: 'scheduled' | 'performed' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      show_members: {
        Row: {
          id: string
          show_id: string
          member_id: string
          status: 'unconfirmed' | 'confirmed' | 'not_attending' | 'performed' | 'no_show'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          show_id: string
          member_id: string
          status?: 'unconfirmed' | 'confirmed' | 'not_attending' | 'performed' | 'no_show'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          show_id?: string
          member_id?: string
          status?: 'unconfirmed' | 'confirmed' | 'not_attending' | 'performed' | 'no_show'
          created_at?: string
          updated_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          address: string
          venue_url: string | null
          image_url: string | null
          contact_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          venue_url?: string | null
          image_url?: string | null
          contact_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          venue_url?: string | null
          image_url?: string | null
          contact_email?: string | null
          created_at?: string
          updated_at?: string
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
      attendance_status: 'unconfirmed' | 'confirmed' | 'not_attending' | 'performed' | 'no_show'
      member_status: 'active' | 'inactive'
      show_status: 'scheduled' | 'performed' | 'completed'
    }
  }
} 