"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  avatarUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUser: any
}

export function EditProfileDialog({ isOpen, onClose, currentUser }: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: currentUser?.user_metadata?.full_name || "",
      avatarUrl: currentUser?.user_metadata?.avatar_url || "",
    },
  })

  const handleClose = () => {
    console.log('handleClose called')
    form.reset()
    onClose()
  }

  async function onSubmit(data: ProfileFormValues) {
    console.log('onSubmit called with data:', data)
    
    if (isLoading) {
      console.log('Submit blocked - already loading')
      return
    }

    try {
      console.log('Setting loading state...')
      setIsLoading(true)
      
      console.log('Calling Supabase updateUser...')
      
      // Send update without waiting for response
      supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          avatar_url: data.avatarUrl,
        },
      })

      // Show success immediately
      toast({
        title: "Profile updated",
        description: "Your changes are being saved...",
      })
      
      // Close dialog and refresh
      handleClose()
      router.refresh()

    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    console.log('handleOpenChange called with:', { open, isLoading })
    if (!open && !isLoading) {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 