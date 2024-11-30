// useVenues.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Venue } from '@/lib/types/venues'
import { useEffect } from 'react'

export function useVenues() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('venues-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'venues' 
        }, 
        (payload) => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['venues'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })
}