'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthState } from '@/lib/types/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: true,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setState({ session: null, isLoading: false })
        return
      }

      // Check if user has staff role (admin or manager)
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)

      const isAdmin = userRoles?.some(role => role.role === 'admin') ?? false
      const isStaff = userRoles?.some(role => ['admin', 'manager'].includes(role.role)) ?? false

      setState({
        session: {
          user: session.user,
          isAdmin,
          isStaff
        },
        isLoading: false,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Check if user has staff role (admin or manager)
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)

        const isAdmin = userRoles?.some(role => role.role === 'admin') ?? false
        const isStaff = userRoles?.some(role => ['admin', 'manager'].includes(role.role)) ?? false

        setState({
          session: {
            user: session.user,
            isAdmin,
            isStaff
          },
          isLoading: false,
        })
      } else {
        setState({ session: null, isLoading: false })
      }
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }, [supabase])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/')
  }, [supabase, router])

  return {
    ...state,
    signIn,
    signOut,
  }
} 