'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusIcon } from '@radix-ui/react-icons'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'

type Venue = Database['public']['Tables']['venues']['Row']

function VenueSelect() {
  const supabase = createClientComponentClient<Database>()
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
  const supabase = createClientComponentClient<Database>()
  const queryClient = useQueryClient()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const venue_id = formData.get('venue_id') as string
    const price = formData.get('price') as string
    const ticket_link = formData.get('ticket_link') as string

    // Combine date and time into ISO string
    const dateTime = new Date(`${date}T${time}`).toISOString()

    try {
      const { error } = await supabase
        .from('shows')
        .insert({
          date: dateTime,
          venue_id,
          price: parseFloat(price),
          ticket_link,
          status: 'scheduled'
        })

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['shows'] })
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              name="time"
              type="time"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue_id">Venue</Label>
            <VenueSelect />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket_link">Ticket Link</Label>
            <Input
              id="ticket_link"
              name="ticket_link"
              type="url"
              required
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