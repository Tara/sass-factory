import { createServerActionClient } from '@/lib/supabase/server'
import { TeamAvailabilityView } from '@/components/availability/team-availability-view'
import { redirect } from 'next/navigation'
import type { Member } from '@/lib/types/members'
import type { DayAvailability } from '@/lib/types/availability'

// Helper function since we don't have hasRole
async function checkUserRole(userId: string, roles: string[]): Promise<boolean> {
  const supabase = createServerActionClient()
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()
    
  return data ? roles.includes(data.role) : false
}

export default async function TeamAvailabilityPage() {
  const supabase = createServerActionClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await checkUserRole(user.id, ['admin', 'manager']))) 
    redirect('/availability')

  // Fetch all active members
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('member_status', 'active')
  
  // Fetch all availability data
  const { data: availabilityData } = await supabase
    .from('availability')
    .select('*')
    .in('member_id', members?.map((m: Member) => m.id) || [])

  // Transform availability data into the expected format
  const availability = availabilityData?.reduce<Record<string, Record<string, DayAvailability>>>(
    (acc, curr) => {
      if (!curr.member_id) return acc
      
      return {
        ...acc,
        [curr.member_id]: {
          ...(acc[curr.member_id] || {}),
          [curr.date]: {
            morning: curr.morning_availability,
            evening: curr.evening_availability,
          },
        },
      }
    }, 
    {}
  )

  if (!members || !availability) 
    return <div>Error loading team availability</div>

  return (
    <div className="container py-6">
      <TeamAvailabilityView 
        members={members} 
        availability={availability} 
      />
    </div>
  )
} 