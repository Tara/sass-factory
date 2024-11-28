import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/supabase'

export const createServerClient = () => 
  createServerComponentClient<Database>({
    cookies,
  })

export const getSession = async () => {
  const supabase = createServerClient()
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) throw error

    if (!session) return null

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', session.user.id)
      .single()

    return {
      user: session.user,
      isAdmin: !!adminData
    }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
} 