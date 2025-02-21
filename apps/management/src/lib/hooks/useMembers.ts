import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/supabase'
import type { Member, NewMember, MemberStatus } from '@/lib/types/members'

function getDefaultAvatar(name: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(name)}`
}

async function fetchMembers(supabase: any): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true })
    .order('join_date', { ascending: false })

  if (error) throw error
  return data as Member[]
}

async function deleteMember(id: string, supabase: any) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

  if (error) throw error
}

async function toggleMemberStatus(id: string, currentStatus: MemberStatus, supabase: any) {
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
  const supabase = createClient()

  const { data: members = [], isLoading, error } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => fetchMembers(supabase)
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
    mutationFn: (id: string) => deleteMember(id, supabase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: MemberStatus }) => 
      toggleMemberStatus(id, status, supabase),
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