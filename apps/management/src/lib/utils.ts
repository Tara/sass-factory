import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Database } from '@/types/supabase'
import { type CustomBadgeVariant } from "@/components/ui/custom-badge"

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

export function getAttendanceVariant(status: MemberStatus): CustomBadgeVariant {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'not_attending':
      return 'warning'
    case 'performed':
      return 'success'
    case 'no_show':
      return 'warning'
    case 'unconfirmed':
    default:
      return 'muted'
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

export function getGoogleMapsSearchUrl(venueName: string, address: string) {
  const searchQuery = encodeURIComponent(`${venueName} ${address}`)
  return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`
}
