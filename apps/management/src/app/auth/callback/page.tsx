'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  
  useEffect(() => {
    const supabase = createClient()
    
    async function checkSession() {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
        router.push('/auth/error')
        return
      }

      if (!session) {
        router.push('/auth/signin')
        return
      }

      // Check if email is confirmed
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email_confirmed_at) {
        router.push('/auth/verify-email')
        return
      }

      // If everything is good, redirect to home
      router.push('/')
      router.refresh()
    }

    checkSession()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Finalizing authentication...</h1>
        <p className="text-muted-foreground">
          Please wait while we complete the process.
        </p>
      </div>
    </div>
  )
}