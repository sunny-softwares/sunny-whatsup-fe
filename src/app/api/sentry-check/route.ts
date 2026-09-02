/**
 * Temporary Sentry verification route - throws so the server-side SDK captures
 * it via `onRequestError` in src/instrumentation.ts. Delete alongside
 * /sentry-check once verified.
 */
export const dynamic = 'force-dynamic';

export function GET(): never {
  throw new Error('Sentry check: server route error');
}
