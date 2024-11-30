import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  
  if (token_hash && type) {
    const supabase = createRouteHandlerClient({ cookies })
    // Only proceed if type is a valid email OTP type
    if (type === 'signup' || type === 'recovery' || type === 'invite' || type === 'email_change') {
      await supabase.auth.verifyOtp({ token_hash, type: type as EmailOtpType })
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/auth/callback`)
} 