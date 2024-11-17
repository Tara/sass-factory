'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";

type Member = {
  id: string;
  name: string;
  email: string;
};

export default function AddPerformerForm({ 
  showId, 
  onComplete 
}: { 
  showId: string;
  onComplete?: () => void;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAvailableMembers = async () => {
      try {
        // First get all existing performers for this show
        const { data: existingPerformers } = await supabase
          .from("show_performers")
          .select("member_id")
          .eq("show_id", showId);

        const existingMemberIds = new Set(
          existingPerformers?.map(p => p.member_id) || []
        );

        // Then get all members except those already added
        const { data: allMembers, error } = await supabase
          .from("members")
          .select("id, name, email")
          .order('name');

        if (error) throw error;

        // Filter out members who are already performers
        const availableMembers = allMembers.filter(
          member => !existingMemberIds.has(member.id)
        );

        setMembers(availableMembers);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load available members");
      }
    };

    fetchAvailableMembers();
  }, [supabase, showId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("show_performers")
        .insert({
          show_id: showId,
          member_id: selectedMemberId,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setSelectedMemberId("");
      onComplete?.();
      window.location.reload(); // Refresh to show updated list
    } catch (err) {
      console.error("Error adding performer:", err);
      setError(err instanceof Error ? err.message : "Failed to add performer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md shadow-sm text-sm"
          required
        >
          <option value="">Select a performer</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name || member.email}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      {members.length === 0 && !error && (
        <div className="text-gray-500 text-sm">
          All members have been added to this show
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading || !selectedMemberId || members.length === 0}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        {isLoading ? "Adding..." : "Add Performer"}
      </button>
    </form>
  );
} 