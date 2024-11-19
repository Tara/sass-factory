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
import { Trash2 } from "lucide-react"

interface VenuesListProps {
  venues: Venue[]
  onDelete: (id: string) => Promise<void>
}

export function VenuesList({ venues, onDelete }: VenuesListProps) {
  return (
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
                onClick={() => onDelete(venue.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 