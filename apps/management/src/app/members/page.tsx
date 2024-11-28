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

  // Type guard to ensure we have a valid member and not an error
  const isValidMember = (member: unknown): member is MemberRow => {
    if (!member || typeof member !== 'object') return false
    return 'name' in member && 'email' in member
  }

  const filteredMembers = members
    .filter(isValidMember)
    .filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) as Member[] // Safe to cast after filtering

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-lg text-muted-foreground">Loading members...</div>
    </div>
  )
  
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-destructive">Error: {error.message}</div>
    </div>
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <AddMemberDialog onAdd={addMember} />
      </div>
      
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <MembersList 
        members={filteredMembers} 
        onDelete={deleteMember} 
      />
    </div>
  )
} 