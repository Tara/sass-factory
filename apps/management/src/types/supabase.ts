export type Show = {
  id: string
  title: string
  date: string
  venue_id: string
  ticket_link?: string
  price?: string
  image_path?: string
  created_at: string
  venue?: {
    name: string
    address?: string
  }
}

export type Member = {
  id: string
  name: string
  email: string
  phone?: string
}

export type Availability = {
  id: string
  member_id: string
  date: string
  status: 'available' | 'unavailable' | 'maybe'
  notes?: string
}

export type Rehearsal = {
  id: string
  date: string
  location: string
  notes?: string
  created_at: string
}

export type Venue = {
  id: string
  name: string
  address?: string
  contact_email?: string
  created_at: string
} 