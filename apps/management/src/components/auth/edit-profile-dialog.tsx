'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { User } from '@supabase/supabase-js'
import { updateProfile } from '@/lib/actions/update-profile'

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
  currentUser: User | null
}

export function EditProfileDialog({ isOpen, onClose, currentUser }: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      avatarUrl: "",
    },
  })

  useEffect(() => {
    if (currentUser) {
      form.reset({
        fullName: currentUser.user_metadata?.full_name || "",
        avatarUrl: currentUser.user_metadata?.avatar_url || "",
      })
    }
  }, [currentUser, form])

  async function onSubmit(data: ProfileFormValues) {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "No user found. Please try logging in again.",
        variant: "destructive",
      })
      return
    }

    if (isLoading) return

    try {
      setIsLoading(true)
      
      const profileData = {
        fullName: data.fullName,
        avatarUrl: data.avatarUrl || ""
      }
      
      const result = await updateProfile(profileData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Close dialog
      handleClose()

      // Show success toast
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      })

      // Simple router refresh should be enough since we're using server action
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

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) {
        handleClose()
      }
    }}>
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