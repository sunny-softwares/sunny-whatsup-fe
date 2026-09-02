/**
 * Options shared by the browser, server and edge Sentry initialisations
 * (instrumentation-client.ts, sentry.server.config.ts, sentry.edge.config.ts).
 */

// Browser/extension noise that is never actionable for us.
export const SENTRY_IGNORE_ERRORS = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
  // The user navigated away / lost connectivity mid-request.
  'AbortError',
  'Network request failed',
  'NetworkError when attempting to fetch resource',
];

// Errors thrown by third-party scripts we don't control (extensions, Meta SDK).
export const SENTRY_DENY_URLS = [
  /extensions\//i,
  /^chrome:\/\//i,
  /^chrome-extension:\/\//i,
  /^moz-extension:\/\//i,
  /^safari-extension:\/\//i,
];

/**
 * This app carries auth JWTs in cookies and customer phone numbers / message
 * bodies in request payloads, so none of that may leave the browser. User
 * attribution is attached explicitly instead — see ./user.
 */
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpBodies: [],
  httpHeaders: {
    request: { deny: ['authorization', 'cookie', 'x-api-key'] },
    response: { deny: ['set-cookie'] },
  },
};

/**
 * Console levels forwarded into Sentry's Logs view. Deliberately excludes
 * `log`/`debug`/`info`: console capture bypasses the scrubbing below (it just
 * ships whatever string was logged), and this app logs around message bodies
 * and phone numbers. Widen only if you're sure the call sites are clean.
 */
export const SENTRY_CONSOLE_LEVELS: ('error' | 'warn')[] = ['error', 'warn'];
