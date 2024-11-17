'use client';

import Link from "next/link";
import { Venue } from "@/types/venue";
import { formatVenueAddress } from "@/utils/venues";

interface VenueCardProps {
  venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <div className="bg-white border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">{venue.name}</h2>
          <p className="text-gray-600">
            {formatVenueAddress(venue)}
          </p>
          {venue.contact_email && (
            <p className="text-gray-600 mt-1">
              <a 
                href={`mailto:${venue.contact_email}`}
                className="text-blue-500 hover:underline"
              >
                {venue.contact_email}
              </a>
            </p>
          )}
        </div>
        <Link
          href={`/venues/${venue.id}/edit`}
          className="text-blue-500 hover:bg-blue-50 px-3 py-1 rounded"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}