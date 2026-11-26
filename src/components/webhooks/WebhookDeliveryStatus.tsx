import {
  UI_MESSAGES,
  WEBHOOK_DELIVERY_STATUS,
  WEBHOOK_EVENT_TYPE,
  WEBHOOK_FAILURE_REASON,
  WEBHOOK_SKIP_REASON,
} from '@/constants';
import { formatDateTime } from '@/lib/utils';
import type { WebhookDeliverySummary } from '@/types';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'muted' | 'secondary';

const M = UI_MESSAGES.WEBHOOKS;

// A pending delivery reads as "Retrying" once it has been tried, "Waiting" before.
const presentation = (d: WebhookDeliverySummary): { label: string; variant: BadgeVariant } => {
  switch (d.status) {
    case WEBHOOK_DELIVERY_STATUS.SUCCEEDED:
      return { label: M.DELIVERY_LABEL_DELIVERED, variant: 'success' };
    case WEBHOOK_DELIVERY_STATUS.PENDING:
      return d.attempt_count > 0
        ? { label: M.DELIVERY_LABEL_RETRYING, variant: 'warning' }
        : { label: M.DELIVERY_LABEL_WAITING, variant: 'muted' };
    case WEBHOOK_DELIVERY_STATUS.IN_FLIGHT:
      return { label: M.DELIVERY_LABEL_SENDING, variant: 'muted' };
    case WEBHOOK_DELIVERY_STATUS.FAILED:
      return { label: M.DELIVERY_LABEL_FAILED, variant: 'destructive' };
    case WEBHOOK_DELIVERY_STATUS.SKIPPED:
    default:
      return { label: M.DELIVERY_LABEL_SKIPPED, variant: 'secondary' };
  }
};

const FAILURE_NOTE: Record<string, string> = {
  [WEBHOOK_FAILURE_REASON.RETRIES_EXHAUSTED]: M.NOTE_RETRIES_EXHAUSTED,
  [WEBHOOK_FAILURE_REASON.GONE]: M.NOTE_GONE,
  [WEBHOOK_FAILURE_REASON.EXPIRED]: M.NOTE_EXPIRED,
};

const SKIP_NOTE: Record<string, string> = {
  [WEBHOOK_SKIP_REASON.UNSUBSCRIBED]: M.NOTE_UNSUBSCRIBED,
  [WEBHOOK_SKIP_REASON.FEATURE_DISABLED]: M.NOTE_FEATURE_DISABLED,
};

/**
 * The one-line explanation shown under a delivery's status, if any. While the
 * endpoint is paused, a waiting delivery is held rather than scheduled.
 */
export const webhookDeliveryNote = (
  d: WebhookDeliverySummary,
  { endpointPaused = false }: { endpointPaused?: boolean } = {},
): string | null => {
  if (d.status === WEBHOOK_DELIVERY_STATUS.PENDING && endpointPaused) return M.NOTE_HELD;
  if (d.status === WEBHOOK_DELIVERY_STATUS.PENDING && d.attempt_count > 0 && d.next_attempt_at) {
    return M.NOTE_NEXT_TRY(formatDateTime(d.next_attempt_at));
  }
  if (d.status === WEBHOOK_DELIVERY_STATUS.FAILED && d.failure_reason) {
    return FAILURE_NOTE[d.failure_reason] ?? null;
  }
  if (d.status === WEBHOOK_DELIVERY_STATUS.SKIPPED && d.skip_reason) {
    return SKIP_NOTE[d.skip_reason] ?? null;
  }
  if (d.event_type === WEBHOOK_EVENT_TYPE.TEST) return M.NOTE_TEST;
  return null;
};

export function WebhookDeliveryStatusBadge({ delivery }: { delivery: WebhookDeliverySummary }) {
  const { label, variant } = presentation(delivery);
  return <Badge variant={variant}>{label}</Badge>;
}
