import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type Show = Database['public']['Tables']['shows']['Row'] & {
  venue: Database['public']['Tables']['venues']['Row']
}

export function useShows() {
  const supabase = createClientComponentClient<Database>()

  return useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shows')
        .select(`
          *,
          venue:venues(*)
        `)
        .order('date', { ascending: true })

      if (error) throw error
      return data as Show[]
    }
  })
}

export function useShow(id: string) {
  const supabase = createClientComponentClient<Database>()

  return useQuery({
    queryKey: ['shows', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shows')
        .select(`
          *,
          venue:venues(*),
          show_members(
            *,
            member:members(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Show & {
        show_members: Array<
          Database['public']['Tables']['show_members']['Row'] & {
            member: Database['public']['Tables']['members']['Row']
          }
        >
      }
    }
  })
} 