import { getStartOfDay } from './date';
import { Show } from '@/types/show';

export function splitShowsByDate(shows: Show[]) {
  const today = getStartOfDay();

  return {
    upcomingShows: shows
      .filter(show => new Date(show.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    pastShows: shows
      .filter(show => new Date(show.date) < today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
}

export function sortShowsByDate(shows: Show[], ascending = true) {
  return [...shows].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return ascending ? diff : -diff;
  });
}