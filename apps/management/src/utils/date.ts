/**
 * Returns a Date object set to 12:01 AM of the current day
 */
export function getStartOfDay(date = new Date()) {
  const newDate = new Date(date);
  newDate.setHours(0, 1, 0, 0);
  return newDate;
}

/**
 * Formats a date string into a localized datetime string without seconds
 */
export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats a date string into a localized date only string
 */
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

/**
 * Formats a date string into a localized time only string without seconds
 */
export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}