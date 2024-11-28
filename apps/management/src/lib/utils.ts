import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Database } from '@/types/supabase'

type MemberStatus = Database['public']['Enums']['member_status']
type ShowStatus = Database['public']['Enums']['show_status']
type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

export function getShowStatusVariant(status: ShowStatus): BadgeVariant {
  switch (status) {
    case 'scheduled':
      return 'default'
    case 'performed':
      return 'secondary'
    case 'completed':
      return 'outline'
    default:
      return 'default'
  }
}

export function getAttendanceVariant(status: MemberStatus): BadgeVariant {
  switch (status) {
    case 'confirmed':
      return 'secondary'
    case 'not_attending':
      return 'destructive'
    case 'performed':
      return 'secondary'
    case 'no_show':
      return 'destructive'
    case 'unconfirmed':
    default:
      return 'default'
  }
}

export function getAvailableAttendanceStatuses(currentStatus: MemberStatus, showDate: string): MemberStatus[] {
  const isPast = new Date(showDate) < new Date()

  if (isPast) {
    // If already marked as not_attending, keep it that way
    if (currentStatus === 'not_attending') return ['not_attending']
    // For confirmed/unconfirmed members, allow performed/no_show
    return ['performed', 'no_show']
  }

  // Before the show, allow all pre-show statuses
  return ['confirmed', 'not_attending', 'unconfirmed']
}

export function formatAttendanceStatus(status: MemberStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}
