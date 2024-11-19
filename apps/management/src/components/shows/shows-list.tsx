'use client'

import { useShows } from '@/lib/hooks/useShows'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GlobeIcon, IdCardIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type ShowStatus = Database['public']['Enums']['show_status']

export function ShowsList() {
  const { data: shows, isLoading } = useShows()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {shows?.map((show) => (
        <Link key={show.id} href={`/shows/${show.id}`}>
          <Card className="hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">{show.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDate(show.date)}
                </p>
              </div>
              <Badge variant={getStatusVariant(show.status)}>{show.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <GlobeIcon className="h-4 w-4 opacity-70" />
                  <span className="text-sm">{show.venue.name}</span>
                </div>
                {show.price && (
                  <div className="flex items-center space-x-2">
                    <IdCardIcon className="h-4 w-4 opacity-70" />
                    <span className="text-sm">${show.price}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function getStatusVariant(status: ShowStatus) {
  switch (status) {
    case 'scheduled':
      return 'default' as const
    case 'performed':
      return 'secondary' as const
    case 'completed':
      return 'outline' as const
    default:
      return 'default' as const
  }
} 