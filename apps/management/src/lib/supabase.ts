import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Log environment in development only
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode')
  console.log('Supabase URL:', supabaseUrl)
  // Don't log the full key for security
  console.log('Supabase Key exists:', !!supabaseAnonKey)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
}) 