import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Venue } from '@/lib/types/venues'

export function useVenues() {
  return useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })
}

