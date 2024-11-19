'use client'

import { useVenues } from '@/lib/hooks/useVenues'
import { VenuesList } from '@/components/venues/venues-list'
import { AddVenueDialog } from '@/components/venues/add-venue-dialog'
import { Input } from "@/components/ui/input"
import { useState } from 'react'

export default function VenuesPage() {
  const { venues, loading, error, addVenue, deleteVenue } = useVenues()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (venue.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
        <AddVenueDialog onAdd={addVenue} />
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Search venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <VenuesList 
        venues={filteredVenues} 
        onDelete={deleteVenue} 
      />
    </div>
  )
} 