import type { Venue } from '@/lib/types/venues'
import { useShows } from '@/lib/hooks/useShows'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, MoreVertical, MapPin, Mail, Trash2, ExternalLink, Calendar } from 'lucide-react'
import { useState } from "react"
import Image from 'next/image'
import { format } from 'date-fns'
import { VenueFormDialog } from './venue-form-dialog'
import { getGoogleMapsSearchUrl } from '@/lib/utils'

interface VenuesListProps {
  venues: Venue[]
  onDelete: (id: string) => Promise<void>
  onEdit: (id: string, venue: Partial<Venue>) => Promise<void>
}

export function VenuesList({ venues, onDelete, onEdit }: VenuesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null)
  const { data: shows } = useShows()

  const handleDeleteClick = (venue: Venue) => {
    setVenueToDelete(venue)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!venueToDelete) return

    try {
      await onDelete(venueToDelete.id)
      setDeleteDialogOpen(false)
      setVenueToDelete(null)
    } catch (error) {
      console.error('Failed to delete venue:', error)
    }
  }

  const getVenueShows = (venueId: string) => {
    return shows?.filter(show => show.venue.id === venueId).slice(0, 3) || []
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => (
          <Card key={venue.id} className="overflow-hidden">
            <div className="relative h-40 w-full">
              {venue.image_url ? (
                <Image
                  src={venue.image_url}
                  alt={`${venue.name} venue`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {venue.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
                <h3 className="text-xl font-semibold text-white">{venue.name}</h3>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <a
                    href={getGoogleMapsSearchUrl(venue.name, venue.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MapPin className="mr-1 h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{venue.address}</span>
                  </a>
                  {venue.venue_url && (
                    <a
                      href={venue.venue_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="mr-1 h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">
                        {venue.venue_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </span>
                    </a>
                  )}
                  {venue.contact_email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-1 h-4 w-4 shrink-0" />
                      <a 
                        href={`mailto:${venue.contact_email}`} 
                        className="line-clamp-1 hover:underline"
                      >
                        {venue.contact_email}
                      </a>
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <VenueFormDialog
                      venue={venue}
                      onSubmit={(updatedVenue) => onEdit(venue.id, updatedVenue)}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit details
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (venue.venue_url) window.open(venue.venue_url, '_blank')
                      }}
                      disabled={!venue.venue_url}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View website
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteClick(venue)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete venue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Upcoming Shows</h4>
                {getVenueShows(venue.id).length > 0 ? (
                  <ul className="space-y-2">
                    {getVenueShows(venue.id).map((show) => (
                      <li key={show.id} className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(show.date), 'MMM d, yyyy')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming shows</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Venue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {venueToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

