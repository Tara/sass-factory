'use client'

import { useShows } from '@/lib/hooks/useShows'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar, MapPin, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from 'react'
import Image from 'next/image'
import { formatDate, getShowStatusVariant, getGoogleMapsSearchUrl } from '@/lib/utils'
import Link from 'next/link'
import type { Show } from '@/lib/types/shows'
import { CustomBadge } from "@/components/ui/custom-badge"

export function ShowsList() {
  const { data: shows, isLoading } = useShows()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter and sort logic
  const now = new Date()
  const filteredShows: Show[] = shows?.filter(show => 
    show.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show.venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const futureShows: Show[] = filteredShows
    .filter(show => new Date(show.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  const pastShows: Show[] = filteredShows
    .filter(show => new Date(show.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-lg text-muted-foreground">Loading shows...</div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search shows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {futureShows.length === 0 && pastShows.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 rounded-lg border border-dashed p-8 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-semibold">No shows found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 
                "We couldn't find any shows matching your search. Try different keywords." :
                "Get started by adding your first show."
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {futureShows.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Upcoming Shows</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {futureShows.map((show) => (
                  <Card key={show.id} className="overflow-hidden">
                    <Link href={`/shows/${show.id}`} className="block">
                      <div className="relative h-40 w-full">
                        {show.venue.image_url ? (
                          <Image
                            src={show.venue.image_url}
                            alt={show.venue.name}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-4xl font-bold text-muted-foreground">
                              {show.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end justify-between p-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{show.name}</h3>
                            <p className="text-sm text-white/80">{formatDate(show.date)}</p>
                          </div>
                          <CustomBadge variant={getShowStatusVariant(show.status)}>
                            {show.status}
                          </CustomBadge>
                        </div>
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm text-muted-foreground">
                            {show.venue.address ? (
                              <a
                                href={getGoogleMapsSearchUrl(show.venue.name, show.venue.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:underline"
                              >
                                <MapPin className="mr-1 h-4 w-4 shrink-0" />
                                <span className="line-clamp-1">{show.venue.name}</span>
                              </a>
                            ) : (
                              <>
                                <MapPin className="mr-1 h-4 w-4 shrink-0" />
                                <span className="line-clamp-1">{show.venue.name}</span>
                              </>
                            )}
                          </div>
                          {show.price && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="font-medium">${show.price}</span>
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/shows/${show.id}`}>View details</Link>
                            </DropdownMenuItem>
                            {show.ticket_link && (
                              <DropdownMenuItem asChild>
                                <a href={show.ticket_link} target="_blank" rel="noopener noreferrer">
                                  Buy tickets
                                </a>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {pastShows.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Past Shows</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastShows.map((show) => (
                  <Card key={show.id} className="overflow-hidden">
                    <Link href={`/shows/${show.id}`} className="block">
                      <div className="relative h-40 w-full">
                        {show.venue.image_url ? (
                          <Image
                            src={show.venue.image_url}
                            alt={show.venue.name}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-4xl font-bold text-muted-foreground">
                              {show.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end justify-between p-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{show.name}</h3>
                            <p className="text-sm text-white/80">{formatDate(show.date)}</p>
                          </div>
                          <CustomBadge variant={getShowStatusVariant(show.status)}>
                            {show.status}
                          </CustomBadge>
                        </div>
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm text-muted-foreground">
                            {show.venue.address ? (
                              <a
                                href={getGoogleMapsSearchUrl(show.venue.name, show.venue.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:underline"
                              >
                                <MapPin className="mr-1 h-4 w-4 shrink-0" />
                                <span className="line-clamp-1">{show.venue.name}</span>
                              </a>
                            ) : (
                              <>
                                <MapPin className="mr-1 h-4 w-4 shrink-0" />
                                <span className="line-clamp-1">{show.venue.name}</span>
                              </>
                            )}
                          </div>
                          {show.price && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="font-medium">${show.price}</span>
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/shows/${show.id}`}>View details</Link>
                            </DropdownMenuItem>
                            {show.ticket_link && (
                              <DropdownMenuItem asChild>
                                <a href={show.ticket_link} target="_blank" rel="noopener noreferrer">
                                  Buy tickets
                                </a>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
} 