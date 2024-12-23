'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  format, 
  isSunday, 
  startOfQuarter, 
  endOfQuarter,
  startOfDay,
  isSameDay,
  isWithinInterval,
  addQuarters,
  subQuarters
} from 'date-fns'
import type { Member } from '@/lib/types/members'
import type { DayAvailability } from '@/lib/types/availability'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RehearsalSuggestions } from './rehearsal-suggestions'

// Constants
const REHEARSAL_TIME = {
  hour: 11,
  minute: 0,
  durationMinutes: 90
} as const

const MIN_REQUIRED_MEMBERS = 4

interface TeamAvailabilityViewProps {
  members: Member[]
  availability: Record<string, Record<string, DayAvailability>>  // memberId -> date -> availability
}

export interface DayAvailabilitySummary {
  available: Member[]
  maybe: Member[]
  unavailable: Member[]
  unknown: Member[]
  ratio: number // ratio of available members
}

export function TeamAvailabilityView({ members, availability }: TeamAvailabilityViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<[Date, Date]>(() => {
    const start = startOfQuarter(new Date())
    const end = endOfQuarter(new Date())
    return [start, end]
  })
  
  const getAvailabilityForDay = (date: Date): DayAvailabilitySummary => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const activeMemberCount = members.filter(m => m.member_status === 'active').length
    
    const summary: DayAvailabilitySummary = {
      available: [],
      maybe: [],
      unavailable: [],
      unknown: [],
      ratio: 0
    }

    members.forEach(member => {
      const memberAvailability = availability[member.id]?.[dateStr]
      
      // For rehearsals, we only care about morning availability
      const status = memberAvailability?.morning || 'unknown'
      
      switch (status) {
        case 'available':
          summary.available.push(member)
          break
        case 'maybe':
          summary.maybe.push(member)
          break
        case 'unavailable':
          summary.unavailable.push(member)
          break
        default:
          summary.unknown.push(member)
      }
    })

    summary.ratio = summary.available.length / activeMemberCount

    return summary
  }

  const getDayClass = (date: Date): string => {
    if (!isSunday(date) || !isWithinInterval(date, { start: dateRange[0], end: dateRange[1] }))
      return 'opacity-50 bg-gray-100'

    const { ratio } = getAvailabilityForDay(date)
    
    const baseClasses = cn(
      'h-9 w-9 p-0 font-normal',
      'text-gray-900',
      'transition-all duration-200'
    )

    if (ratio >= 0.75) return cn(baseClasses, 'bg-green-200 hover:bg-green-300')
    if (ratio >= 0.5) return cn(baseClasses, 'bg-yellow-200 hover:bg-yellow-300')
    return cn(baseClasses, 'bg-red-200 hover:bg-red-300')
  }

  function renderCalendarDay(props: { date: Date, displayMonth?: Date }): JSX.Element {
    const { date, displayMonth } = props
    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
    
    // Check if the date is in the current display month
    const isOutsideMonth = displayMonth ? date.getMonth() !== displayMonth.getMonth() : false
    
    if (isOutsideMonth) return <div className="h-9 w-9" />
    
    return (
      <Button
        variant="ghost"
        className={cn(
          getDayClass(date),
          isSelected && 'ring-2 ring-primary',
          'w-9 h-9 p-0 font-normal text-center',
          '[&>*]:w-full [&>*]:text-center'
        )}
        onClick={() => {
          if (isSunday(date)) {
            setSelectedDate(date)
            setIsDetailsOpen(true)
          }
        }}
      >
        <div>{format(date, 'd')}</div>
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Availability</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDateRange(prev => [
                  startOfQuarter(subQuarters(prev[0], 1)),
                  endOfQuarter(subQuarters(prev[0], 1))
                ])}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {format(dateRange[0], 'MMM yyyy')} - {format(dateRange[1], 'MMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDateRange(prev => [
                  startOfQuarter(addQuarters(prev[0], 1)),
                  endOfQuarter(addQuarters(prev[0], 1))
                ])}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            components={{
              Day: renderCalendarDay
            }}
          />
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-200" />
              <span className="text-sm">75%+ Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-200" />
              <span className="text-sm">50%+ Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-200" />
              <span className="text-sm">&lt;50% Available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <RehearsalSuggestions
        dateRange={dateRange}
        getAvailabilityForDay={getAvailabilityForDay}
        minRequired={MIN_REQUIRED_MEMBERS}
      />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDate && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Available ({getAvailabilityForDay(selectedDate).available.length})</h3>
                <div className="space-y-1">
                  {getAvailabilityForDay(selectedDate).available.map(member => (
                    <div key={member.id} className="text-sm">{member.name}</div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Maybe ({getAvailabilityForDay(selectedDate).maybe.length})</h3>
                <div className="space-y-1">
                  {getAvailabilityForDay(selectedDate).maybe.map(member => (
                    <div key={member.id} className="text-sm">{member.name}</div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Unavailable ({getAvailabilityForDay(selectedDate).unavailable.length})</h3>
                <div className="space-y-1">
                  {getAvailabilityForDay(selectedDate).unavailable.map(member => (
                    <div key={member.id} className="text-sm">{member.name}</div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">No Response ({getAvailabilityForDay(selectedDate).unknown.length})</h3>
                <div className="space-y-1">
                  {getAvailabilityForDay(selectedDate).unknown.map(member => (
                    <div key={member.id} className="text-sm">{member.name}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 