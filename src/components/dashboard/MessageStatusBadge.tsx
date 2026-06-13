import { MESSAGE_STATUS } from '@/constants';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'success' | 'destructive' | 'warning' | 'muted';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  [MESSAGE_STATUS.SENT]: 'muted',
  [MESSAGE_STATUS.DELIVERED]: 'success',
  [MESSAGE_STATUS.READ]: 'success',
  [MESSAGE_STATUS.FAILED]: 'destructive',
  [MESSAGE_STATUS.QUEUED]: 'warning',
};

export function MessageStatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_VARIANT[status] ?? 'muted'}>{status}</Badge>;
}
