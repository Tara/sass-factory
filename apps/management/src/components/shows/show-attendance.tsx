"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Database } from '@/types/supabase'
import type { AttendanceStatus } from '@/lib/types/shows'
import { getAttendanceVariant, getAvailableAttendanceStatuses, formatAttendanceStatus } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { CustomBadge } from "@/components/ui/custom-badge"

type Member = Database['public']['Tables']['members']['Row']
type ShowMember = {
  member: Member
  status: AttendanceStatus
}

interface ShowAttendanceProps {
  showMembers: ShowMember[]
  showDate: string | Date
  onUpdateAttendance: (memberId: string, status: AttendanceStatus) => Promise<void>
  onBatchUpdateAttendance: (updates: Array<{ memberId: string, status: AttendanceStatus }>) => Promise<void>
}

export function ShowAttendance({ 
  showMembers, 
  showDate,
  onUpdateAttendance,
  onBatchUpdateAttendance
}: ShowAttendanceProps) {
  const isPast = new Date(showDate) < new Date()

  if (!showMembers?.length) return <div>No members assigned to this show</div>

  // Sort members alphabetically by name
  const sortedMembers = [...showMembers].sort((a, b) => 
    (a.member.name ?? '').localeCompare(b.member.name ?? '')
  )

  // Quick action buttons for batch updates
  const QuickActions = () => {
    if (isPast || !onBatchUpdateAttendance) return null

    const markAllConfirmed = () => {
      onBatchUpdateAttendance(
        sortedMembers
          .filter(({ status }) => status === 'unconfirmed')
          .map(({ member }) => ({
            memberId: member.id,
            status: 'confirmed' as const
          }))
      )
    }

    const markAllNotAttending = () => {
      onBatchUpdateAttendance(
        sortedMembers
          .filter(({ status }) => status === 'unconfirmed')
          .map(({ member }) => ({
            memberId: member.id,
            status: 'not_attending' as const
          }))
      )
    }

    return (
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={markAllConfirmed}
        >
          <Check className="h-4 w-4" />
          Mark All Unconfirmed as Confirmed
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={markAllNotAttending}
        >
          <X className="h-4 w-4" />
          Mark All Unconfirmed as Not Attending
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <QuickActions />
      <div className="divide-y">
        {sortedMembers.map(({ member, status }) => {
          if (!member?.name) return null
          
          const availableStatuses = getAvailableAttendanceStatuses(status, showDate)
          
          return (
            <div key={member.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.photo_url || undefined} />
                  <AvatarFallback>
                    {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{member.name}</span>
              </div>
              
              <Select
                defaultValue={status}
                onValueChange={(value: AttendanceStatus) => onUpdateAttendance(member.id, value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <CustomBadge variant={getAttendanceVariant(status)}>
                      {formatAttendanceStatus(status)}
                    </CustomBadge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      <CustomBadge variant={getAttendanceVariant(statusOption)}>
                        {formatAttendanceStatus(statusOption)}
                      </CustomBadge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        })}
      </div>
    </div>
  )
} 