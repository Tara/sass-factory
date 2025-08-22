'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>()
  const supabase = createClient()

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!token_hash || !type) {
      setError('Invalid verification link')
      router.push('/auth/error')
      return
    }

    const verifyEmail = async () => {
      try {
        // First, try to verify directly with Supabase client
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        })

        if (verifyError) {
          console.error('Direct verification failed:', verifyError)
          // Fall back to API route if direct verification fails
          const apiUrl = `${window.location.origin}/api/auth/confirm?token_hash=${token_hash}&type=${type}`
          const res = await fetch(apiUrl)
          
          if (!res.ok) {
            const text = await res.text()
            console.error('API verification failed:', text)
            throw new Error(text)
          }
        }

        // Check session status
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw new Error('Failed to establish session')
        }

        if (session) {
          router.push('/auth/callback')
        } else {
          router.push('/auth/signin?message=Email confirmed. Please sign in.')
        }
      } catch (error) {
        console.error('Error during verification:', error)
        setError('Failed to verify email')
        router.push('/auth/error')
      }
    }

    verifyEmail()
  }, [searchParams, router, supabase.auth])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-red-500">Verification Failed</h1>
            <p className="text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Confirming your email...</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmEmail() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">
            Please wait while we load the verification page.
          </p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
} 