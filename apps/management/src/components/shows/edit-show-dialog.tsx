'use client'

import { useState } from 'react'
import { useForm, type ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { showSchema, type ShowFormValues } from '@/lib/validations/show'
import { useVenues } from '@/lib/hooks/useVenues'
import { updateShow } from '@/lib/actions/shows'
import { toast } from 'sonner'
import type { Show } from '@/lib/types/shows'
import { useRouter } from 'next/navigation'
import type { Venue } from '@/lib/types/venues'
import { useQuery } from '@tanstack/react-query'

interface EditShowProps {
  show: Show
  trigger?: React.ReactNode
}

export function EditShow({ show, trigger }: EditShowProps) {
  const [open, setOpen] = useState(false)
  const { data: venues = [] } = useVenues()
  const router = useRouter()
  
  const form = useForm<ShowFormValues>({
    resolver: zodResolver(showSchema),
    defaultValues: {
      name: show.name || '',
      date: show.date || '',
      venue_id: show.venue_id || '',
      price: show.price?.toString() || '',
      ticket_link: show.ticket_link || '',
      status: show.status === 'performed' ? 'completed' : show.status,
    },
  })

  type FieldProps = {
    field: ControllerRenderProps<ShowFormValues, keyof ShowFormValues>
  }

  async function onSubmit(values: ShowFormValues) {
    try {
      await updateShow({
        id: show.id,
        ...values,
        price: values.price ? parseFloat(values.price.toString()) : undefined,
      })
      toast.success('Show updated successfully')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update show')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Show</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Show</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="venue_id"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a venue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {venues.map((venue: Venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticket_link"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Ticket Link</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="performed">Performed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Update Show
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 