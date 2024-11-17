import { Venue } from '@/types/venue';

export function sortVenuesByName(venues: Venue[]) {
  return [...venues].sort((a, b) => a.name.localeCompare(b.name));
}

export function formatVenueAddress(venue: Venue) {
  const parts = [
    venue.address,
    venue.city,
    venue.state,
    venue.postal_code
  ].filter(Boolean);
  
  return parts.join(', ');
}

export function getVenueDisplayName(venue: Venue | null | undefined): string {
  if (!venue) return 'Unknown Venue';
  return venue.name;
}

export function getFullVenueAddress(venue: Venue | null | undefined): string {
  if (!venue) return '';
  return formatVenueAddress(venue);
}