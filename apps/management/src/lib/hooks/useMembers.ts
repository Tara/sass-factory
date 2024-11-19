import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase/client'

export type Member = {
  id: string
  name: string
  email: string
  photo_url: string
  created_at: string | null
  updated_at: string | null
}

async function fetchMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

async function addMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) {
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