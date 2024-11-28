import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Database } from '@/types/supabase'
import type { CustomBadgeVariant, BadgeVariant } from "@/components/ui/custom-badge"
import type { AttendanceStatus } from '@/lib/types/shows'

type MemberStatus = Database['public']['Enums']['member_status']
type ShowStatus = Database['public']['Enums']['show_status']

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

export function getShowStatusVariant(status: ShowStatus): CustomBadgeVariant {
  switch (status) {
    case 'completed':
      return 'success'
    case 'scheduled':
      return 'warning'
    case 'performed':
      return 'info'
    default:
      return 'default'
  }
}

export function getAttendanceVariant(status: AttendanceStatus): BadgeVariant {
  const variants: Record<AttendanceStatus, BadgeVariant> = {
    unconfirmed: 'default',
    confirmed: 'success',
    not_attending: 'destructive',
    performed: 'success',
    no_show: 'destructive'
  }

  return variants[status]
}

export function getAvailableAttendanceStatuses(currentStatus: AttendanceStatus, showDate: string | Date): AttendanceStatus[] {
  const isPast = new Date(showDate) < new Date()
  
  if (isPast) 
    return ['performed', 'no_show'] as const
  

  return ['unconfirmed', 'confirmed', 'not_attending'] as const
}

export function formatAttendanceStatus(status: AttendanceStatus): string {
  const formattedStatuses: Record<AttendanceStatus, string> = {
    unconfirmed: 'Unconfirmed',
    confirmed: 'Confirmed',
    not_attending: 'Not Attending',
    performed: 'Performed',
    no_show: 'No Show'
  }

  return formattedStatuses[status]
}

export function getGoogleMapsSearchUrl(venueName: string, address: string) {
  const searchQuery = encodeURIComponent(`${venueName} ${address}`)
  return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`
}
