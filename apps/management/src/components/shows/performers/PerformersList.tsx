'use client';

import { PerformerStatusButton } from './PerformerStatusButton';
import type { ShowPerformer } from '@/types/performer';
import type { Member } from '@/types/member';

interface PerformersListProps {
  performers: ShowPerformer[];
  members: Member[];
  isPast: boolean;
  showId: string;
}

export function PerformersList({ performers, members, isPast, showId }: PerformersListProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Performers</h2>
      <div className="space-y-4">
        {members.map((member) => {
          const showPerformer = performers.find(
            (p) => p.member_id === member.id
          );

          return (
            <div
              key={`${showId}-${member.id}`}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              {!isPast && (
                <PerformerStatusButton
                  status={showPerformer?.status || 'unconfirmed'}
                  showId={showId}
                  memberId={member.id}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}