'use client';

import { useState } from 'react';
import AddPerformerForm from './AddPerformerForm';
import { PlusCircle, XCircle } from 'lucide-react';

type Performer = {
  id: string;
  show_id: string;
  member_id: string;
  status: string;
  performer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

type PerformersListProps = {
  performers: Performer[];
  isPast: boolean;
  showId: string;
};

export default function PerformersList({ performers, isPast, showId }: PerformersListProps) {
  const [isAddingPerformer, setIsAddingPerformer] = useState(false);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">
        {isPast ? "Performers" : "Scheduled Performers"}
      </h2>
      
      <div className="bg-white rounded-lg border divide-y">
        {performers?.length === 0 && (
          <div className="p-4 text-gray-500 text-center">
            No performers found for this show.
          </div>
        )}
        
        {performers?.map((performer) => (
          <div 
            key={`${performer.show_id}-${performer.member_id}`} 
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium">
                  {performer.performer?.name || performer.performer?.email}
                </span>
                {performer.performer?.name && (
                  <span className="text-sm text-gray-500">
                    {performer.performer.email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-sm
                ${performer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${performer.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                ${performer.status === 'declined' ? 'bg-red-100 text-red-800' : ''}
                ${performer.status === 'attended' ? 'bg-blue-100 text-blue-800' : ''}
                ${performer.status === 'no_show' ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {performer.status}
              </span>
            </div>
          </div>
        ))}

        {!isPast && (
          <div className="p-4">
            {isAddingPerformer ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Add New Performer</h3>
                  <button
                    onClick={() => setIsAddingPerformer(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
                <AddPerformerForm 
                  showId={showId} 
                  onComplete={() => setIsAddingPerformer(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingPerformer(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 w-full justify-center"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Add Performer</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 