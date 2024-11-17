export enum PerformerStatus {
  Unconfirmed = 'unconfirmed',
  Confirmed = 'confirmed',
  Performed = 'performed',
  Cancelled = 'cancelled',
  NotAttending = 'not_attending',
}

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