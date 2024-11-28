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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Trash2, UserX2 } from 'lucide-react'

function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

interface MembersListProps {
  members: Member[]
  onDelete: (id: string) => void
  isLoading?: boolean
}

export function MembersList({ members, onDelete, isLoading }: MembersListProps) {
  const handleDelete = async (id: string) => {
    try {
      onDelete(id)
      toast({
        title: "Member removed",
        description: "The member has been successfully removed from the team.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] px-6" />
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!members.length) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <UserX2 className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No team members</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Get started by adding your first team member
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px] px-6">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow 
              key={member.id}
              className="group transition-colors hover:bg-muted/50"
            >
              <TableCell className="px-6">
                <MemberAvatar photoUrl={member.photo_url} name={member.name} />
              </TableCell>
              <TableCell>
                <div className="font-medium">{member.name}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {formatDate(member.join_date)}
                </span>
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete member</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove {member.name} from your team. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(member.id)}
                      >
                        Remove Member
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

