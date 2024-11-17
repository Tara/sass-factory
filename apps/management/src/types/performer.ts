export type PerformerStatus = 'not_attending' | 'unconfirmed' | 'confirmed' | 'performed' | 'cancelled';

export interface Member {
  id: string;
  name: string;
  email: string;
}

export interface ShowPerformer {
  id: string;
  show_id: string;
  member_id: string;
  status: PerformerStatus;
  performer: {
    id: string;
    name: string;
    email: string;
  };
}