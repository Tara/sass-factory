'use client';

import { AddPerformerForm } from './AddPerformerForm';
import { PerformerStatusButton } from './PerformerStatusButton';
import type { ShowPerformer } from '@/types/performer';

interface PerformersListProps {
  performers: ShowPerformer[];
  isPast: boolean;
  showId: string;
}

export function PerformersList({ performers, isPast, showId }: PerformersListProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Performers</h2>
      {performers.length > 0 ? (
        <div className="space-y-4">
          {performers.map((performer) => (
            // Using member_id as it's more stable than the show_performers id
            <div
              key={`${showId}-${performer.member_id}`}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
            >
              <div>
                <p className="font-medium">{performer.performer.name}</p>
                <p className="text-sm text-gray-600">{performer.performer.email}</p>
              </div>
              {!isPast && (
                <PerformerStatusButton
                  status={performer.status}
                  performerId={performer.id}
                  showId={showId}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No performers added yet.</p>
      )}

      {!isPast && <AddPerformerForm showId={showId} />}
    </div>
  );
}