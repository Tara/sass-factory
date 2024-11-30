import { Database } from '../types/supabase'

export type Tables = Database['public']['Tables']
export type Venue = Tables['venues']['Row']
export type Show = Tables['shows']['Row']
export type Member = Tables['members']['Row']
export type ShowMember = Tables['show_members']['Row']

export type VenueInsert = Tables['venues']['Insert']
export type ShowInsert = Tables['shows']['Insert']
export type MemberInsert = Tables['members']['Insert']
export type ShowMemberInsert = Tables['show_members']['Insert'] 