export type Venue = {
  id: string;
  name: string;
  address: string | null;
  contact_email: string | null;
  created_at: string;
};

export type NewVenue = Omit<Venue, 'id' | 'created_at'>;

export type UpdateVenue = Partial<NewVenue>;

export interface FormErrors {
  name?: string;
  email?: string;
  [key: string]: string | undefined;
}