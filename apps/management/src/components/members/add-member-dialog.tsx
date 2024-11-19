'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type AddMemberFormData = {
  name: string
  email: string
  photo_url: string
}

interface AddMemberDialogProps {
  onAdd: (member: AddMemberFormData) => void
}

export function AddMemberDialog({ onAdd }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<AddMemberFormData>({
    name: '',
    email: '',
    photo_url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      onAdd(formData)
      setOpen(false)
      setFormData({ name: '', email: '', photo_url: '' })
      toast({
        title: "Success",
        description: "Member added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL (optional)</Label>
            <Input
              id="photo"
              value={formData.photo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full">Add Member</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 