'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function PerformerStatusButton({ 
  performerId, 
  currentStatus 
}: { 
  performerId: string;
  currentStatus: 'scheduled' | 'performed';
}) {
  const supabase = createClientComponentClient();

  const handleStatusUpdate = async () => {
    const newStatus = currentStatus === "scheduled" ? "performed" : "scheduled";
    const { error } = await supabase
      .from("show_performers")
      .update({ status: newStatus })
      .eq("id", performerId);
    
    if (error) {
      console.error('Error updating performer status:', error);
    }
    // You might want to add a refresh mechanism here
    window.location.reload();
  };

  return (
    <button
      onClick={handleStatusUpdate}
      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {currentStatus === "scheduled" ? "Confirm Performed" : "Undo Performed"}
    </button>
  );
} 