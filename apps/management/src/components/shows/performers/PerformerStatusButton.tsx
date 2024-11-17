'use client';

import { useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import type { PerformerStatus } from '@/types/performer';

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
  const router = useRouter();
  const supabase = createClientComponentClient();

  const statusStyles = {
    'unconfirmed': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'confirmed': 'bg-green-100 text-green-800 hover:bg-green-200',
    'performed': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'cancelled': 'bg-red-100 text-red-800 hover:bg-red-200',
    'not_attending': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  };

  const statusDisplay = {
    'unconfirmed': 'Unconfirmed',
    'confirmed': 'Confirmed',
    'performed': 'Performed',
    'cancelled': 'Cancelled',
    'not_attending': 'Not Attending',
  };

  const handleStatusChange = async () => {
    setLoading(true);
    try {
      let newStatus: PerformerStatus;
      
      // For existing entries, cycle through statuses
      switch (initialStatus) {
        case 'unconfirmed':
          newStatus = 'confirmed';
          break;
        case 'confirmed':
          newStatus = 'performed';
          break;
        case 'performed':
          newStatus = 'not_attending';
          break;
        case 'not_attending':
          newStatus = 'cancelled';
          break;
        case 'cancelled':
          newStatus = 'unconfirmed';
          break;
        default:
          newStatus = 'unconfirmed';
      }

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
      
      router.refresh();
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
      className={`px-4 py-2 rounded-md transition-colors ${statusStyles[initialStatus]} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? 'Updating...' : statusDisplay[initialStatus]}
    </button>
  );
}