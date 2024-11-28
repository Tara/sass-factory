import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'
import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // @ts-ignore - Next.js types are incorrect
            cookieStore.set(name, value, options)
          } catch (error) {
            console.warn('Could not set cookie', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // @ts-ignore - Next.js types are incorrect
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.warn('Could not remove cookie', error)
          }
        },
      },
    }
  )
} 