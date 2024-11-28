export interface Venue {
  id: string
  name: string
  address: string
  image_url: string | null
  contact_email: string | null
  venue_url: string | null
  created_at: string | null
  updated_at: string | null
}

export type VenueUpdateData = Partial<Omit<Venue, 'id' | 'created_at' | 'updated_at'>>

export type NewVenue = Omit<Venue, 'id' | 'created_at' | 'updated_at'> 