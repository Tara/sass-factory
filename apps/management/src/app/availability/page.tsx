import { AvailabilityCalendar } from "@/components/availability/calendar"
import { createServerActionClient } from "@/lib/supabase/server"

export default async function AvailabilityPage() {
  const supabase = createServerActionClient()
  
  // Let's add some debug logging
  const { data, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Auth error:', error)
    throw error
  }

  if (!data.user) {
    // This shouldn't happen because of middleware, but let's log it
    console.error('No user found but middleware allowed access')
    throw new Error('User not found')
  }

  // Get member data for the current user
  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  if (memberError) {
    console.error('Member fetch error:', memberError)
    throw memberError
  }

  if (!memberData) {
    console.error('No member data found for user:', data.user.id)
    throw new Error('Member not found')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Availability</h1>
      </div>
      
      <div className="rounded-lg border bg-card">
        <AvailabilityCalendar initialMemberId={memberData.id} />
      </div>
    </div>
  )
}