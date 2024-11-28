"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Database } from '@/types/supabase'
import { getAttendanceVariant, getAvailableAttendanceStatuses, formatAttendanceStatus } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

type Member = Database['public']['Tables']['members']['Row']
type MemberStatus = Database['public']['Enums']['member_status']
type ShowMember = {
  member: Member
  status: MemberStatus
}

interface ShowAttendanceProps {
  showMembers: ShowMember[]
  showDate: string
  onUpdateAttendance: (memberId: string, status: MemberStatus) => Promise<void>
  onBatchUpdateAttendance?: (updates: Array<{ memberId: string, status: MemberStatus }>) => Promise<void>
}

export function ShowAttendance({ 
  showMembers, 
  showDate,
  onUpdateAttendance,
  onBatchUpdateAttendance
}: ShowAttendanceProps) {
  const isPast = new Date(showDate) < new Date()

  if (!showMembers?.length) return <div>No members assigned to this show</div>

  // Quick action buttons for batch updates
  const QuickActions = () => {
    if (isPast || !onBatchUpdateAttendance) return null

    const markAllConfirmed = () => {
      onBatchUpdateAttendance(
        showMembers
          .filter(({ status }) => status === 'unconfirmed')
          .map(({ member }) => ({
            memberId: member.id,
            status: 'confirmed'
          }))
      )
    }

    const markAllNotAttending = () => {
      onBatchUpdateAttendance(
        showMembers
          .filter(({ status }) => status === 'unconfirmed')
          .map(({ member }) => ({
            memberId: member.id,
            status: 'not_attending'
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
        {showMembers.map(({ member, status }) => {
          if (!member?.name) return null
          
          const availableStatuses = getAvailableAttendanceStatuses(status, showDate)
          
          return (
            <div key={member.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.photo_url || undefined} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{member.name}</span>
              </div>
              
              <Select
                defaultValue={status}
                onValueChange={(value: MemberStatus) => onUpdateAttendance(member.id, value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <Badge variant={getAttendanceVariant(status)}>
                      {formatAttendanceStatus(status)}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      <Badge variant={getAttendanceVariant(statusOption)}>
                        {formatAttendanceStatus(statusOption)}
                      </Badge>
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