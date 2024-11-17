'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { showSchema } from "@/lib/validation/show";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import type { Show, NewShow } from "@/types/show";

interface ShowFormProps {
  initialData?: Partial<Show>;
  onSubmit?: (show: NewShow) => Promise<void>;
}

export function ShowForm({ initialData, onSubmit }: ShowFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [venues, setVenues] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(initialData?.venue_id || '');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadVenues = async () => {
      setVenuesLoading(true);
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("id, name")
          .order("name");
          
        if (error) throw error;
        if (data) setVenues(data);
      } catch (e) {
        console.error('Error loading venues:', e);
        setError('Failed to load venues');
      } finally {
        setVenuesLoading(false);
      }
    };

    loadVenues();
  }, [supabase]);

  // Update selectedVenue when initialData changes
  useEffect(() => {
    if (initialData?.venue_id) {
      setSelectedVenue(initialData.venue_id);
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const dateInput = formData.get("date") as string;
      const formattedDate = new Date(dateInput).toISOString();

      const data = {
        title: formData.get("title") as string,
        venue_id: selectedVenue,
        date: formattedDate,
      };

      const validated = showSchema.parse(data);

      if (onSubmit) {
        await onSubmit(validated);
      } else {
        const { error: supabaseError } = await supabase
          .from("shows")
          .insert([validated]);

        if (supabaseError) throw supabaseError;

        router.push("/shows");
        router.refresh();
      }
    } catch (e) {
      console.error('Error details:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else if (e && typeof e === 'object' && 'errors' in e) {
        const zodError = e as { errors: Array<{ message: string }> };
        setError(zodError.errors.map(err => err.message).join(', '));
      } else {
        setError("Something went wrong while saving the show");
      }
    } finally {
      setLoading(false);
    }
  };

  if (venuesLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={initialData?.title}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="venue_id" className="block text-sm font-medium text-gray-700">
          Venue
        </label>
        <select
          id="venue_id"
          name="venue_id"
          required
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a venue</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date and Time
        </label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          defaultValue={initialData?.date?.slice(0, 16)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          href={initialData ? `/shows/${initialData.id}` : "/shows"}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Show'}
        </button>
      </div>
    </form>
  );
}