import { Badge } from '@/components/ui/badge';
import { TEMPLATE_STATUS, type TemplateStatus } from '@/constants';

const VARIANT: Record<TemplateStatus, 'success' | 'warning' | 'destructive' | 'muted' | 'default'> = {
  approved: 'success',
  pending: 'warning',
  in_appeal: 'warning',
  rejected: 'destructive',
  flagged: 'destructive',
  paused: 'warning',
  disabled: 'muted',
  pending_deletion: 'muted',
  deleted: 'muted',
  limit_exceeded: 'destructive',
};

export function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  const variant = VARIANT[status] ?? 'muted';
  const isApproved = status === TEMPLATE_STATUS.APPROVED;
  const label = status.replace(/_/g, ' ');
  return <Badge variant={variant}>{isApproved ? 'Approved' : label}</Badge>;
}
