// Centralised date display configuration. All user-facing dates render as
// dd/mm/yyyy via `formatDate` in lib/utils.
export const DATE_FORMAT = {
  // en-GB renders day/month/year order (dd/mm/yyyy).
  LOCALE: 'en-GB',
  OPTIONS: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
  // Same date order plus a 12-hour clock, for `formatDateTime`. hour12 is
  // explicit because en-GB otherwise defaults to 24-hour time; the browser's
  // local timezone is applied automatically by Intl (no timeZone override).
  DATETIME_OPTIONS: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  },
  // Placeholder shown when a value is missing or invalid.
  EMPTY: '—',
} as const;
