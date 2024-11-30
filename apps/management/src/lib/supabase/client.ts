import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/types/supabase'

export const createClient = () => createClientComponentClient<Database>() 