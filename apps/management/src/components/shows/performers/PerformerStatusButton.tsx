'use client';

import { useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PerformerStatus } from '@/types/performer';

interface PerformerStatusButtonProps {
  status: PerformerStatus;
  performerId?: string;
  showId: string;
  memberId: string;
}

export function PerformerStatusButton({ 
  status: initialStatus, 
  showId,
  memberId 
}: PerformerStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const supabase = createClientComponentClient();

  const statusStyles = {
    [PerformerStatus.Unconfirmed]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    [PerformerStatus.Confirmed]: 'bg-green-100 text-green-800 hover:bg-green-200',
    [PerformerStatus.Performed]: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    [PerformerStatus.Cancelled]: 'bg-red-100 text-red-800 hover:bg-red-200',
    [PerformerStatus.NotAttending]: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  };

  const statusTransition: Record<PerformerStatus, PerformerStatus> = {
    [PerformerStatus.Unconfirmed]: PerformerStatus.Confirmed,
    [PerformerStatus.Confirmed]: PerformerStatus.Performed,
    [PerformerStatus.Performed]: PerformerStatus.NotAttending,
    [PerformerStatus.NotAttending]: PerformerStatus.Cancelled,
    [PerformerStatus.Cancelled]: PerformerStatus.Unconfirmed,
  };
  const statusDisplay = {
    'unconfirmed': 'Unconfirmed',
    'confirmed': 'Confirmed',
    'performed': 'Performed',
    'cancelled': 'Cancelled',
    'not_attending': 'Not Attending',
  };

  const handleStatusChange = async () => {
    if (loading) return; // Prevent re-entry
    setLoading(true);
    try {
      const newStatus = statusTransition[currentStatus];

      // Use upsert operation instead of separate insert/update
      const { error } = await supabase
        .from('show_performers')
        .upsert({
          show_id: showId,
          member_id: memberId,
          status: newStatus
        }, {
          onConflict: 'show_id,member_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Update the local state
      setCurrentStatus(newStatus);
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStatusChange}
      disabled={loading}
      className={`px-4 py-2 rounded-md transition-colors ${statusStyles[currentStatus]} ${
        loading ? 'opacity-50' : ''
      }`}
    >
      {loading ? 'Updating...' : statusDisplay[currentStatus]}
    </button>
  );
}
