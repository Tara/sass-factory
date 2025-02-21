import type { Database } from './supabase'

export type AvailabilityStatus = Database['public']['Enums']['availability_status']

export type DayPeriod = 'all-day' | 'morning' | 'evening'

export interface DayAvailability {
  morning: AvailabilityStatus
  evening: AvailabilityStatus
}

export interface AvailabilityRow {
  id: string
  member_id: string | null
  date: string
  morning_availability: AvailabilityStatus
  evening_availability: AvailabilityStatus
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface AvailabilityCalendarProps {
  initialMemberId: string
}

export const availabilityLabels: Record<AvailabilityStatus, string> = {
  available: 'Available',
  maybe: 'Maybe Available',
  unavailable: 'Not Available',
  unknown: 'Unknown'
} 