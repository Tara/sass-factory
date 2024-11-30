'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ConfirmEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!token_hash || !type) {
      router.push('/auth/error')
      return
    }

    // Call our API route
    fetch(`/api/auth/confirm?token_hash=${token_hash}&type=${type}`)
      .then((res) => {
        if (res.ok) router.push('/auth/callback')
        else router.push('/auth/error')
      })
      .catch(() => router.push('/auth/error'))
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Confirming your email...</h1>
        <p className="text-muted-foreground">
          Please wait while we verify your email address.
        </p>
      </div>
    </div>
  )
} 