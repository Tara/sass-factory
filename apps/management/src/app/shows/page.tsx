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
    `);

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

  // Get today at 12:01 AM local time
  const today = new Date();
  today.setHours(0, 1, 0, 0);

  // Split shows into upcoming and past
  const upcomingShows = shows
    .filter(show => new Date(show.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ascending order

  const pastShows = shows
    .filter(show => new Date(show.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Descending order

  const ShowCard = ({ show }: { show: typeof shows[0] }) => (
    <div
      key={show.id}
      className="bg-white border p-4 rounded-lg shadow hover:shadow-md transition-shadow"
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
      </div>
      <Link
        href={`/shows/${show.id}`}
        className="text-blue-500 hover:underline mt-2 inline-block"
      >
        View Details →
      </Link>
    </div>
  );

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

      {upcomingShows.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Upcoming Shows</h2>
          <div className="grid gap-4 mb-8">
            {upcomingShows.map(show => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </>
      )}

      {pastShows.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Past Shows</h2>
          <div className="grid gap-4">
            {pastShows.map(show => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 