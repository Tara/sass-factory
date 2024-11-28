'use client'

import { useShows } from '@/lib/hooks/useShows'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GlobeIcon, IdCardIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import { getShowStatusVariant } from "@/lib/utils"

type ShowStatus = Database['public']['Enums']['show_status']
type Show = NonNullable<ReturnType<typeof useShows>['data']>[number]

function ShowCard({ show }: { show: Show }) {
  return (
    <Link href={`/shows/${show.id}`}>
      <Card className="hover:bg-accent transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">{show.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDate(show.date)}
            </p>
          </div>
          <Badge variant={getShowStatusVariant(show.status)}>{show.status}</Badge>
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
  )
}

export function ShowsList() {
  const { data: shows, isLoading } = useShows()

  if (isLoading) return <div>Loading...</div>
  if (!shows?.length) return <div>No shows found</div>

  const now = new Date()
  const futureShows = shows.filter(show => new Date(show.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const pastShows = shows.filter(show => new Date(show.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-8">
      {futureShows.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Shows</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {futureShows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </section>
      )}

      {pastShows.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Past Shows</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastShows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
} 