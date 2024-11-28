'use client'

import { useVenues } from '@/lib/hooks/useVenues'
import { VenuesList } from '@/components/venues/venues-list'
import { VenueFormDialog } from '@/components/venues/venue-form-dialog'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { VenuesMap } from '@/components/venues/venues-map'
import type { Venue } from '@/lib/hooks/useVenues'

export default function VenuesPage() {
  const { venues, loading, error, addVenue, editVenue, deleteVenue } = useVenues()
  const [searchTerm, setSearchTerm] = useState('')
  const [showMap, setShowMap] = useState(false)

  const handleAddVenue = async (venue: Partial<Venue>) => {
    if (!venue.name || !venue.address) return
    await addVenue({
      name: venue.name,
      address: venue.address,
      contact_email: venue.contact_email ?? null,
      image_url: venue.image_url ?? null
    })
  }

  const handleEditVenue = async (id: string, venue: Partial<Venue>) => {
    await editVenue(id, {
      address: venue.address,
      contact_email: venue.contact_email,
      image_url: venue.image_url
    })
  }

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (venue.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  if (loading) return (
    <div className="container py-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-lg text-muted-foreground">Loading venues...</div>
    </div>
  )

  if (error) return (
    <div className="container py-8 flex items-center justify-center min-h-[400px]">
      <div className="text-destructive">Error: {error.message}</div>
    </div>
  )

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your performance venues
          </p>
        </div>
        <VenueFormDialog
          onSubmit={handleAddVenue}
          trigger={
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Venue
            </Button>
          }
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowMap(!showMap)}>
          <MapPin className="h-4 w-4" />
          <span className="sr-only">Toggle map view</span>
        </Button>
      </div>

      {showMap && (
        <div className="mt-4 rounded-lg overflow-hidden border">
          <VenuesMap venues={filteredVenues} />
        </div>
      )}

      {filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 rounded-lg border border-dashed p-8 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-semibold">No venues found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 
                "We couldn't find any venues matching your search. Try different keywords." :
                "Get started by adding your first venue."
              }
            </p>
          </div>
          {!searchTerm && (
            <VenueFormDialog
              onSubmit={handleAddVenue}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Venue
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <VenuesList 
          venues={filteredVenues} 
          onDelete={deleteVenue}
          onEdit={handleEditVenue}
        />
      )}
    </div>
  )
}

