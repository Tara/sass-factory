'use client'

import { useShow } from '@/lib/hooks/useShows'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomBadge } from '@/components/ui/custom-badge'
import { formatDate, getGoogleMapsSearchUrl } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import { ShowAttendance } from "./show-attendance"
import { useMembers } from "@/lib/hooks/useMembers"
import { getShowStatusVariant } from "@/lib/utils"
import { MapPin, Calendar, Ticket, DollarSign } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { EditShow } from './edit-show-dialog'
import { Pencil } from 'lucide-react'

type AttendanceStatus = Database['public']['Enums']['attendance_status']

interface ShowDetailProps {
  id: string
}

export function ShowDetail({ id }: ShowDetailProps) {
  const { data: show, isLoading, updateAttendance, batchUpdateAttendance } = useShow(id)
  const { members } = useMembers()

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-lg text-muted-foreground">Loading show details...</div>
    </div>
  )
  if (!show) return <div>Show not found</div>

  const showMembers = show.show_members.map(sm => ({
    member: sm.member,
    status: sm.status
  }))

  async function handleUpdateAttendance(memberId: string, status: AttendanceStatus) {
    updateAttendance({ showId: id, memberId, status })
  }

  async function handleBatchUpdateAttendance(updates: Array<{ memberId: string, status: AttendanceStatus }>) {
    batchUpdateAttendance({ showId: id, updates })
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Show Details</h1>
        <EditShow 
          show={show} 
          trigger={
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit Show
            </Button>
          }
        />
      </div>

      <Card className="overflow-hidden">
        <div className="relative h-64 w-full">
          {show.venue.image_url ? (
            <Image
              src={show.venue.image_url}
              alt={show.venue.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-6xl font-bold text-muted-foreground">
                {show.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{show.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(show.date)}</span>
              </div>
              <CustomBadge variant={getShowStatusVariant(show.status)} className="text-white">
                {show.status}
              </CustomBadge>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-semibold">Venue</h3>
                  {show.venue.address ? (
                    <a
                      href={getGoogleMapsSearchUrl(show.venue.name, show.venue.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <p>{show.venue.name}</p>
                      <p className="text-sm">{show.venue.address}</p>
                    </a>
                  ) : (
                    <p className="text-muted-foreground">{show.venue.name}</p>
                  )}
                </div>
              </div>

              {show.price && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Price</h3>
                    <p className="text-muted-foreground">${show.price}</p>
                  </div>
                </div>
              )}
            </div>

            {show.ticket_link && (
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-semibold">Tickets</h3>
                  <a 
                    href={show.ticket_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Purchase Tickets
                  </a>
                </div>
              </div>
            )}
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