'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useVenues } from '@/lib/hooks/useVenues'
import { useAuth } from '@/lib/hooks/useAuth'
import { VenuesList } from '@/components/venues/venues-list'
import { AddVenueDialog } from '@/components/venues/add-venue-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { session } = useAuth()
  const { 
    data: venues = [],
    isLoading, 
    error,
    deleteVenue,
    editVenue,
    isDeleting,
    isEditing 
  } = useVenues()

  // When loading, show input but disabled
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Venues</h1>
          {session?.isStaff && <AddVenueDialog />}
        </div>

        <div className="max-w-sm">
          <Input
            type="search"
            placeholder="Search venues..."
            value="" 
            disabled
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[300px] animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (venue.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Venues</h1>
        {session?.isStaff && <AddVenueDialog />}
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
          {session?.isStaff && (
            <Button variant="outline" className="mt-4" asChild>
              <AddVenueDialog>
                <div className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Venue
                </div>
              </AddVenueDialog>
            </Button>
          )}
        </div>
      ) : (
        <VenuesList 
          venues={filteredVenues}
          onDelete={deleteVenue}
          onEdit={(id, venue) => editVenue({ id, venue })}
          isDeleting={isDeleting}
          isEditing={isEditing}
        />
      )}
    </div>
  )
}