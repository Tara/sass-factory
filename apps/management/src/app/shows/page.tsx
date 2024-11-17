import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { ShowCard } from "@/components/shows/ShowCard";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import { splitShowsByDate } from "@/utils/shows";
import { Show } from "@/types/show";

export default async function ShowsPage() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });
    
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
        <ErrorMessage 
          message={error.message}
          hint={error.hint}
          details={error.details}
        />
      </div>
    );
  }

  const EmptyState = () => (
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

  if (!shows || shows.length === 0) {
    return <EmptyState />;
  }

  const { upcomingShows, pastShows } = splitShowsByDate(shows as Show[]);

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