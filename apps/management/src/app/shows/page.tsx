import { ShowsList } from '@/components/shows/shows-list'
import { AddShowDialog } from '@/components/shows/add-show-dialog'

export default function ShowsPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shows</h1>
        <AddShowDialog />
      </div>
      <ShowsList />
    </div>
  )
} 