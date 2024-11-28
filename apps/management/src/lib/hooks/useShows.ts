import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database, AttendanceStatus } from '@/types/supabase'

type Show = Database['public']['Tables']['shows']['Row'] & {
  venue: Database['public']['Tables']['venues']['Row']
  name: string
  show_members: Array<{
    id: string
    show_id: string
    member_id: string
    status: AttendanceStatus
    created_at: string | null
    updated_at: string | null
    member: Database['public']['Tables']['members']['Row']
  }>
}

type MemberStatus = Database['public']['Enums']['member_status']

interface UpdateAttendanceParams {
  showId: string
  memberId: string
  status: AttendanceStatus
}

interface BatchUpdateParams {
  showId: string
  updates: Array<{
    memberId: string
    status: AttendanceStatus
  }>
}

// Create a single instance of the Supabase client
const supabase = createClientComponentClient<Database>()

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
      return (data || []) as Show[]
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
      return data as unknown as Show & {
        show_members: Array<{
          id: string
          show_id: string
          member_id: string
          status: AttendanceStatus
          created_at: string | null
          updated_at: string | null
          member: Database['public']['Tables']['members']['Row']
        }>
      }
    }
  })

  const updateAttendance = useMutation({
    mutationFn: async ({ showId, memberId, status }: UpdateAttendanceParams) => {
      const { error } = await supabase
        .from('show_members')
        .update({ status: status as Database['public']['Enums']['attendance_status'] })
        .eq('show_id', showId)
        .eq('member_id', memberId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows', id] })
    }
  })

  const batchUpdateAttendance = useMutation({
    mutationFn: async ({ showId, updates }: BatchUpdateParams) => {
      await Promise.all(
        updates.map(({ memberId, status }) =>
          supabase
            .from('show_members')
            .update({ status: status as Database['public']['Enums']['attendance_status'] })
            .eq('show_id', showId)
            .eq('member_id', memberId)
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows', id] })
    }
  })

  return {
    data,
    isLoading,
    error,
    updateAttendance: updateAttendance.mutate,
    batchUpdateAttendance: batchUpdateAttendance.mutate
  }
} 