import type { Database } from '@/types/supabase'

export type Show = Database['public']['Tables']['shows']['Row'] & {
  venue: Database['public']['Tables']['venues']['Row']
  name: string
  show_members: Array<{
    member: Database['public']['Tables']['members']['Row']
    status: Database['public']['Enums']['member_status']
  }>
} 