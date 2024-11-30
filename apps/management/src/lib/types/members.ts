import type { Database } from '@/types/supabase'

export type MemberStatus = 'active' | 'inactive' | 'pending'

export type Member = Database['public']['Tables']['members']['Row'] & {
  member_status: MemberStatus
  photo_url: string | null
  join_date: string
  created_at: string | null
  updated_at: string | null
  shows?: Array<{
    show: Database['public']['Tables']['shows']['Row']
    status: Database['public']['Enums']['member_status']
  }>
}

export interface NewMember {
  name: string
  email: string
  join_date: string
  member_status: MemberStatus
  photo_url?: string
} 