import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Venue } from '@/lib/types/venues'
// import { AddressInput } from '@/components/address-input'
interface VenueFormDialogProps {
  venue?: Venue
  onSubmit: (venue: Partial<Venue>) => Promise<void>
  trigger: React.ReactNode
}

export function VenueFormDialog({ venue, onSubmit, trigger }: VenueFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

//   const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
//   const handleAddressSelect = (address: ValidatedAddress) => {
//     setValidatedAddress(address)
//     setFormErrors(prev => ({ ...prev, address: '' }))
//   }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const venueData: Partial<Venue> = {
      address: formData.get('address') as string,
      image_url: (formData.get('image_url') as string) || null,
      contact_email: (formData.get('contact_email') as string) || null,
      venue_url: (formData.get('venue_url') as string) || null,
    }

    console.log('Submitting venue data:', venueData)

    if (!venue) {
      venueData.name = formData.get('name') as string
    }

    try {
      await onSubmit(venueData)
      setOpen(false)
    } catch (error) {
      console.error('Failed to submit venue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{venue ? 'Edit Venue' : 'Add Venue'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!venue && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
          )}
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" required defaultValue={venue?.address ?? ''} />
            {/* <AddressInput
              onAddressSelect={handleAddressSelect}
              initialValue={venue?.address}
              className={`w-full ${formErrors.address ? 'border-red-500' : ''}`}
              placeholder="Search for an address..."
            /> */}
          </div>
          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" type="url" defaultValue={venue?.image_url ?? ''} />
          </div>
          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" name="contact_email" type="email" defaultValue={venue?.contact_email ?? ''} />
          </div>
          <div>
            <Label htmlFor="venue_url">Website URL</Label>
            <Input 
              id="venue_url" 
              name="venue_url" 
              type="url" 
              defaultValue={venue?.venue_url ?? ''} 
              placeholder="https://example.com"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : venue ? 'Update Venue' : 'Add Venue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

