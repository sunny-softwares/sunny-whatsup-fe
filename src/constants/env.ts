export const ENV = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Sunny WhatsUp',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  META: {
    APP_ID: process.env.NEXT_PUBLIC_META_APP_ID ?? '',
    CONFIG_ID: process.env.NEXT_PUBLIC_META_CONFIG_ID ?? '',
    GRAPH_VERSION: process.env.NEXT_PUBLIC_META_GRAPH_VERSION ?? 'v21.0',
  },
} as const;
