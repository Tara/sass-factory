import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PerformersList } from "@/components/shows/performers/PerformersList";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import { formatDateTime } from "@/utils/date";
import type { Member } from "@/types/member";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowDetailsPage({
  params,
}: PageProps) {
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

  const { data: performers } = await supabase
    .from("show_performers")
    .select(`
      *,
      performer:members(id, name, email)
    `)
    .eq("show_id", id);

  const { data: members } = await supabase
    .from("members")
    .select("id, name, email")
    .order("name");

  if (error) {
    console.error("Error fetching show:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message="Failed to load show details. Please try again later."
          details={error.message}
        />
      </div>
    );
  }

  if (!show) {
    notFound();
  }

  const isPast = new Date(show.date) < new Date();

  const safePerformers = performers ?? [];
  const safeMembers = (members ?? []) as Member[];

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
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{show.title}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-2">Show Details</h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-medium">Date:</span>{" "}
                {formatDateTime(show.date)}
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

        <PerformersList 
          performers={safePerformers} 
          members={safeMembers}
          isPast={isPast} 
          showId={id} 
        />
      </div>
    </div>
  );
}