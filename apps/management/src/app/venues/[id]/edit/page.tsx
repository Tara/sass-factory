'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Venue } from '@/types/supabase'

type FormErrors = {
  name?: string
  email?: string
}

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default function EditVenue({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  useEffect(() => {
    async function fetchVenue() {
      if (!id) return
      
      try {
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setVenue(data)
      } catch (e) {
        console.error('Error:', e)
        setError(e instanceof Error ? e.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchVenue()
  }, [id])

  function validateForm(formData: FormData): FormErrors {
    const errors: FormErrors = {}
    const name = formData.get('name') as string
    const email = formData.get('contact_email') as string

    if (!name || name.trim().length === 0) {
      errors.name = 'Name is required'
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    return errors
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setFormErrors({})

    const formData = new FormData(e.currentTarget)
    const errors = validateForm(formData)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setSaving(false)
      return
    }

    const updatedVenue = {
      name: (formData.get('name') as string).trim(),
      address: (formData.get('address') as string)?.trim() || null,
      contact_email: (formData.get('contact_email') as string)?.trim() || null,
    }

    try {
      const { error: supabaseError } = await supabase
        .from('venues')
        .update(updatedVenue)
        .eq('id', id)

      if (supabaseError) throw supabaseError

      router.push('/venues')
      router.refresh()
    } catch (e) {
      console.error('Error:', e)
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading venue...</div>
  if (error) return <div>Error: {error}</div>
  if (!venue) return <div>Venue not found</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Venue</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            defaultValue={venue.name}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
            defaultValue={venue.address || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            defaultValue={venue.contact_email || ''}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 