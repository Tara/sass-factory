import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Database } from '@/types/supabase'

type ShowStatus = Database['public']['Enums']['show_status']
type MemberStatus = Database['public']['Enums']['member_status']

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
}

export function getShowStatusVariant(status: ShowStatus) {
  switch (status) {
    case 'scheduled':
      return 'default' as const
    case 'performed':
      return 'secondary' as const
    case 'completed':
      return 'outline' as const
    default:
      return 'default' as const
  }
}

export function getAttendanceVariant(status: MemberStatus) {
  switch (status) {
    case 'confirmed':
      return 'outline' as const
    case 'unconfirmed':
      return 'default' as const
    case 'not_attending':
      return 'destructive' as const
    case 'performed':
      return 'secondary' as const
    case 'no_show':
      return 'destructive' as const
    default:
      return 'default' as const
  }
}
