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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Sun, Moon, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { format, isSameDay, addMonths, subMonths } from 'date-fns'
import type { Database } from '@/lib/types/supabase'

type Availability = 'available' | 'maybe' | 'unavailable' | 'unknown'
type DayPeriod = 'morning' | 'evening'

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

interface CustomCalendarDayProps extends Omit<CalendarDayProps, 'displayMonth'> {
  date: Date
  displayMonth?: Date
  selected?: boolean
  className?: string
  onClick?: (day: Date) => void
  onMouseEnter?: (day: Date) => void
  onMouseLeave?: (day: Date) => void
}

export function AvailabilityCalendar({ initialMemberId }: AvailabilityCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('morning')
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({})
  const [month, setMonth] = useState<Date>(new Date())
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false)

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
        [selectedPeriod]: availabilityStatus,
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
    setIsUpdateSheetOpen(false)
  }

  const getDayAvailability = (date: Date): DayAvailability => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availability[dateStr] || { morning: 'available', evening: 'available' }
  }

  const getDayClass = (date: Date): string => {
    const { morning, evening } = getDayAvailability(date)
    
    if (morning === 'unknown' && evening === 'unknown') return 'bg-gray-200'
    if (morning === 'available' && evening === 'available') return 'bg-green-200'
    if (morning === 'unavailable' && evening === 'unavailable') return 'bg-red-200'
    if (morning === 'maybe' && evening === 'maybe') return 'bg-yellow-200'
    
    if (morning === 'available' && evening === 'unavailable') return 'bg-gradient-to-b from-green-200 to-red-200'
    if (morning === 'unavailable' && evening === 'available') return 'bg-gradient-to-b from-red-200 to-green-200'
    if (morning === 'unknown') return 'bg-gradient-to-b from-gray-200 to-green-200'
    if (evening === 'unknown') return 'bg-gradient-to-b from-green-200 to-gray-200'
    
    return 'bg-gradient-to-b from-yellow-200 to-green-200'
  }

 const CalendarDay = ({ date, displayMonth, selected, ...props }: DayProps): JSX.Element => {
  const isSelected = selectedDates.some(selectedDate => isSameDay(selectedDate, date))
  
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const newSelectedDates = isSelected
          ? selectedDates.filter(selectedDate => !isSameDay(selectedDate, date))
          : [...selectedDates, date]
        setSelectedDates(newSelectedDates)
      }}
      className={cn(
        'h-9 w-9 p-0 font-normal relative',
        'text-gray-900',
        'hover:opacity-70',
        'transition-all duration-200',
        getDayClass(date),
        isSelected && 'bg-primary text-primary-foreground font-medium hover:bg-primary hover:opacity-90',
        !isSelected && 'aria-selected:opacity-100',
        'hover:bg-transparent',
      )}
    >
      {format(date, 'd')}
    </Button>
  )
}

  const handleSelect: SelectMultipleEventHandler = (days) => {
    if (days) setSelectedDates(days)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
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
            <Sheet open={isUpdateSheetOpen} onOpenChange={setIsUpdateSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="default">Update Availability</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Update Availability</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <Select
                    value={selectedPeriod}
                    onValueChange={(value: DayPeriod) => setSelectedPeriod(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                        {selectedDates.map((date) => (
                          <div key={date.toISOString()} className="text-sm text-muted-foreground">
                            {format(date, 'MMMM d, yyyy')}
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
            components={{
              Day: CalendarDay
            }}
          />
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="bg-green-200">Fully Available</Badge>
            <Badge variant="outline" className="bg-yellow-200">Maybe Available</Badge>
            <Badge variant="outline" className="bg-red-200">Unavailable</Badge>
            <Badge variant="outline" className="bg-gray-200">Unknown</Badge>
            <Badge variant="outline" className="bg-gradient-to-b from-green-200 to-red-200">Morning Only</Badge>
            <Badge variant="outline" className="bg-gradient-to-b from-red-200 to-green-200">Evening Only</Badge>
            <Badge variant="outline" className="bg-gradient-to-b from-yellow-200 to-green-200">Partial Availability</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

