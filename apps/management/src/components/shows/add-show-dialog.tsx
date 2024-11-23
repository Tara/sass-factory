'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusIcon } from '@radix-ui/react-icons'
import type { Database } from '@/types/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

type Venue = Database['public']['Tables']['venues']['Row']

function VenueSelect() {
  const { data: venues } = useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  return (
    <select
      name="venue_id"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      required
    >
      <option value="">Select a venue</option>
      {venues?.map((venue: Venue) => (
        <option key={venue.id} value={venue.id}>
          {venue.name}
        </option>
      ))}
    </select>
  )
}

export function AddShowDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const queryClient = useQueryClient()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const venue_id = formData.get('venue_id') as string
    const price = formData.get('price') as string
    const ticket_link = formData.get('ticket_link') as string

    try {
      // Create a date object in local timezone
      const [year, month, day] = date.split('-').map(Number)
      const [hours, minutes] = time.split(':').map(Number)
      
      const showDate = new Date(year, month - 1, day, hours, minutes)
      
      // Convert to ISO string for database
      const dateTime = showDate.toISOString()

      const { error } = await supabase
        .from('shows')
        .insert({
          name,
          date: dateTime,
          venue_id,
          price: price ? parseFloat(price) : null,
          ticket_link: ticket_link || null,
          status: 'scheduled'
        })

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['shows'] })
      formRef.current?.reset()
      setOpen(false)
    } catch (error) {
      console.error('Error adding show:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Show
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Show</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Show Name</Label>
            <Input
              id="name"
              name="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              name="time"
              type="time"
              defaultValue="20:00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue_id">Venue</Label>
            <VenueSelect />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (optional)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket_link">Ticket Link (optional)</Label>
            <Input
              id="ticket_link"
              name="ticket_link"
              type="url"
              placeholder="https://"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Show'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 