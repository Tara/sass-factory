import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function ShowsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: shows, error } = await supabase
    .from("shows")
    .select(`
      *,
      venue:venues (
        id,
        name
      )
    `)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching shows:", error.message, error.details, error.hint);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Failed to load shows. Error: {error.message}</p>
          {error.hint && <p>Hint: {error.hint}</p>}
          {process.env.NODE_ENV === 'development' && error.details && 
            <p className="mt-2 text-sm">Details: {error.details}</p>
          }
        </div>
      </div>
    );
  }

  if (!shows || shows.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shows</h1>
          <Link
            href="/shows/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Show
          </Link>
        </div>
        <div className="text-gray-600 text-center py-8">
          No shows found. Create your first show to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shows</h1>
        <Link
          href="/shows/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Show
        </Link>
      </div>

      <div className="grid gap-4">
        {shows.map((show) => (
          <div
            key={show.id}
            className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{show.title}</h2>
                <p className="text-gray-600">
                  {new Date(show.date).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  Venue: {show.venue?.name || 'Unknown Venue'}
                </p>
              </div>
              <span className={`
                px-2 py-1 rounded text-sm
                ${show.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                ${show.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                ${show.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {show.status}
              </span>
            </div>
            <Link
              href={`/shows/${show.id}`}
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              View Details →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 