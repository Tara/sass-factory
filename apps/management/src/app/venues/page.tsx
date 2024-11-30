'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useVenues } from '@/lib/hooks/useVenues'
import { VenuesList } from '@/components/venues/venues-list'
import { AddVenueDialog } from '@/components/venues/add-venue-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import type { Venue } from '@/lib/types/venues'

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: venues, isLoading, error } = useVenues()
  const queryClient = useQueryClient()

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id)

    if (error) throw error
    queryClient.invalidateQueries({ queryKey: ['venues'] })
  }

  const handleEdit = async (id: string, venue: Partial<Venue>) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('venues')
      .update(venue)
      .eq('id', id)

    if (error) throw error
    queryClient.invalidateQueries({ queryKey: ['venues'] })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Loading venues...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">Error loading venues</p>
      </div>
    )
  }

  const filteredVenues = venues?.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (venue.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  ) ?? []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Venues</h1>
        <AddVenueDialog />
      </div>

      <div className="max-w-sm">
        <Input
          type="search"
          placeholder="Search venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredVenues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No venues found</p>
          <Button variant="outline" className="mt-4" asChild>
            <AddVenueDialog>
              <div className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Venue
              </div>
            </AddVenueDialog>
          </Button>
        </div>
      ) : (
        <VenuesList 
          venues={filteredVenues}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}

