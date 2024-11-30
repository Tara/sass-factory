import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType
  
  if (!token_hash || !type) {
    return new NextResponse('Missing token_hash or type', { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    if (type === 'signup') {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      })

      if (error) {
        console.error('Signup verification error:', error)
        return new NextResponse(error.message, { status: 400 })
      }

      return NextResponse.json({ data })
    }

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (verifyError) {
      console.error('Verification error:', verifyError)
      return new NextResponse(verifyError.message, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 