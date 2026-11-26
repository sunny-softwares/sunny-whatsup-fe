'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { UI_MESSAGES, WEBHOOK_DELIVERY_STATUS } from '@/constants';
import { cn, formatDateTime, pickErrorMessage } from '@/lib/utils';
import type { WebhookApi } from '@/lib/api/webhook.api';
import type { WebhookDelivery } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  WebhookDeliveryStatusBadge,
  webhookDeliveryNote,
} from '@/components/webhooks/WebhookDeliveryStatus';

const M = UI_MESSAGES.WEBHOOKS;

interface WebhookDeliveryDialogProps {
  api: WebhookApi;
  // The delivery to show; the dialog is open while it is set.
  deliveryId: string | null;
  // Redelivery is only possible while the endpoint is active.
  canRedeliver: boolean;
  endpointPaused?: boolean;
  onClose: () => void;
  // Called after a redelivery, so the list behind can refresh.
  onChanged?: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="break-all text-sm font-medium">{children}</dd>
    </div>
  );
}

export function WebhookDeliveryDialog({
  api,
  deliveryId,
  canRedeliver,
  endpointPaused = false,
  onClose,
  onChanged,
}: WebhookDeliveryDialogProps) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const [delivery, setDelivery] = useState<WebhookDelivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRef.current.getDelivery(id);
      setDelivery(res.data);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setDelivery(null);
    setNotice(null);
    if (deliveryId) load(deliveryId);
  }, [deliveryId, load]);

  const handleRedeliver = async () => {
    if (!delivery) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await api.redeliver(delivery.id);
      setDelivery(res.data);
      setNotice(M.REDELIVERY_QUEUED);
      onChanged?.();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const note = delivery ? webhookDeliveryNote(delivery, { endpointPaused }) : null;
  const inFlight = delivery?.status === WEBHOOK_DELIVERY_STATUS.IN_FLIGHT;

  return (
    <Dialog open={!!deliveryId} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <code className="text-sm">{delivery?.event_type ?? M.LOG_TITLE}</code>
            {delivery ? <WebhookDeliveryStatusBadge delivery={delivery} /> : null}
          </DialogTitle>
          {note ? <DialogDescription className="mt-1">{note}</DialogDescription> : null}
        </DialogHeader>

        {loading && !delivery ? (
          <p className="text-sm text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}

        {delivery ? (
          <>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label={M.DETAIL_EVENT_ID}>
                <code className="text-xs">{delivery.event_id}</code>
              </Field>
              <Field label={M.DETAIL_MESSAGE_ID}>
                {delivery.message_id ? <code className="text-xs">{delivery.message_id}</code> : '—'}
              </Field>
              <Field label={M.DETAIL_RECIPIENT}>{delivery.recipient_phone ?? '—'}</Field>
              <Field label={M.DETAIL_CREATED}>{formatDateTime(delivery.created_at)}</Field>
              <Field label={M.DETAIL_ATTEMPTS}>
                {M.ATTEMPTS_OF(delivery.attempt_count, delivery.max_attempts)}
              </Field>
              <Field label={M.DETAIL_NEXT_ATTEMPT}>{formatDateTime(delivery.next_attempt_at)}</Field>
            </dl>

            <div>
              <p className="mb-2 text-sm font-medium">{M.DETAIL_ATTEMPTS_TITLE}</p>
              {delivery.attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{M.DETAIL_NO_ATTEMPTS}</p>
              ) : (
                <ul className="divide-y rounded-md border text-sm">
                  {delivery.attempts.map((a) => (
                    <li key={`${a.attempt}-${a.at}`} className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2">
                      <span className="w-8 text-muted-foreground">#{a.attempt}</span>
                      <span className="text-muted-foreground">{formatDateTime(a.at)}</span>
                      <span className="min-w-0 flex-1 break-all">
                        {a.http_status !== null ? `HTTP ${a.http_status}` : a.error ?? '—'}
                      </span>
                      <span className="text-muted-foreground">
                        {a.duration_ms !== null ? `${a.duration_ms} ms` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium">{M.DETAIL_REQUEST_TITLE}</p>
                <pre className="max-h-72 overflow-auto rounded-md border bg-muted/50 p-3 text-xs">
                  {JSON.stringify(delivery.payload, null, 2)}
                </pre>
              </div>
              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium">{M.DETAIL_RESPONSE_TITLE}</p>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md border bg-muted/50 p-3 text-xs">
                  {delivery.last_http_status !== null
                    ? `HTTP ${delivery.last_http_status}\n\n${delivery.last_response_body || M.DETAIL_NO_RESPONSE}`
                    : delivery.last_error ?? M.DETAIL_NO_RESPONSE}
                </pre>
                <p className="mt-1 text-xs text-muted-foreground">{M.DETAIL_RESPONSE_HINT}</p>
              </div>
            </div>
          </>
        ) : null}

        <DialogFooter className="items-center">
          {!canRedeliver && delivery ? (
            <p className="mr-auto text-xs text-muted-foreground">{M.REDELIVER_PAUSED_HINT}</p>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            {M.CLOSE}
          </Button>
          <Button
            onClick={handleRedeliver}
            disabled={!delivery || busy || inFlight || !canRedeliver}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', busy && 'animate-spin')} />
            {M.REDELIVER}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
