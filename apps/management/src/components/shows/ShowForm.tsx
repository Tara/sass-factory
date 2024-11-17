'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { showSchema } from "@/lib/validation/show";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import { useVenues } from "@/hooks/useVenues";
import type { NewShow } from "@/types/show";

interface ShowFormProps {
  onSubmit?: (show: NewShow) => Promise<void>;
  initialData?: Partial<NewShow>;
}

export function ShowForm({ onSubmit, initialData }: ShowFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(initialData?.date?.slice(0, 16) || "");
  const { venues, loading } = useVenues();
  const supabase = createClientComponentClient();

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
        setError("Something went wrong while creating the show");
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    // This will close the calendar by removing focus
    e.target.blur();
  };

  if (loading) {
    return <div>Loading venues...</div>;
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
          required
          defaultValue={initialData?.title}
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
          defaultValue={initialData?.venue_id}
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
          required
          value={selectedDate}
          onChange={handleDateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {initialData ? 'Update Show' : 'Create Show'}
      </button>
    </form>
  );
}