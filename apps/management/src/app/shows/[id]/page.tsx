import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShowDetail } from '@/components/shows/show-detail'
import { ChevronLeft } from "lucide-react"

interface ShowPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ShowPage({ params }: ShowPageProps) {
  const { id } = await params

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/shows">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Shows
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Show Details</h1>
      <ShowDetail id={id} />
    </div>
  )
} 