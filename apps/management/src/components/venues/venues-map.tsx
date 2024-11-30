'use client'

import { useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Venue } from '@/lib/types/venues'

interface VenuesMapProps {
  venues: Venue[]
}

export function VenuesMap({ venues }: VenuesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry', 'marker']
        })

        const { Map } = await loader.importLibrary('maps')
        const { AdvancedMarkerElement } = await loader.importLibrary('marker')

        // Initialize map if not already initialized
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new Map(mapRef.current, {
            center: { lat: 0, lng: 0 },
            zoom: 2,
            mapId: 'YOUR_MAP_ID' // Replace with your map ID
          })
        }

        // Clear existing markers
        markersRef.current.forEach(marker => marker.map = null)
        markersRef.current = []

        const bounds = new google.maps.LatLngBounds()
        const geocoder = new google.maps.Geocoder()

        // Create markers for each venue
        await Promise.all(venues.map(async (venue) => {
          try {
            const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              geocoder.geocode({ address: venue.address }, (results, status) => {
                if (status === 'OK' && results) resolve(results)
                else reject(new Error(`Geocoding failed: ${status}`))
              })
            })

            if (!results[0]) return

            const position = results[0].geometry.location
            
            const markerContent = document.createElement('div')
            markerContent.innerHTML = `
              <div class="bg-white p-2 rounded-lg shadow-md">
                <h3 class="font-bold text-sm">${venue.name}</h3>
                <p class="text-xs text-gray-600">${venue.address}</p>
              </div>
            `

            const marker = new AdvancedMarkerElement({
              map: mapInstanceRef.current,
              position,
              title: venue.name,
              content: markerContent
            })

            bounds.extend(position)
            markersRef.current.push(marker)
          } catch (error) {
            console.error(`Error creating marker for ${venue.name}:`, error)
          }
        }))

        // Adjust map to fit all markers
        if (markersRef.current.length > 0) {
          mapInstanceRef.current.fitBounds(bounds)
          if (markersRef.current.length === 1) {
            mapInstanceRef.current.setZoom(14)
          }
        }

      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initMap()

    // Cleanup function
    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.map = null)
        markersRef.current = []
      }
    }
  }, [venues]) // Only re-run when venues change

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg shadow-md" 
      aria-label="Map showing venue locations"
    />
  )
}