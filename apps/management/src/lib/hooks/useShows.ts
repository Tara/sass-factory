import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type Show = Database['public']['Tables']['shows']['Row'] & {
  venue: Database['public']['Tables']['venues']['Row']
  name: string
}

type UpdateAttendanceParams = {
  showId: string
  memberId: string
  status: Database['public']['Enums']['member_status']
}

// Create a single instance of the Supabase client
const supabase = createClientComponentClient<Database>({
  options: {
    persistSession: false // This prevents cookie-related errors
  }
})

export function useShows() {
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
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
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

  const updateAttendance = useMutation({
    mutationFn: async ({ showId, memberId, status }: UpdateAttendanceParams) => {
      const { error } = await supabase
        .from('show_members')
        .update({ status })
        .eq('show_id', showId)
        .eq('member_id', memberId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows', id] })
    }
  })

  return {
    data,
    isLoading,
    error,
    updateAttendance: updateAttendance.mutate
  }
} 