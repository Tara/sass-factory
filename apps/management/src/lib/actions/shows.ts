'use server'

import { createServerActionClient } from '@/lib/supabase/server'
import { showSchema, type ShowFormValues } from '@/lib/validations/show'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/supabase'

interface UpdateShowData extends ShowFormValues {
  id: string
}

type ShowStatus = Database['public']['Tables']['shows']['Row']['status']

export async function updateShow(data: UpdateShowData) {
  if (!data.id) throw new Error('Show ID is required')
  
  const validated = showSchema.parse(data)
  const { id, ...updateData } = validated

  const formattedData = {
    ...updateData,
    price: updateData.price ? Number(updateData.price) : undefined,
    status: updateData.status as ShowStatus,
  }

  const supabase = createServerActionClient()

  const { error } = await supabase
    .from('shows')
    .update(formattedData)
    .eq('id', id as string)

  if (error) throw error

  revalidatePath('/shows')
  revalidatePath(`/shows/${id}`)
} 