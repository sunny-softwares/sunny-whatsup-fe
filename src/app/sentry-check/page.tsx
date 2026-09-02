'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Temporary Sentry verification page. Every button exercises one product area
 * so you can confirm data is arriving end to end. Delete this route (and
 * /api/sentry-check) once the setup is verified.
 */
export default function SentryCheckPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [renderError, setRenderError] = useState(false);

  // Thrown during render, so it escapes to the root error boundary
  // (global-error.tsx) rather than being swallowed by the event handler.
  if (renderError) {
    throw new Error('Sentry check: render error');
  }

  const sendLogs = () => {
    Sentry.logger.info('Sentry check: info log', { source: 'sentry-check' });
    Sentry.logger.warn('Sentry check: warn log', { source: 'sentry-check' });
    Sentry.logger.error('Sentry check: error log', { source: 'sentry-check' });
    // Also proves the console integration is forwarding these two levels.
    console.warn('Sentry check: console.warn');
    console.error('Sentry check: console.error');
    setStatus('Sent 3 logger entries + 2 console entries -> Explore > Logs');
  };

  const sendMetrics = () => {
    Sentry.metrics.count('sentry_check.clicks', 1, { attributes: { source: 'sentry-check' } });
    Sentry.metrics.gauge('sentry_check.gauge', Math.round(Math.random() * 100), {
      attributes: { source: 'sentry-check' },
    });
    Sentry.metrics.distribution('sentry_check.duration', Math.random() * 500, {
      unit: 'millisecond',
      attributes: { source: 'sentry-check' },
    });
    setStatus('Sent count + gauge + distribution -> Explore > Metrics');
  };

  const sendMessage = () => {
    Sentry.captureMessage('Sentry check: captured message', 'info');
    setStatus('Sent a message -> Issues');
  };

  const throwServerError = async () => {
    setStatus('Calling /api/sentry-check ...');
    try {
      await fetch('/api/sentry-check');
      setStatus('Server route returned 500 -> Issues (server-side event)');
    } catch {
      setStatus('Request failed - check Issues anyway');
    }
  };

  const startTrace = () =>
    Sentry.startSpan({ name: 'Sentry check: manual span', op: 'ui.action' }, async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStatus('Recorded a span -> Explore > Traces');
    });

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Sentry check</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Temporary page for verifying the Sentry integration. Delete it once every section in Sentry
        has data. Events usually appear within a minute.
      </p>

      <Card className="mt-6 space-y-3 p-6">
        <div className="flex flex-wrap gap-3">
          <Button onClick={sendLogs}>Send logs</Button>
          <Button onClick={sendMetrics}>Send metrics</Button>
          <Button onClick={startTrace}>Record a span</Button>
          <Button onClick={sendMessage} variant="secondary">
            Capture message
          </Button>
          <Button onClick={throwServerError} variant="outline">
            Throw server error
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              throw new Error('Sentry check: handler error');
            }}
          >
            Throw client error
          </Button>
          <Button variant="destructive" onClick={() => setRenderError(true)}>
            Crash the page
          </Button>
        </div>

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </Card>
    </main>
  );
}
