import { ShowDetail } from '@/components/shows/show-detail'

interface ShowPageProps {
  params: {
    id: string
  }
}

export default async function ShowPage({ params }: ShowPageProps) {
  const { id } = await params

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Show Details</h1>
      <ShowDetail id={id} />
    </div>
  )
} 