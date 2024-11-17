export type PerformerStatus = 'pending' | 'confirmed' | 'declined';  // Changed to match DB

export interface Member {
  id: string;
  name: string;
  email: string;
}

export interface ShowPerformer {
  id: string;
  show_id: string;
  member_id: string;
  performer: Member;
  status: PerformerStatus;
}