'use client'

import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import { useEffect, useState } from 'react'
import { Database } from '@/lib/types/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import '@/styles/calendar.css'

type Availability = Database['public']['Tables']['availability']['Row']
type AvailabilityPriority = Database['public']['Enums']['availability_priority']

interface AvailabilityEvent {
  id: string
  title: string
  start: Date
  end: Date
  period: 'morning' | 'evening'
  priority: AvailabilityPriority | null
  available: boolean
}

interface CalendarProps {
  initialMemberId: string
}

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function Calendar({ initialMemberId }: CalendarProps) {
  const { isLoading } = useAuth()
  const [events, setEvents] = useState<AvailabilityEvent[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date
    period: 'morning' | 'evening'
  } | null>(null)

  // Load initial availability data
  useEffect(() => {
    if (isLoading) return

    const loadAvailability = async () => {
      const supabase = createClient()
      const { data: availabilityData, error } = await supabase
        .from('availability')
        .select('*')
        .eq('member_id', initialMemberId)

      if (error) {
        console.error('Error loading availability:', error)
        return
      }

      // Convert availability data to events
      const newEvents: AvailabilityEvent[] = []
      availabilityData.forEach((avail: Availability) => {
        const date = new Date(avail.date)
        
        if (avail.morning_available) {
          newEvents.push({
            id: `${avail.id}-morning`,
            title: `Morning - ${avail.morning_priority || 'Available'}`,
            start: new Date(date.setHours(9)),
            end: new Date(date.setHours(12)),
            period: 'morning',
            priority: avail.morning_priority,
            available: true,
          })
        }
        
        if (avail.evening_available) {
          newEvents.push({
            id: `${avail.id}-evening`,
            title: `Evening - ${avail.evening_priority || 'Available'}`,
            start: new Date(date.setHours(17)),
            end: new Date(date.setHours(20)),
            period: 'evening',
            priority: avail.evening_priority,
            available: true,
          })
        }
      })

      setEvents(newEvents)
    }

    loadAvailability()
  }, [initialMemberId, isLoading])

  const handleSelectSlot = async ({ start }: { start: Date }) => {
    // Toggle between morning and evening on click
    const period = start.getHours() < 12 ? 'morning' : 'evening'
    setSelectedSlot({ date: start, period })
  }

  const handleAvailabilityChange = async (priority: AvailabilityPriority | null) => {
    if (!selectedSlot) return

    const supabase = createClient()
    const { date, period } = selectedSlot

    const availabilityData = {
      member_id: initialMemberId,
      date: format(date, 'yyyy-MM-dd'),
      [`${period}_available`]: true,
      [`${period}_priority`]: priority,
    }

    const { error } = await supabase
      .from('availability')
      .upsert(availabilityData, {
        onConflict: 'member_id,date',
      })

    if (error) {
      console.error('Error updating availability:', error)
      return
    }

    // Update local state
    setEvents(prev => {
      const existingEventIndex = prev.findIndex(
        e => 
          e.start.toDateString() === date.toDateString() && 
          e.period === period
      )

      const newEvent: AvailabilityEvent = {
        id: `${date.toISOString()}-${period}`,
        title: `${period} - ${priority || 'Available'}`,
        start: new Date(date.setHours(period === 'morning' ? 9 : 17)),
        end: new Date(date.setHours(period === 'morning' ? 12 : 20)),
        period,
        priority,
        available: true,
      }

      if (existingEventIndex >= 0) {
        return [
          ...prev.slice(0, existingEventIndex),
          newEvent,
          ...prev.slice(existingEventIndex + 1),
        ]
      }

      return [...prev, newEvent]
    })

    setSelectedSlot(null)
  }

  const eventStyleGetter = (event: AvailabilityEvent) => {
    const priorityColors = {
      high: 'bg-green-500',
      medium: 'bg-yellow-500',
      low: 'bg-red-500',
    }

    const baseStyle = event.available
      ? priorityColors[event.priority as keyof typeof priorityColors] || 'bg-blue-500'
      : 'bg-gray-300'

    return {
      className: cn(
        'text-white rounded-md px-2 py-1',
        baseStyle,
        'hover:opacity-80 transition-opacity'
      ),
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="h-[600px] p-4">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventStyleGetter}
        views={['month']}
        defaultView="month"
      />

      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">
              Set {selectedSlot.period} availability for{' '}
              {format(selectedSlot.date, 'MMMM d, yyyy')}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => handleAvailabilityChange('high')}
              >
                High Priority
              </Button>
              <Button
                variant="default"
                onClick={() => handleAvailabilityChange('medium')}
              >
                Medium Priority
              </Button>
              <Button
                variant="default"
                onClick={() => handleAvailabilityChange('low')}
              >
                Low Priority
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedSlot(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 