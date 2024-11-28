'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { type Venue } from '@/lib/hooks/useVenues'

interface AddVenueDialogProps {
  onAdd: (venue: Omit<Venue, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export function AddVenueDialog({ onAdd }: AddVenueDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onAdd({
        name,
        address,
        image_url: imageUrl || null,
        contact_email: contactEmail || null
      })
      setOpen(false)
      setName('')
      setAddress('')
      setImageUrl('')
      setContactEmail('')
    } catch (error) {
      console.error('Failed to add venue:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Venue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Venue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email (optional)</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Add Venue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 