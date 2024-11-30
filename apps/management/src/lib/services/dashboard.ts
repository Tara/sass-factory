import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/types/supabase"

interface DashboardStats {
  totalShows: number
  activeMembers: number
  venues: number
  upcomingShows: number
  nextShowDays: number | null
  showsLastMonth: number
  newMembersThisMonth: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  
  const [
    { count: totalShows },
    { count: showsLastMonth },
    { count: activeMembers },
    { count: newMembersThisMonth },
    { count: venues },
    { count: upcomingShows },
    nextShowQuery
  ] = await Promise.all([
    supabase.from('shows').select('*', { count: 'exact', head: true }),
    supabase.from('shows').select('*', { count: 'exact', head: true })
      .gte('date', firstDayLastMonth.toISOString())
      .lt('date', firstDayOfMonth.toISOString()),
    supabase.from('members').select('*', { count: 'exact', head: true })
      .eq('member_status', 'active'),
    supabase.from('members').select('*', { count: 'exact', head: true })
      .gte('join_date', firstDayOfMonth.toISOString()),
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('shows').select('*', { count: 'exact', head: true })
      .gte('date', now.toISOString()),
    supabase.from('shows').select('date')
      .gte('date', now.toISOString())
      .order('date', { ascending: true })
      .limit(1)
      .single()
  ])

  const nextShowDays = nextShowQuery.data
    ? Math.ceil((new Date(nextShowQuery.data.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return {
    totalShows: totalShows || 0,
    showsLastMonth: showsLastMonth || 0,
    activeMembers: activeMembers || 0,
    newMembersThisMonth: newMembersThisMonth || 0,
    venues: venues || 0,
    upcomingShows: upcomingShows || 0,
    nextShowDays
  }
} 