'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { validateVenueForm, type FormErrors } from '@/lib/validation/venue';
import { ErrorMessage } from '@/components/layout/ErrorMessage';
import type { Venue, NewVenue } from '@/types/venue';

interface VenueFormProps {
  initialData?: Partial<Venue>;
  onSubmit?: (venue: NewVenue) => Promise<void>;
}

export function VenueForm({ initialData, onSubmit }: VenueFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFormErrors({});

    const formData = new FormData(e.currentTarget);
    const errors = validateVenueForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    const venue = {
      name: (formData.get('name') as string).trim(),
      address: (formData.get('address') as string)?.trim() || null,
      contact_email: (formData.get('contact_email') as string)?.trim() || null,
    };

    try {
      if (onSubmit) {
        await onSubmit(venue);
      } else {
        const { error: supabaseError } = await supabase
          .from('venues')
          .insert([venue]);

        if (supabaseError) throw supabaseError;

        router.push('/venues');
        router.refresh();
      }
    } catch (e) {
      console.error('Error:', e);
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          defaultValue={initialData?.name}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            formErrors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.name && (
          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          name="address"
          id="address"
          defaultValue={initialData?.address}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
          Contact Email
        </label>
        <input
          type="email"
          name="contact_email"
          id="contact_email"
          defaultValue={initialData?.contact_email}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            formErrors.email ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Venue'}
        </button>
      </div>
    </form>
  );
}