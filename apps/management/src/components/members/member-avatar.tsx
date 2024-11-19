'use client'

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface MemberAvatarProps {
  photoUrl: string | null
  name: string
}

export function MemberAvatar({ photoUrl, name }: MemberAvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar>
      {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
} 