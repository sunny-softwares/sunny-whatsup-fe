import * as Sentry from '@sentry/nextjs';
import type { AuthUser } from '@/types';

/**
 * Attaches the signed-in user to every subsequent event. Automatic PII
 * collection is off (see ./options), so this is the only user data we send.
 */
export const setSentryUser = (user: AuthUser | null) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
  Sentry.setTags({
    role: user.role,
    company_id: user.company_id ?? 'none',
  });
};

export const clearSentryUser = () => {
  Sentry.setUser(null);
  Sentry.setTags({ role: undefined, company_id: undefined });
};
