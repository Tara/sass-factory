import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import PerformerStatusButton from './PerformerStatusButton';
import AddPerformerForm from './AddPerformerForm';
import PerformersList from './PerformersList';

export default async function ShowDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data: show, error } = await supabase
    .from("shows")
    .select(`
      *,
      venue:venues (
        id,
        name,
        address
      )
    `)
    .eq("id", id)
    .single();

  const { data: performers, error: performersError } = await supabase
    .from("show_performers")
    .select(`
      *,
      performer:members(id, name, email)
    `)
    .eq("show_id", id);

  if (error) {
    console.error("Error fetching show:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load show details. Please try again later.
        </div>
      </div>
    );
  }

  if (!show) {
    notFound();
  }

  const isPast = new Date(show.date) < new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/shows"
          className="text-blue-500 hover:text-blue-600 flex items-center"
        >
          ← Back to Shows
        </Link>
        <Link
          href={`/shows/${id}/edit`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit Show
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{show.title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium
              ${show.status === 'published' ? 'bg-green-100 text-green-800' : ''}
              ${show.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
              ${show.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
            `}
          >
            {show.status}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-2">Show Details</h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-medium">Date:</span>{" "}
                {new Date(show.date).toLocaleString()}
              </p>
              {show.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-gray-600">{show.description}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Venue Information</h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-medium">Venue:</span> {show.venue.name}
              </p>
              {show.venue.address && (
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span>{" "}
                  {show.venue.address}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          {show.status === "draft" && (
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Publish Show
            </button>
          )}
          {show.status !== "cancelled" && (
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Cancel Show
            </button>
          )}
        </div>

        <PerformersList 
          performers={performers || []} 
          isPast={isPast} 
          showId={id}
        />
      </div>
    </div>
  );
}