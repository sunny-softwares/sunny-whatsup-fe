// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { ENV } from '@/constants/env';
import {
  SENTRY_DATA_COLLECTION,
  SENTRY_DENY_URLS,
  SENTRY_IGNORE_ERRORS,
} from '@/lib/sentry/options';

Sentry.init({
  dsn: ENV.SENTRY.DSN,
  // Without a DSN (local development, by default) the SDK stays inert.
  enabled: Boolean(ENV.SENTRY.DSN),
  environment: ENV.SENTRY.ENVIRONMENT,

  integrations: [
    Sentry.replayIntegration({
      // Never record customer message bodies, phone numbers or media.
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],

  tracesSampleRate: ENV.SENTRY.TRACES_SAMPLE_RATE,

  // Only keep replays for sessions that actually errored — replays are the
  // expensive part of the quota.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  ignoreErrors: SENTRY_IGNORE_ERRORS,
  denyUrls: SENTRY_DENY_URLS,
  dataCollection: SENTRY_DATA_COLLECTION,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
