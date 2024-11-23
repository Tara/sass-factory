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
import { getAttendanceVariant } from "@/lib/utils"

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
}

export function ShowAttendance({ 
  showMembers, 
  showDate,
  onUpdateAttendance 
}: ShowAttendanceProps) {
  const isPast = new Date(showDate) < new Date()

  if (!showMembers?.length) return <div>No members assigned to this show</div>

  return (
    <div className="space-y-4">
      <div className="divide-y">
        {showMembers.map(({ member, status }) => {
          if (!member?.name) return null
          
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
              
              {isPast ? (
                <Badge variant={getAttendanceVariant(status)}>{status}</Badge>
              ) : (
                <Select
                  defaultValue={status}
                  onValueChange={(value: MemberStatus) => onUpdateAttendance(member.id, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="not_attending">Not Attending</SelectItem>
                    <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 