'use client'

import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Member } from "@/lib/hooks/useMembers"
import { MemberAvatar } from "./member-avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

interface MembersListProps {
  members: Member[]
  onDelete: (id: string) => void
}

export function MembersList({ members, onDelete }: MembersListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return
    try {
      onDelete(id)
      toast({
        title: "Success",
        description: "Member deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="pr-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="pl-4">
                <MemberAvatar photoUrl={member.photo_url} name={member.name} />
              </TableCell>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{formatDate(member.created_at)}</TableCell>
              <TableCell className="pr-4 text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(member.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 