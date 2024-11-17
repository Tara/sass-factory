'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { VenueForm } from "@/components/venues/VenueForm";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import type { Venue } from '@/types/venue';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditVenuePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchVenue() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setVenue(data);
      } catch (e) {
        console.error('Error:', e);
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchVenue();
  }, [id, supabase]);

  async function handleSubmit(updatedVenue: Partial<Venue>) {
    try {
      const { error: supabaseError } = await supabase
        .from('venues')
        .update(updatedVenue)
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      router.push('/venues');
      router.refresh();
    } catch (e) {
      console.error('Error:', e);
      throw e;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4 max-w-lg">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-600">Venue not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Venue</h1>
        </div>

        <VenueForm 
          initialData={venue} 
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}