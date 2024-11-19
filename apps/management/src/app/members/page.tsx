'use client'

import { useMembers, type Member } from '@/lib/hooks/useMembers'
import { MembersList } from '@/components/members/members-list'
import { AddMemberDialog } from '@/components/members/add-member-dialog'
import { Input } from "@/components/ui/input"
import { useState } from 'react'

export default function MembersPage() {
  const { members, loading, error, addMember, deleteMember } = useMembers()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <AddMemberDialog onAdd={addMember} />
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <MembersList 
        members={filteredMembers} 
        onDelete={deleteMember} 
      />
    </div>
  )
} 