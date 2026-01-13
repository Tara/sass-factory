'use server'

import { createServerActionClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { 
  fullName: string,
  avatarUrl: string 
}) {
  try {
    const supabase = createServerActionClient()
    
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
      }
    })

    if (error) throw error

    revalidatePath('/', 'layout') // Revalidate root layout
    
    return { success: true }
  } catch (error) {
    console.error('Server action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile'
    }
  }
}