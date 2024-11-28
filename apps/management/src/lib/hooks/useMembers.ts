import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export interface Member {
  id: string
  name: string
  email: string
  photo_url: string
  member_status: 'active' | 'inactive'
  join_date: string
  created_at: string
  updated_at: string
}

// Create a single instance of the Supabase client
const supabase = createClientComponentClient<Database>()

type NewMember = Pick<Member, 'name' | 'email' | 'photo_url' | 'member_status' | 'join_date'>

async function fetchMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true })
    .order('join_date', { ascending: false })

  if (error) throw error
  return data
}

async function addMember(member: NewMember) {
  const { data, error } = await supabase
    .from('members')
    .insert(member)
    .select()
    .single()

  if (error) throw error
  return data
}

async function deleteMember(id: string) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function useMembers() {
  const queryClient = useQueryClient()

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers
  })

  const addMemberMutation = useMutation({
    mutationFn: addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    }
  })

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    }
  })

  return {
    members,
    loading: isLoading,
    error: error as Error | null,
    addMember: addMemberMutation.mutate,
    deleteMember: deleteMemberMutation.mutate
  }
} 