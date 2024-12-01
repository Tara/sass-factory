export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string | null
          date: string
          evening_availability: Database["public"]["Enums"]["availability_status"]
          id: string
          member_id: string | null
          morning_availability: Database["public"]["Enums"]["availability_status"]
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          evening_availability?: Database["public"]["Enums"]["availability_status"]
          id?: string
          member_id?: string | null
          morning_availability?: Database["public"]["Enums"]["availability_status"]
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          evening_availability?: Database["public"]["Enums"]["availability_status"]
          id?: string
          member_id?: string | null
          morning_availability?: Database["public"]["Enums"]["availability_status"]
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_requests: {
        Row: {
          created_at: string | null
          created_by: string | null
          due_date: string
          id: string
          quarter_end: string
          quarter_start: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          due_date: string
          id?: string
          quarter_end: string
          quarter_start: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          due_date?: string
          id?: string
          quarter_end?: string
          quarter_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_responses: {
        Row: {
          created_at: string | null
          id: string
          member_id: string | null
          request_id: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          request_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          request_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_responses_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "availability_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string | null
          email: string
          id: string
          join_date: string
          member_status: Database["public"]["Enums"]["member_status"]
          name: string
          photo_url: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          join_date: string
          member_status?: Database["public"]["Enums"]["member_status"]
          name: string
          photo_url: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          join_date?: string
          member_status?: Database["public"]["Enums"]["member_status"]
          name?: string
          photo_url?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      show_members: {
        Row: {
          created_at: string | null
          id: string
          member_id: string | null
          show_id: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          show_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          show_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "show_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_members_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      shows: {
        Row: {
          created_at: string | null
          date: string
          id: string
          image_url: string | null
          name: string
          price: number | null
          status: Database["public"]["Enums"]["show_status"]
          ticket_link: string | null
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          status?: Database["public"]["Enums"]["show_status"]
          ticket_link?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          status?: Database["public"]["Enums"]["show_status"]
          ticket_link?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shows_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          contact_email: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
          venue_url: string | null
        }
        Insert: {
          address: string
          contact_email?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
          venue_url?: string | null
        }
        Update: {
          address?: string
          contact_email?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
          venue_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          role_to_check: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      attendance_status:
        | "unconfirmed"
        | "confirmed"
        | "not_attending"
        | "performed"
        | "no_show"
      availability_status: "available" | "maybe" | "unavailable" | "unknown"
      member_status: "active" | "inactive" | "pending"
      show_status: "scheduled" | "performed" | "completed"
      user_role: "admin" | "manager" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
