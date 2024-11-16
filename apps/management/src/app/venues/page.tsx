'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Venue } from '@/types/supabase'

export default function Venues() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchVenues()
  }, [])

  async function fetchVenues() {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name')

      if (error) throw error
      setVenues(data || [])
    } catch (e) {
      console.error('Error:', e)
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh the venues list
      await fetchVenues()
      setDeleteId(null)
    } catch (e) {
      console.error('Error:', e)
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <div>Loading venues...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Venues</h1>
        <a
          href="/venues/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Venue
        </a>
      </div>
      
      {venues.length === 0 ? (
        <p>No venues found</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <li key={venue.id} className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-semibold">{venue.name}</h2>
              {venue.address && (
                <p className="text-gray-600 mt-1">{venue.address}</p>
              )}
              {venue.contact_email && (
                <p className="text-gray-500 text-sm mt-1">
                  <a href={`mailto:${venue.contact_email}`} className="hover:underline">
                    {venue.contact_email}
                  </a>
                </p>
              )}
              <div className="mt-4 flex space-x-2">
                <a
                  href={`/venues/${venue.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Edit
                </a>
                <button
                  onClick={() => setDeleteId(venue.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900">Delete Venue</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this venue? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteId && handleDelete(deleteId)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 