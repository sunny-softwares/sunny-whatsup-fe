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
  // Placeholder shown when a value is missing or invalid.
  EMPTY: '—',
} as const;
