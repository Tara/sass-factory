'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Show } from '@/types/supabase'

export default function Shows() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchShows() {
      try {
        console.log('Fetching shows...')
        const { data, error } = await supabase
          .from('shows')
          .select(`
            *,
            venue:venues(name, address)
          `)
          .order('date', { ascending: true })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        console.log('Shows data:', data)
        setShows(data || [])
      } catch (e) {
        console.error('Detailed error:', e)
        setError(e instanceof Error ? e.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchShows()
  }, [])

  if (loading) return <div>Loading shows...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shows</h1>
      {shows.length === 0 ? (
        <p>No shows found</p>
      ) : (
        <ul className="space-y-4">
          {shows.map((show) => (
            <li key={show.id} className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-semibold">{show.title}</h2>
              <p className="text-gray-600">
                {new Date(show.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">{show.venue?.name}</p>
              {show.venue?.address && (
                <p className="text-gray-500 text-sm">{show.venue.address}</p>
              )}
              {show.price && (
                <p className="text-gray-500 text-sm">Price: {show.price}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 