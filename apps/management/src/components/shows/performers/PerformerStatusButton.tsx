'use client';

import { useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import type { PerformerStatus } from '@/types/performer';

interface PerformerStatusButtonProps {
  status: PerformerStatus;
  performerId: string;
  showId: string;
}

export function PerformerStatusButton({ 
  status, 
  performerId,
  showId 
}: PerformerStatusButtonProps) {
  const [currentStatus, setCurrentStatus] = useState<PerformerStatus>(status);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const statusStyles = {
    INVITED: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    CONFIRMED: 'bg-green-100 text-green-800 hover:bg-green-200',
    DECLINED: 'bg-red-100 text-red-800 hover:bg-red-200'
  };

  const nextStatus: Record<PerformerStatus, PerformerStatus> = {
    INVITED: 'CONFIRMED',
    CONFIRMED: 'DECLINED',
    DECLINED: 'INVITED'
  };

  const handleStatusChange = async () => {
    setLoading(true);
    try {
      const newStatus = nextStatus[currentStatus];
      
      const { error } = await supabase
        .from('show_performers')
        .update({ status: newStatus })
        .eq('id', performerId);

      if (error) throw error;
      
      setCurrentStatus(newStatus);
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
      className={`px-4 py-2 rounded-md transition-colors ${statusStyles[currentStatus]} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? 'Updating...' : currentStatus}
    </button>
  );
}