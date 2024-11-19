import { useCallback, useState } from 'react'
import { supabase } from '../supabase/client'

export type Member = {
  id: string
  name: string
  email: string
  photo_url: string
  created_at: string | null
  updated_at: string | null
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name')

      if (error) throw error

      setMembers(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const addMember = useCallback(async (member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert(member)
        .select()
        .single()

      if (error) throw error

      setMembers(prev => [...prev, data])
      return data
    } catch (e) {
      throw e
    }
  }, [])

  const updateMember = useCallback(async (id: string, updates: Partial<Member>) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setMembers(prev => prev.map(member => 
        member.id === id ? data : member
      ))
      return data
    } catch (e) {
      throw e
    }
  }, [])

  const deleteMember = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMembers(prev => prev.filter(member => member.id !== id))
    } catch (e) {
      throw e
    }
  }, [])

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember
  }
} 