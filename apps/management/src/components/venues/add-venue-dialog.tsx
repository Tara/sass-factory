'use client'

import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import type { NewVenue } from '@/lib/types/venues'

export function AddVenueDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [venueUrl, setVenueUrl] = useState('')
  
  const queryClient = useQueryClient()
  
  const { mutate: addVenue, isPending: isLoading } = useMutation({
    mutationFn: async (newVenue: NewVenue) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('venues')
        .insert([newVenue])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      setOpen(false)
      resetForm()
    },
  })

  const resetForm = () => {
    setName('')
    setAddress('')
    setContactEmail('')
    setVenueUrl('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addVenue({
      name,
      address,
      contact_email: contactEmail || null,
      venue_url: venueUrl || null,
      image_url: null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </Button>
        )}
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
            <Label htmlFor="contactEmail">Contact Email (optional)</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueUrl">Website URL (optional)</Label>
            <Input
              id="venueUrl"
              type="url"
              value={venueUrl}
              onChange={(e) => setVenueUrl(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Venue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 