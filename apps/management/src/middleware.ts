import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired
  await supabase.auth.getSession()

  // Don't redirect auth-related routes
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return res
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect to signin
  if (!session && !request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth/confirm (email confirmation)
     * - api/auth/confirm (confirmation API)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|auth/confirm|api/auth/confirm).*)',
  ],
} 