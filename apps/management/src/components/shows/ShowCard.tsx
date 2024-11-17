'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { formatDateTime } from "@/utils/date";
import { Show } from "@/types/show";

interface ShowCardProps {
  show: Show;
}

export function ShowCard({ show }: ShowCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      // First, delete all related show_performers records
      const { error: performersError } = await supabase
        .from("show_performers")
        .delete()
        .eq("show_id", show.id);

      if (performersError) {
        console.error('Error deleting performers:', performersError);
        throw performersError;
      }

      // Then delete the show itself
      const { error: showError } = await supabase
        .from("shows")
        .delete()
        .eq("id", show.id);

      if (showError) {
        console.error('Error deleting show:', showError);
        throw showError;
      }

      router.refresh();
    } catch (error) {
      console.error('Error in deletion process:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete show');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
<div className="bg-white border p-4 rounded-lg shadow hover:shadow-md transition-shadow relative flex justify-between">
  <div>
    <h2 className="text-xl font-semibold mb-4">{show.title}</h2>
    <div className="space-y-2">
      <p className="text-gray-600">
        {formatDateTime(show.date)}
      </p>
      <p className="text-gray-600">
        Venue: {show.venue?.name || 'Unknown Venue'}
      </p>
      <Link
        href={`/shows/${show.id}`}
        className="text-blue-500 hover:text-blue-600 inline-block mt-2"
      >
        View Details →
      </Link>
    </div>
  </div>
  {!showConfirmation && (
    <button
      onClick={() => setShowConfirmation(true)}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 h-fit my-auto ml-4"
    >
      Delete
    </button>
  )}

      {/* Delete Confirmation Dialog */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="mb-4 font-medium">Are you sure you want to delete this show?</p>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}