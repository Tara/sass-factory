import { Venue } from '@/lib/hooks/useVenues'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { useState } from "react"

interface VenuesListProps {
  venues: Venue[]
  onDelete: (id: string) => Promise<void>
}

export function VenuesList({ venues, onDelete }: VenuesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null)

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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={venue.image_url || ''} alt={venue.name} />
                  <AvatarFallback>{venue.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{venue.name}</TableCell>
              <TableCell>{venue.address}</TableCell>
              <TableCell>{venue.contact_email || '-'}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(venue)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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