// `withSentryConfig` lives on the /config subpath — the @sentry/nextjs root
// export of it is deprecated and goes away in v11.
const { withSentryConfig } = require('@sentry/nextjs/config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  org: 'rushil-vora',
  project: 'whatsup-sunny',

  // Source maps are uploaded only when SENTRY_AUTH_TOKEN is present; without it
  // the build still succeeds, just with minified stack traces.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  sourcemaps: {
    // Don't leave the maps on the server after they've been uploaded — they'd
    // otherwise be publicly fetchable alongside the bundles.
    deleteSourcemapsAfterUpload: true,
  },

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet
    // work with App Router route handlers.)
    // https://docs.sentry.io/product/crons/
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
