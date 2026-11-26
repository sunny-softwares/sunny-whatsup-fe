'use client';

import { UI_MESSAGES, WEBHOOK_EVENT_TYPE } from '@/constants';
import { formatDateTime } from '@/lib/utils';
import type { WebhookDeliverySummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  WebhookDeliveryStatusBadge,
  webhookDeliveryNote,
} from '@/components/webhooks/WebhookDeliveryStatus';

const M = UI_MESSAGES.WEBHOOKS;

interface WebhookDeliveriesTableProps {
  items: WebhookDeliverySummary[];
  onView: (delivery: WebhookDeliverySummary) => void;
  // Waiting deliveries are held, not scheduled, while the endpoint is paused.
  endpointPaused?: boolean;
}

export function WebhookDeliveriesTable({
  items,
  onView,
  endpointPaused = false,
}: WebhookDeliveriesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{M.COL_TIME}</TableHead>
          <TableHead>{M.COL_EVENT}</TableHead>
          <TableHead>{M.COL_MESSAGE}</TableHead>
          <TableHead>{M.COL_RECIPIENT}</TableHead>
          <TableHead>{M.COL_RESPONSE}</TableHead>
          <TableHead>{M.COL_ATTEMPTS}</TableHead>
          <TableHead>{M.COL_STATUS}</TableHead>
          <TableHead className="text-right">{UI_MESSAGES.TABLE.COL_ACTIONS}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((d) => {
          const note = webhookDeliveryNote(d, { endpointPaused });
          return (
            <TableRow key={d.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(d.created_at)}
              </TableCell>
              <TableCell>
                <code className="text-xs">{d.event_type}</code>
              </TableCell>
              <TableCell>
                {d.event_type === WEBHOOK_EVENT_TYPE.TEST || !d.message_id ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <code className="text-xs text-muted-foreground" title={d.message_id}>
                    {d.message_id.slice(0, 8)}
                  </code>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">{d.recipient_phone ?? '—'}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {d.attempt_count === 0
                  ? '—'
                  : d.last_http_status !== null
                    ? M.RESPONSE_VALUE(d.last_http_status, d.last_duration_ms)
                    : d.last_error ?? '—'}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {M.ATTEMPTS_OF(d.attempt_count, d.max_attempts)}
              </TableCell>
              <TableCell>
                <WebhookDeliveryStatusBadge delivery={d} />
                {note ? <div className="mt-1 text-xs text-muted-foreground">{note}</div> : null}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" onClick={() => onView(d)}>
                  {M.VIEW}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
