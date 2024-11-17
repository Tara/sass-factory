'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { showSchema } from "@/lib/validation/show";
import Link from "next/link";

export default function EditShowPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [error, setError] = useState<string>("");
  const [venues, setVenues] = useState<Array<{ id: string; name: string }>>([]);
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShow = async () => {
      const { data: show, error: showError } = await supabase
        .from("shows")
        .select("*")
        .eq("id", id)
        .single();

      if (showError) {
        setError("Failed to load show");
        return;
      }

      setShow(show);
      setLoading(false);
    };

    const loadVenues = async () => {
      const { data } = await supabase
        .from("venues")
        .select("id, name")
        .order("name");
      if (data) setVenues(data);
    };

    loadShow();
    loadVenues();
  }, [id, supabase]);

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
      const { data: updateData, error: supabaseError } = await supabase
        .from("shows")
        .update(validated)
        .eq("id", id)
        .select()
        .single();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message);
      }

      console.log('Update successful:', updateData);
      router.push(`/shows/${id}`);
      router.refresh();
    } catch (e) {
      console.error('Error details:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else if (e && typeof e === 'object' && 'errors' in e) {
        const zodError = e as { errors: Array<{ message: string }> };
        setError(zodError.errors.map(err => err.message).join(', '));
      } else {
        setError("Something went wrong while updating the show");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!show) {
    return <div>Show not found</div>;
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
            defaultValue={show.title}
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
            defaultValue={show.venue_id}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
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
            defaultValue={show.date.slice(0, 16)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href={`/shows/${id}`}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
} 