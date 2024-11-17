'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ShowForm } from "@/components/shows/ShowForm";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import type { Show } from '@/types/show';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditShowPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadShow = async () => {
      try {
        const { data, error: showError } = await supabase
          .from("shows")
          .select(`
            id,
            title,
            date,
            venue_id
          `)
          .eq("id", id)
          .single();

        if (showError) throw showError;
        
        console.log('Loaded show:', data); // Debug log
        setShow(data);
      } catch (err) {
        console.error('Error loading show:', err);
        setError(err instanceof Error ? err.message : 'Failed to load show');
      } finally {
        setLoading(false);
      }
    };

    loadShow();
  }, [id, supabase]);

  const handleUpdate = async (updatedShow: Partial<Show>) => {
    try {
      const { error: updateError } = await supabase
        .from("shows")
        .update(updatedShow)
        .eq("id", id)
        .select();

      if (updateError) throw updateError;

      router.push(`/shows/${id}`);
      router.refresh();
    } catch (err) {
      console.error('Error updating show:', err);
      throw err;
    }
  };

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

  if (!show) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-600">Show not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/shows/${id}`}
          className="text-blue-500 hover:text-blue-600"
        >
          ← Back to Show Details
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Show</h1>

      <ShowForm 
        initialData={show}
        onSubmit={handleUpdate}
      />
    </div>
  );
}