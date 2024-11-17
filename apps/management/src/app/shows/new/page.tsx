'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { showSchema } from "@/lib/validation/show";

export default function NewShowPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [error, setError] = useState<string>("");
  const [venues, setVenues] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadVenues = async () => {
      const { data } = await supabase
        .from("venues")
        .select("id, name")
        .order("name");
      if (data) setVenues(data);
    };
    loadVenues();
  }, [supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const dateInput = formData.get("date") as string;
      const formattedDate = new Date(dateInput).toISOString();

      const data = {
        title: formData.get("title") as string,
        venue_id: formData.get("venue_id") as string,
        date: formattedDate,
      };

      const validated = showSchema.parse(data);

      const { error: supabaseError } = await supabase
        .from("shows")
        .insert([validated]);

      if (supabaseError) throw supabaseError;

      router.push("/shows");
      router.refresh();
    } catch (e) {
      console.error('Error details:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else if (e && typeof e === 'object' && 'errors' in e) {
        const zodError = e as { errors: Array<{ message: string }> };
        setError(zodError.errors.map(err => err.message).join(', '));
      } else {
        setError("Something went wrong while creating the show");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Show</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Show
        </button>
      </form>
    </div>
  );
} 