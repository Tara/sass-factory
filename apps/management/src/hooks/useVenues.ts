// src/hooks/useVenues.ts
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Venue } from '@/types/venue';

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadVenues() {
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("*")
          .order("name");

        if (error) throw error;
        setVenues(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadVenues();
  }, [supabase]);

  return { venues, loading, error };
}

export function useVenue(id: string) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadVenue() {
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("*")
          .eq('id', id)
          .single();

        if (error) throw error;
        setVenue(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadVenue();
  }, [id, supabase]);

  return { venue, loading, error };
}