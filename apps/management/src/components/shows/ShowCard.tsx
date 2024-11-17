import Link from "next/link";
import { Show } from "@/types/show";
import { formatDateTime } from "@/utils/date";

interface ShowCardProps {
  show: Show;
}

export function ShowCard({ show }: ShowCardProps) {
  return (
    <div className="bg-white border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">{show.title}</h2>
          <p className="text-gray-600">
            {formatDateTime(show.date)}
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
}