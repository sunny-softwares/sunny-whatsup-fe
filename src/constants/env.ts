// Reads a sample rate from the environment, falling back when unset or unparseable.
const sampleRate = (raw: string | undefined, fallback: number) => {
  const parsed = Number(raw);
  return raw && Number.isFinite(parsed) ? parsed : fallback;
};

export const ENV = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Sunny WhatsUp',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  META: {
    APP_ID: process.env.NEXT_PUBLIC_META_APP_ID ?? '',
    CONFIG_ID: process.env.NEXT_PUBLIC_META_CONFIG_ID ?? '',
    GRAPH_VERSION: process.env.NEXT_PUBLIC_META_GRAPH_VERSION ?? 'v21.0',
  },
  SENTRY: {
    // No DSN => Sentry stays off. Leave it unset locally, set it in production.
    DSN: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
    // Vercel injects NEXT_PUBLIC_VERCEL_ENV ("production" | "preview" |
    // "development") on every deploy, so previews tag themselves without any
    // per-environment config. The explicit var only exists to override that.
    ENVIRONMENT:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
      process.env.NEXT_PUBLIC_VERCEL_ENV ??
      process.env.NODE_ENV ??
      'development',
    TRACES_SAMPLE_RATE: sampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.1),
  },
} as const;
