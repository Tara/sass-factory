import type { Database } from './supabase'
import type { Member } from './members'

export type AttendanceStatus = Database['public']['Enums']['attendance_status']

export interface ShowMember {
  member: Member
  status: AttendanceStatus
}

type BaseVenue = Database['public']['Tables']['venues']['Row']
export type Venue = BaseVenue & {
  address: string
}

type BaseShow = Database['public']['Tables']['shows']['Row']
export type Show = BaseShow & {
  venue: Venue
  show_members: ShowMember[]
}

export interface NewShow {
  name: string
  date: string
  venue_id: string
  status: 'scheduled' | 'performed' | 'completed'
  price?: number
  ticket_link?: string
} 