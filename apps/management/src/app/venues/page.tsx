import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { VenueCard } from "@/components/venues/VenueCard";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import { sortVenuesByName } from "@/utils/venues";
import type { Venue } from "@/types/venue";

export default async function VenuesPage() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });
    
  const { data: venues, error } = await supabase
    .from("venues")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching venues:", error.message, error.details, error.hint);
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

  if (!venues || venues.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Venues</h1>
          <Link
            href="/venues/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Venue
          </Link>
        </div>
        <div className="text-gray-600 text-center py-8">
          No venues found. Create your first venue to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Venues</h1>
        <Link
          href="/venues/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Venue
        </Link>
      </div>

      <div className="grid gap-4">
        {venues.map(venue => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  );
}