import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Venue {
  id: string
  name: string
  address: string
  image_url?: string
  contact_email?: string
  created_at: string
  updated_at: string
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

      setVenues(data || [])
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
        .insert([venue])
        .select()
        .single()

      if (error) throw error

      setVenues(prev => [...prev, data])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add venue')
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

  return { venues, loading, error, addVenue, deleteVenue }
} 