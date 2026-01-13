import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format, isSunday, eachDayOfInterval } from 'date-fns'
import type { DayAvailabilitySummary } from './team-availability-view'
import { cn } from '@/lib/utils'

interface RehearsalSuggestionsProps {
  dateRange: [Date, Date]
  getAvailabilityForDay: (date: Date) => DayAvailabilitySummary
  minRequired: number
}

export function RehearsalSuggestions({ 
  dateRange, 
  getAvailabilityForDay,
  minRequired 
}: RehearsalSuggestionsProps) {
  const allDays = eachDayOfInterval({ start: dateRange[0], end: dateRange[1] })
  const sundays = allDays.filter(isSunday)
  
  const rankedSundays = sundays
    .map(date => ({
      date,
      availability: getAvailabilityForDay(date)
    }))
    .sort((a, b) => b.availability.available.length - a.availability.available.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Rehearsal Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rankedSundays.map(({ date, availability }) => {
            const hasEnoughPeople = availability.available.length >= minRequired
            
            return (
              <div 
                key={date.toISOString()} 
                className={cn(
                  "p-3 rounded-lg",
                  hasEnoughPeople ? "bg-green-50" : "bg-red-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{format(date, 'MMMM d, yyyy')}</div>
                    <div className="text-sm text-muted-foreground">
                      {availability.available.length} members available
                    </div>
                  </div>
                  {hasEnoughPeople ? (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Enough members
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 font-medium">
                      Need {minRequired - availability.available.length} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 