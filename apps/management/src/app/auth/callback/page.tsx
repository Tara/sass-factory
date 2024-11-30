'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  
  useEffect(() => {
    const supabase = createClient()
    
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If we have a session, redirect to home
      if (session) {
        router.push('/')
        router.refresh()
      } else {
        // If no session, redirect to sign in
        router.push('/auth/signin')
      }
    })
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