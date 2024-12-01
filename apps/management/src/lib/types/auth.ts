import type { User } from '@supabase/supabase-js'

export interface UserSession {
  user: User
  isAdmin: boolean
  isStaff: boolean
}

export interface AuthState {
  session: UserSession | null
  isLoading: boolean
} 