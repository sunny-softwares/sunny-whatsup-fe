// HTTP statuses the client branches on. Mirrors the backend's src/constants/httpCodes.js.
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  // The company's subscription is blocking access. Deliberately distinct from
  // 403 (a permission problem) so the client can route a billing problem to the
  // subscription page instead of showing a generic "forbidden".
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVICE_UNAVAILABLE: 503,
} as const;
