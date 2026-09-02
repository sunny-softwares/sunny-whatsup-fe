import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';
import { ENV } from '@/constants';
import { AuthHydrator } from '@/components/layout/AuthHydrator';
import './globals.css';

// Sentry's trace headers, as `<meta>` tags, so a server-rendered request and the
// browser errors that follow it land on the same trace. `getTraceData` returns
// its keys as optional, while `Metadata['other']` only accepts strings — so drop
// the empty ones rather than emitting meta tags with no content.
const traceMeta = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(Sentry.getTraceData()).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

export function generateMetadata(): Metadata {
  return {
    title: ENV.APP_NAME,
    description: 'Multi-tenant WhatsApp Business platform powered by Meta',
    other: traceMeta(),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthHydrator />
        {children}
      </body>
    </html>
  );
}
