'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface OSMResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
}

interface ValidatedAddress {
  formattedAddress: string
  lat: number
  lng: number
  placeId: number
  osmId: number
}

interface AddressInputProps {
  onAddressSelect: (address: ValidatedAddress) => void
  initialValue?: string
  className?: string
  placeholder?: string
}

// Custom debounce hook
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])
}

export function AddressInput({
  onAddressSelect,
  initialValue = '',
  className = '',
  placeholder = 'Enter an address'
}: AddressInputProps) {
  const [input, setInput] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<OSMResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddress = useCallback(async (searchText: string) => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchText
        )}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NextJS Address Validation Component'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch address suggestions')
      }

      const data: OSMResult[] = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (err) {
      setError('Failed to fetch address suggestions. Please try again.')
      console.error('Error fetching addresses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSearch = useDebounce(searchAddress, 1000)

  const handleSelect = (result: OSMResult) => {
    const validatedAddress: ValidatedAddress = {
      formattedAddress: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      placeId: result.place_id,
      osmId: result.osm_id
    }

    setInput(result.display_name)
    setSuggestions([])
    setShowSuggestions(false)
    onAddressSelect(validatedAddress)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    debouncedSearch(value)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-md ${className}`}
        aria-label="Address input with autocomplete"
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="w-4 h-4 border-t-2 border-blue-500 border-solid rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((result) => (
            <li
              key={result.place_id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
              onClick={() => handleSelect(result)}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-1 text-xs text-gray-500">
        Data © OpenStreetMap contributors
      </div>
    </div>
  )
}