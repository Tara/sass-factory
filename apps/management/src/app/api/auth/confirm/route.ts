import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  
  if (!token_hash || !type) 
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=invalid_token`)
  
  // Verify the type is valid
  if (type !== 'email' && type !== 'signup' && type !== 'recovery' && type !== 'invite')
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=invalid_type`)

  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    await supabase.auth.verifyOtp({ token_hash, type })
  } catch (error) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=verification_failed`)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/auth/callback`)
} 