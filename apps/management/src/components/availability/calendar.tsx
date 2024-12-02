'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import type { DayProps, SelectMultipleEventHandler } from 'react-day-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sun, Moon, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { format, isSameDay, addMonths, subMonths, eachDayOfInterval, isWithinInterval } from 'date-fns'
import type { Database } from '@/lib/types/supabase'

type Availability = 'available' | 'maybe' | 'unavailable' | 'unknown'
type DayPeriod = 'all-day' | 'morning' | 'evening'

interface DayAvailability {
  morning: Availability
  evening: Availability
}

interface AvailabilityCalendarProps {
  initialMemberId: string
}

interface AvailabilityRow {
  id: string
  member_id: string | null
  date: string
  morning_availability: Availability
  evening_availability: Availability
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export function AvailabilityCalendar({ initialMemberId }: AvailabilityCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('all-day')
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({})
  const [month, setMonth] = useState<Date>(new Date())

  useEffect(() => {
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

      const availabilityMap = (availabilityData as unknown as AvailabilityRow[]).reduce((acc, curr) => ({
        ...acc,
        [curr.date]: {
          morning: curr.morning_availability,
          evening: curr.evening_availability,
        },
      }), {} as Record<string, DayAvailability>)

      setAvailability(availabilityMap)
    }

    loadAvailability()
  }, [initialMemberId])

  const handleUpdateAvailability = async (availabilityStatus: Availability) => {
    const supabase = createClient()
    
    for (const date of selectedDates) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const currentAvailability = availability[dateStr] || { morning: 'available', evening: 'available' }
      
      const updatedAvailability = {
        ...currentAvailability,
        morning: selectedPeriod === 'all-day' || selectedPeriod === 'morning' ? availabilityStatus : currentAvailability.morning,
        evening: selectedPeriod === 'all-day' || selectedPeriod === 'evening' ? availabilityStatus : currentAvailability.evening,
      }

      const { error } = await supabase
        .from('availability')
        .upsert({
          member_id: initialMemberId,
          date: dateStr,
          morning_availability: updatedAvailability.morning,
          evening_availability: updatedAvailability.evening,
        }, {
          onConflict: 'member_id,date',
        })

      if (error) {
        console.error('Error updating availability:', error)
        continue
      }

      setAvailability(prev => ({
        ...prev,
        [dateStr]: updatedAvailability,
      }))
    }

    setSelectedDates([])
  }

  const getDayAvailability = (date: Date): DayAvailability => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availability[dateStr] || { morning: 'available', evening: 'available' }
  }

  const getDayClass = (date: Date, isSelected: boolean): string => {
    const { morning, evening } = getDayAvailability(date)
    
    const baseClasses = cn(
      'h-9 w-9 p-0 font-normal relative',
      'text-gray-900',
      'transition-all duration-200',
      'hover:brightness-95',
      {
        'bg-primary text-primary-foreground': isSelected,
      }
    )

    if (isSelected) return baseClasses

    // Simplified color states
    if (morning === 'unknown' && evening === 'unknown') 
      return cn(baseClasses, 'bg-gray-200')
    if (morning === 'available' && evening === 'available') 
      return cn(baseClasses, 'bg-green-200')
    if (morning === 'unavailable' && evening === 'unavailable') 
      return cn(baseClasses, 'bg-red-200')
    if (morning === 'maybe' && evening === 'maybe') 
      return cn(baseClasses, 'bg-yellow-200')

    // Mixed states
    return cn(baseClasses, 'bg-orange-200')
  }

  function renderCalendarDay({ date, displayMonth }: DayProps): JSX.Element {
    const isSelected = selectedDates.some(selectedDate => isSameDay(selectedDate, date))
    
    return (
      <Button
        variant="ghost"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const newSelectedDates = isSelected
            ? selectedDates.filter(selectedDate => !isSameDay(selectedDate, date))
            : [...selectedDates, date]
          setSelectedDates(newSelectedDates)
        }}
        className={getDayClass(date, isSelected)}
      >
        {format(date, 'd')}
      </Button>
    )
  }

  const handleSelect: SelectMultipleEventHandler = (days) => {
    if (days) setSelectedDates(days)
  }

  const getSelectedDateRanges = () => {
    if (selectedDates.length === 0) return []
    
    const sortedDates = selectedDates.sort((a, b) => a.getTime() - b.getTime())
    const ranges: [Date, Date][] = []
    let rangeStart = sortedDates[0]

    for (let i = 1; i < sortedDates.length; i++) {
      if (sortedDates[i].getTime() - sortedDates[i-1].getTime() > 86400000) { // More than 1 day difference
        ranges.push([rangeStart, sortedDates[i-1]])
        rangeStart = sortedDates[i]
      }
    }

    ranges.push([rangeStart, sortedDates[sortedDates.length - 1]])
    return ranges
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Availability</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMonth(subMonths(month, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMonth(addMonths(month, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
            components={{
              Day: renderCalendarDay
            }}
          />
          
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="bg-green-200">Available</Badge>
            <Badge variant="outline" className="bg-yellow-200">Maybe</Badge>
            <Badge variant="outline" className="bg-red-200">Unavailable</Badge>
            <Badge variant="outline" className="bg-gray-200">Unknown</Badge>
            <Badge variant="outline" className="bg-orange-200">Mixed</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Update Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedPeriod}
              onValueChange={(value: DayPeriod) => setSelectedPeriod(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-day">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="w-4 h-4" />
                    All Day
                  </div>
                </SelectItem>
                <SelectItem value="morning">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Morning
                  </div>
                </SelectItem>
                <SelectItem value="evening">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Evening
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {selectedDates.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Selected Dates:</div>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {getSelectedDateRanges().map(([start, end], index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {isSameDay(start, end) 
                        ? format(start, 'MMMM d, yyyy')
                        : `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              {selectedDates.length > 0
                ? `Set availability for ${selectedDates.length} selected ${
                    selectedDates.length === 1 ? 'day' : 'days'
                  }`
                : 'Select dates on the calendar to update availability'}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleUpdateAvailability('available')}
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={selectedDates.length === 0}
              >
                Available
              </Button>
              <Button
                onClick={() => handleUpdateAvailability('maybe')}
                className="w-full bg-yellow-500 hover:bg-yellow-600"
                disabled={selectedDates.length === 0}
              >
                Maybe
              </Button>
              <Button
                onClick={() => handleUpdateAvailability('unavailable')}
                className="w-full bg-red-500 hover:bg-red-600"
                disabled={selectedDates.length === 0}
              >
                Unavailable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
