'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type NewMember = Omit<FormValues, 'join_date'> & { join_date: string }

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  photo_url: z.string().optional(),
  join_date: z.date({
    required_error: "Join date is required",
  }),
  member_status: z.enum(['active', 'inactive']).default('active')
})

type FormValues = z.infer<typeof FormSchema>

interface AddMemberDialogProps {
  onAdd: (member: NewMember) => void
  trigger: React.ReactNode
}

export function AddMemberDialog({ onAdd, trigger }: AddMemberDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      email: '',
      photo_url: '',
      join_date: new Date(),
      member_status: 'active'
    }
  })

  function onSubmit(data: FormValues) {
    const memberData = {
      ...data,
      photo_url: data.photo_url || `https://api.dicebear.com/9.x/bottts/svg?seed=${data.email}`,
      join_date: format(data.join_date, 'yyyy-MM-dd')
    }

    try {
      onAdd(memberData)
      setDialogOpen(false)
      form.reset()
      toast({
        title: "Success",
        description: "Member added successfully",
      })
    } catch (err) {
      const error = err as Error
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Enter the details of the new team member below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="join_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Join Date</FormLabel>
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
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Add Member</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}