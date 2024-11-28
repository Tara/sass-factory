import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Venue {
  id: string
  name: string
  address: string
  image_url: string | null
  contact_email: string | null
  created_at: string | null
  updated_at: string | null
}

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVenues = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name')

      if (error) throw error

      setVenues(data as Venue[] || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch venues'))
    } finally {
      setLoading(false)
    }
  }, [])

  const addVenue = useCallback(async (venue: Omit<Venue, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .insert({
          name: venue.name,
          address: venue.address,
          image_url: venue.image_url,
          contact_email: venue.contact_email
        })
        .select()
        .single()

      if (error) throw error

      setVenues(prev => [...prev, data as Venue])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add venue')
    }
  }, [])

  const editVenue = useCallback(async (id: string, venue: Partial<Omit<Venue, 'id' | 'name' | 'created_at' | 'updated_at'>>) => {
    try {
      const updateData: Record<string, any> = {}
      if (venue.address !== undefined) updateData.address = venue.address
      if (venue.image_url !== undefined) updateData.image_url = venue.image_url
      if (venue.contact_email !== undefined) updateData.contact_email = venue.contact_email

      const { data, error } = await supabase
        .from('venues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setVenues(prev => prev.map(v => v.id === id ? { ...v, ...data } as Venue : v))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to edit venue')
    }
  }, [])

  const deleteVenue = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id)

      if (error) throw error

      setVenues(prev => prev.filter(venue => venue.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete venue')
    }
  }, [])

  useEffect(() => {
    fetchVenues()
  }, [fetchVenues])

  return { venues, loading, error, addVenue, editVenue, deleteVenue }
}

