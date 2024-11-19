'use client'

import { useShow } from '@/lib/hooks/useShows'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type ShowStatus = Database['public']['Enums']['show_status']
type MemberStatus = Database['public']['Enums']['member_status']

interface ShowDetailProps {
  id: string
}

function getStatusVariant(status: ShowStatus) {
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

function getAttendanceVariant(status: MemberStatus) {
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

export function ShowDetail({ id }: ShowDetailProps) {
  const { data: show, isLoading } = useShow(id)

  if (isLoading) return <div>Loading...</div>
  if (!show) return <div>Show not found</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Show Details</CardTitle>
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
            <div>
              <h3 className="font-semibold">Price</h3>
              <p>${show.price}</p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <Badge variant={getStatusVariant(show.status)}>{show.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {show.show_members.map((showMember) => (
              <div
                key={showMember.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={showMember.member.photo_url} />
                    <AvatarFallback>
                      {showMember.member.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{showMember.member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {showMember.member.email}
                    </p>
                  </div>
                </div>
                <Badge variant={getAttendanceVariant(showMember.status)}>
                  {showMember.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 