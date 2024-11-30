// useVenues.ts
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'  // Use your client helper
import type { Venue } from '@/lib/types/venues'
import { useEffect, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'

export function useVenues() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Create client once for the hook instance
  const supabase = useMemo(() => createClient(), [])

  const venuesQuery = useQuery<Venue[]>({
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

  useEffect(() => {
    const channel = supabase
      .channel('venues-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'venues' 
        }, 
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['venues'] })
        }
      )
      .subscribe((status) => {
        switch (status) {
          case 'CHANNEL_ERROR':
            toast({
              variant: "destructive",
              title: "Connection Error",
              description: "Lost connection to venue updates. Please refresh the page.",
            })
            break
            
          case 'TIMED_OUT':
            toast({
              variant: "destructive",
              title: "Connection Timeout",
              description: "Connection timed out. Updates may be delayed.",
            })
            break
            
          // case 'CLOSED':
          //   toast({
          //     title: "Connection Closed",
          //     description: "Real-time updates paused.",
          //   })
          //   break
            
          // case 'SUBSCRIBED':
          //   toast({
          //     title: "Connected",
          //     description: "Receiving real-time updates.",
          //     duration: 2000
          //   })
          //   break
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, toast, supabase])

  const deleteVenueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['venues'] })
      const previousVenues = queryClient.getQueryData<Venue[]>(['venues'])
      
      queryClient.setQueryData<Venue[]>(['venues'], (old) => 
        old?.filter(venue => venue.id !== id)
      )
      
      return { previousVenues }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['venues'], context?.previousVenues)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete venue. Please try again.",
      })
    },
    onSuccess: () => {
      toast({
        description: "Venue deleted successfully.",
      })
    }
  })

  const editVenueMutation = useMutation({
    mutationFn: async ({ id, venue }: { id: string; venue: Partial<Venue> }) => {
      const { error } = await supabase
        .from('venues')
        .update(venue)
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, venue }) => {
      await queryClient.cancelQueries({ queryKey: ['venues'] })
      const previousVenues = queryClient.getQueryData<Venue[]>(['venues'])
      
      queryClient.setQueryData<Venue[]>(['venues'], (old) => 
        old?.map(v => v.id === id ? { ...v, ...venue } : v)
      )
      
      return { previousVenues }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['venues'], context?.previousVenues)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update venue. Please try again.",
      })
    },
    onSuccess: () => {
      toast({
        description: "Venue updated successfully.",
      })
    }
  })

  return {
    ...venuesQuery,
    deleteVenue: deleteVenueMutation.mutateAsync,
    editVenue: editVenueMutation.mutateAsync,
    isDeleting: deleteVenueMutation.isPending,
    isEditing: editVenueMutation.isPending
  }
}