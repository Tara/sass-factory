'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, ControllerRenderProps } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Show } from '@/lib/types/shows'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Venue = Show['venue']

const FormSchema = z.object({
  name: z.string().min(1, "Show name is required"),
  date: z.date({
    required_error: "Show date is required",
  }),
  time: z.string().min(1, "Show time is required"),
  venue_id: z.string().min(1, "Venue is required"),
  price: z.string().optional(),
  ticket_link: z.string().url().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof FormSchema>

function VenueSelect({ field }: { field: ControllerRenderProps<FormValues, "venue_id"> }) {
  const { data: venues } = useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  return (
    <select
      {...field}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">Select a venue</option>
      {venues?.map((venue: Venue) => (
        <option key={venue.id} value={venue.id}>
          {venue.name}
        </option>
      ))}
    </select>
  )
}

export function AddShowDialog() {
  const [open, setOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      date: new Date(),
      time: '20:00',
      venue_id: '',
      price: '',
      ticket_link: ''
    }
  })

  async function onSubmit(data: FormValues) {
    try {
      // Create a date object in local timezone
      const [hours, minutes] = data.time.split(':').map(Number)
      const showDate = new Date(data.date)
      showDate.setHours(hours, minutes)

      const { error } = await supabase
        .from('shows')
        .insert([{
          name: data.name,
          date: showDate.toISOString(),
          venue_id: data.venue_id,
          price: data.price ? parseFloat(data.price) : 0,
          ticket_link: data.ticket_link || '',
          status: 'scheduled' as const,
          image_url: null
        }])

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['shows'] })
      form.reset()
      setOpen(false)
    } catch (error) {
      console.error('Error adding show:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Show
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Show</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Show Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover modal={true} open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setCalendarOpen(false)
                        }}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <VenueSelect field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticket_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Link (optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Add Show
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 