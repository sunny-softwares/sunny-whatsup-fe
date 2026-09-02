// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { ENV } from '@/constants/env';
import { SENTRY_DATA_COLLECTION, SENTRY_IGNORE_ERRORS } from '@/lib/sentry/options';

Sentry.init({
  dsn: ENV.SENTRY.DSN,
  enabled: Boolean(ENV.SENTRY.DSN),
  environment: ENV.SENTRY.ENVIRONMENT,

  tracesSampleRate: ENV.SENTRY.TRACES_SAMPLE_RATE,

  ignoreErrors: SENTRY_IGNORE_ERRORS,
  dataCollection: SENTRY_DATA_COLLECTION,
});
