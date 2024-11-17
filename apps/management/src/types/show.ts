import { Venue } from './venue';
import { Database } from './supabase';

export type Show = Database['public']['Tables']['shows']['Row'] & {
  venue?: Pick<Venue, 'id' | 'name'>;
};

export type ShowWithVenue = Show & {
  venue: Pick<Venue, 'id' | 'name'>;
};

export type NewShow = Pick<Show, 'title' | 'venue_id' | 'date'>;

export type ShowPerformer = {
  id: string;
  show_id: string;
  name: string;
  status: 'INVITED' | 'CONFIRMED' | 'DECLINED';
  created_at: string;
};