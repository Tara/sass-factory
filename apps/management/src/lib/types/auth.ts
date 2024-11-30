export interface UserSession {
  user: {
    id: string
    email?: string
    user_metadata: {
      avatar_url?: string
      full_name?: string
    }
  }
  isAdmin: boolean
}

export interface AuthState {
  session: UserSession | null
  isLoading: boolean
  error?: Error | null
} 