'use client'

import { useMembers, type Member } from '@/lib/hooks/useMembers'
import { MembersList } from '@/components/members/members-list'
import { AddMemberDialog } from '@/components/members/add-member-dialog'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { useState } from 'react'
import type { Database } from '@/types/supabase'

type MemberRow = Database['public']['Tables']['members']['Row']

export default function MembersPage() {
  const { members, loading, error, addMember, deleteMember } = useMembers()
  const [searchTerm, setSearchTerm] = useState('')

  // Improved type guard with more specific types
  const isValidMember = (member: unknown): member is Member => {
    if (!member || typeof member !== 'object') return false
    const m = member as any
    return (
      typeof m.id === 'string' &&
      typeof m.name === 'string' &&
      typeof m.email === 'string'
    )
  }

  // First cast to unknown, then filter and cast to Member[]
  const filteredMembers = (members as unknown[])
    .filter(isValidMember)
    .filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

  if (loading) return (
    <div className="container py-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-lg text-muted-foreground">Loading members...</div>
    </div>
  )
  
  if (error) return (
    <div className="container py-8 flex items-center justify-center min-h-[400px]">
      <div className="text-destructive">Error: {error.message}</div>
    </div>
  )

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your members
          </p>
        </div>
        <AddMemberDialog onAdd={addMember} />
      </div>
      
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <MembersList 
        members={filteredMembers} 
        onDelete={deleteMember} 
      />
    </div>
  )
} 