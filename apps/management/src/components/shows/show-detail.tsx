'use client'

import { useShow } from '@/lib/hooks/useShows'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CustomBadge } from '@/components/ui/custom-badge'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import { ShowAttendance } from "./show-attendance"
import { useMembers } from "@/lib/hooks/useMembers"
import { getShowStatusVariant, getAttendanceVariant } from "@/lib/utils"
import type { Show } from '@/lib/types/shows'

type MemberStatus = Database['public']['Enums']['member_status']

interface ShowDetailProps {
  id: string
}

export function ShowDetail({ id }: ShowDetailProps) {
  const { data: show, isLoading, updateAttendance, batchUpdateAttendance } = useShow(id)
  const { members } = useMembers()

  if (isLoading) return <div>Loading...</div>
  if (!show) return <div>Show not found</div>

  const showMembers = show.show_members.map(sm => ({
    member: sm.member,
    status: sm.status
  }))

  async function handleUpdateAttendance(memberId: string, status: MemberStatus) {
    updateAttendance({ showId: id, memberId, status })
  }

  async function handleBatchUpdateAttendance(updates: Array<{ memberId: string, status: MemberStatus }>) {
    batchUpdateAttendance({ showId: id, updates })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{show.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="font-semibold">Date</h3>
              <p>{formatDate(show.date)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Venue</h3>
              <p>{show.venue.name}</p>
              <p className="text-sm text-muted-foreground">{show.venue.address}</p>
            </div>
            {show.price && (
              <div>
                <h3 className="font-semibold">Price</h3>
                <p>${show.price}</p>
              </div>
            )}
            {show.ticket_link && (
              <div>
                <h3 className="font-semibold">Tickets</h3>
                <a 
                  href={show.ticket_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Buy Tickets
                </a>
              </div>
            )}
            <div>
              <h3 className="font-semibold">Status</h3>
              <CustomBadge variant={getShowStatusVariant(show.status)}>{show.status}</CustomBadge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <ShowAttendance
            showMembers={showMembers}
            showDate={show.date}
            onUpdateAttendance={handleUpdateAttendance}
            onBatchUpdateAttendance={handleBatchUpdateAttendance}
          />
        </CardContent>
      </Card>
    </div>
  )
} 