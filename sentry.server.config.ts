// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { ENV } from '@/constants/env';
import {
  SENTRY_CONSOLE_LEVELS,
  SENTRY_DATA_COLLECTION,
  SENTRY_IGNORE_ERRORS,
} from '@/lib/sentry/options';

Sentry.init({
  dsn: ENV.SENTRY.DSN,
  enabled: Boolean(ENV.SENTRY.DSN),
  environment: ENV.SENTRY.ENVIRONMENT,

  integrations: [Sentry.consoleLoggingIntegration({ levels: SENTRY_CONSOLE_LEVELS })],

  tracesSampleRate: ENV.SENTRY.TRACES_SAMPLE_RATE,
  enableLogs: true,

  ignoreErrors: SENTRY_IGNORE_ERRORS,
  dataCollection: SENTRY_DATA_COLLECTION,
});
