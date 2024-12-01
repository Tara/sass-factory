'use client'

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/types/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

type Availability = Database['public']['Tables']['availability']['Row']
type AvailabilityPriority = Database['public']['Enums']['availability_priority']

interface CalendarProps {
  initialMemberId: string;
}

export function AvailabilityCalendar({ initialMemberId }: CalendarProps) {
  const { isLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'evening' | null>(null);
  const [availability, setAvailability] = useState<Record<string, Availability>>({});

  useEffect(() => {
    if (isLoading) return;

    const loadAvailability = async () => {
      const supabase = createClient();
      const { data: availabilityData, error } = await supabase
        .from('availability')
        .select('*')
        .eq('member_id', initialMemberId);

      if (error) {
        console.error('Error loading availability:', error);
        return;
      }

      const availabilityMap = availabilityData.reduce((acc, curr) => ({
        ...acc,
        [curr.date]: curr,
      }), {} as Record<string, Availability>);

      setAvailability(availabilityMap);
    };

    loadAvailability();
  }, [initialMemberId, isLoading]);

  const handleUpdateAvailability = async (date: string, period: 'morning' | 'evening', priority: AvailabilityPriority) => {
    const supabase = createClient();

    const availabilityData = {
      member_id: initialMemberId,
      date,
      [`${period}_available`]: true,
      [`${period}_priority`]: priority,
    };

    const { data, error } = await supabase
      .from('availability')
      .upsert(availabilityData, {
        onConflict: 'member_id,date',
      });

    if (error) {
      console.error('Error updating availability:', error);
      return;
    }

    setAvailability(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        ...availabilityData,
      },
    }));

    setSelectedDate(null);
    setSelectedPeriod(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Add padding days at start
  const startPadding = Array.from({ length: firstDay.getDay() }, (_, i) => 
    new Date(firstDay.getFullYear(), firstDay.getMonth(), -i)
  ).reverse();

  // Add padding days at end
  const endPadding = Array.from(
    { length: 6 - lastDay.getDay() },
    (_, i) => new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + i + 1)
  );

  const allDays = [...startPadding, ...days, ...endPadding];
  const weeks = Array.from(
    { length: Math.ceil(allDays.length / 7) },
    (_, i) => allDays.slice(i * 7, (i + 1) * 7)
  );

  const getPriorityColor = (priority: AvailabilityPriority | null) => {
    switch (priority) {
      case 'high': return 'bg-emerald-500/90 hover:bg-emerald-500';
      case 'medium': return 'bg-amber-500/90 hover:bg-amber-500';
      case 'low': return 'bg-rose-500/90 hover:bg-rose-500';
      default: return 'bg-blue-500/90 hover:bg-blue-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayAvailability = availability[dateStr];
                const isOtherMonth = !isSameMonth(day, currentMonth);

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      'min-h-28 p-2 relative',
                      isOtherMonth && 'bg-muted/50',
                      isToday(day) && 'bg-accent/20'
                    )}
                  >
                    <div className={cn(
                      'font-medium text-sm mb-2',
                      isOtherMonth && 'text-muted-foreground'
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedPeriod('morning');
                        }}
                        className={cn(
                          'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs',
                          'transition-colors duration-200',
                          'text-white font-medium',
                          dayAvailability?.morning_available 
                            ? getPriorityColor(dayAvailability.morning_priority)
                            : 'bg-gray-200/80 hover:bg-gray-200 text-gray-700'
                        )}
                      >
                        <Sun className="h-3 w-3" />
                        Morning
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedPeriod('evening');
                        }}
                        className={cn(
                          'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs',
                          'transition-colors duration-200',
                          'text-white font-medium',
                          dayAvailability?.evening_available 
                            ? getPriorityColor(dayAvailability.evening_priority)
                            : 'bg-gray-200/80 hover:bg-gray-200 text-gray-700'
                        )}
                      >
                        <Moon className="h-3 w-3" />
                        Evening
                      </button>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Dialog 
        open={!!selectedDate && !!selectedPeriod} 
        onOpenChange={() => {
          setSelectedDate(null);
          setSelectedPeriod(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedPeriod === 'morning' ? 'Morning' : 'Evening'} Availability
              <div className="text-sm font-normal text-muted-foreground mt-1">
                {selectedDate && format(new Date(selectedDate), 'MMMM d, yyyy')}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 justify-center p-4">
            {(['high', 'medium', 'low'] as const).map(priority => (
              <Button
                key={priority}
                onClick={() => {
                  if (selectedDate && selectedPeriod) {
                    handleUpdateAvailability(selectedDate, selectedPeriod, priority);
                  }
                }}
                className={cn(
                  'capitalize flex-1',
                  getPriorityColor(priority)
                )}
              >
                {priority}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}