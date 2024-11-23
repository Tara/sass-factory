'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Venue } from '@/lib/hooks/useVenues'

interface VenuesMapProps {
  venues: Venue[]
}

export function VenuesMap({ venues }: VenuesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places', 'geometry']
      })

      try {
        await loader.load()
        
        if (!mapRef.current) return

        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
        })

        setMap(newMap)

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null))
        setMarkers([])

        // Add markers for each venue
        const newMarkers: google.maps.Marker[] = []
        const bounds = new google.maps.LatLngBounds()
        const geocoder = new google.maps.Geocoder()

        await Promise.all(venues.map(async (venue) => {
          try {
            const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              geocoder.geocode({ address: venue.address }, (results, status) => {
                if (status === 'OK' && results) {
                  resolve(results)
                } else {
                  reject(status)
                }
              })
            })

            if (results[0]) {
              const marker = new google.maps.Marker({
                map: newMap,
                position: results[0].geometry.location,
                title: venue.name,
              })

              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-bold mb-1">${venue.name}</h3>
                    <p>${venue.address}</p>
                  </div>
                `
              })

              marker.addListener('click', () => {
                infoWindow.open(newMap, marker)
              })

              bounds.extend(results[0].geometry.location)
              newMarkers.push(marker)
            }
          } catch (error) {
            console.error(`Error geocoding address for ${venue.name}:`, error)
          }
        }))

        setMarkers(newMarkers)

        // Adjust map to fit all markers
        if (newMarkers.length > 0) {
          newMap.fitBounds(bounds)
          if (newMarkers.length === 1) {
            newMap.setZoom(14) // Closer zoom for single location
          }
        }

      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initMap()

    // Cleanup function
    return () => {
      markers.forEach(marker => marker.setMap(null))
      setMarkers([])
    }
  }, [venues]) // Remove map from dependencies to prevent re-initialization

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg shadow-md" 
      aria-label="Map showing venue locations"
    />
  )
}