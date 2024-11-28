import { ShowsList } from '@/components/shows/shows-list'
import { AddShowDialog } from '@/components/shows/add-show-dialog'

export default function ShowsPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shows</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your shows
          </p>
        </div>
        <AddShowDialog />
      </div>
      <ShowsList />
    </div>
  )
} 