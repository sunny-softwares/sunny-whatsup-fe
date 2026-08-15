// Bounds for a company's message-history window, mirroring the backend
// `MESSAGE_RETENTION` constants so the editor rejects the same values the API
// would. The effective window per company comes from the API, never from here.
export const MESSAGE_RETENTION = {
  MIN_DAYS: 1,
  MAX_DAYS: 3650,
} as const;
