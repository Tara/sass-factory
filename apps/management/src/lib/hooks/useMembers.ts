import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import type { Member } from '@/lib/types/members'

// Create a single instance of the Supabase client
const supabase = createClientComponentClient<Database>()

export interface NewMember {
  name: string
  email: string
  join_date: string
  member_status: 'active' | 'inactive'
  photo_url?: string
}

function getDefaultAvatar(name: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(name)}`
}

async function fetchMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true })
    .order('join_date', { ascending: false })

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

async function toggleMemberStatus(id: string, currentStatus: 'active' | 'inactive') {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { data, error } = await supabase
    .from('members')
    .update({ member_status: newStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export function useMembers() {
  const queryClient = useQueryClient()

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers
  })

  const addMemberMutation = useMutation({
    mutationFn: async (member: NewMember) => {
      const { data, error } = await supabase
        .from('members')
        .insert([{
          ...member,
          photo_url: member.photo_url || getDefaultAvatar(member.name)
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
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

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'active' | 'inactive' }) => 
      toggleMemberStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    }
  })

  return {
    members,
    loading: isLoading,
    error: error as Error | null,
    addMember: addMemberMutation.mutate,
    deleteMember: deleteMemberMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate
  }
} 