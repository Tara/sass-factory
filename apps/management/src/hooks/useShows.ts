// src/hooks/useShows.ts
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Show } from '@/types/show';

export function useShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadShows() {
      try {
        const { data, error } = await supabase
          .from("shows")
          .select(`
            *,
            venue:venues (
              id,
              name
            )
          `);

        if (error) throw error;
        setShows(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadShows();
  }, [supabase]);

  return { shows, loading, error };
}

export function useShow(id: string) {
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadShow() {
      try {
        const { data, error } = await supabase
          .from("shows")
          .select(`
            *,
            venue:venues (
              id,
              name
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setShow(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadShow();
  }, [id, supabase]);

  return { show, loading, error };
}