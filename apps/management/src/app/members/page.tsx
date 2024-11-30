'use client'

import { useMembers } from '@/lib/hooks/useMembers'
import { MembersList } from '@/components/members/members-list'
import { AddMemberDialog } from '@/components/members/add-member-dialog'
import { Input } from "@/components/ui/input"
import { Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Member, MemberStatus } from '@/lib/types/members'

export default function MembersPage() {
  const { members, loading, error, addMember, deleteMember, toggleStatus } = useMembers()
  const [searchTerm, setSearchTerm] = useState('')

  const isValidMember = (member: unknown): member is Member => {
    if (!member || typeof member !== 'object') return false
    const m = member as Partial<Member>
    return (
      typeof m.id === 'string' &&
      typeof m.name === 'string' &&
      typeof m.email === 'string' &&
      (m.created_at === null || typeof m.created_at === 'string') &&
      typeof m.member_status === 'string'
    )
  }

  // First cast to unknown, then filter and cast to Member[]
  const validMembers = (members ?? []).filter(isValidMember)
  
  const filteredMembers = validMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeMembers = filteredMembers.filter(member => member.member_status === 'active')
  const inactiveMembers = filteredMembers.filter(member => member.member_status === 'inactive')

  const handleToggleStatus = (id: string, status: MemberStatus) => {
    toggleStatus({ id, status })
  }

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
        <AddMemberDialog onAdd={addMember} trigger={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        } />
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

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Members</h2>
          <MembersList 
            members={activeMembers} 
            onDelete={deleteMember}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {inactiveMembers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Inactive Members</h2>
            <MembersList 
              members={inactiveMembers} 
              onDelete={deleteMember}
              onToggleStatus={handleToggleStatus}
              isInactive
            />
          </div>
        )}
      </div>
    </div>
  )
} 