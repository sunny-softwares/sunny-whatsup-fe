'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BILLING_CYCLE_LABEL,
  PERIOD_PAYMENT_STATUS,
  PERIOD_PAYMENT_STATUS_LABEL,
  PERIOD_SOURCE_LABEL,
  UI_MESSAGES,
  formatAmountMinor,
} from '@/constants';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SubscriptionPeriod } from '@/types';

interface BillingCyclesTableProps {
  periods: SubscriptionPeriod[];
  /** The cycle being consumed right now, so it can be marked. */
  currentPeriodId?: string | null;
}

const PAYMENT_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  [PERIOD_PAYMENT_STATUS.PAID]: 'success',
  [PERIOD_PAYMENT_STATUS.WAIVED]: 'secondary',
  [PERIOD_PAYMENT_STATUS.UNPAID]: 'warning',
  [PERIOD_PAYMENT_STATUS.REFUNDED]: 'destructive',
};

/**
 * Every billing cycle a company holds, past and future.
 *
 * This is where the super admin can actually see banked coverage: a cycle whose
 * start is in the future is time the company has already paid for but is not yet
 * consuming, and nothing else in the admin UI reveals it.
 */
export function BillingCyclesTable({ periods, currentPeriodId }: BillingCyclesTableProps) {
  if (!periods.length) {
    return <p className="p-6 text-sm text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</p>;
  }

  const now = Date.now();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cycle</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Billing</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => {
            // A superseded cycle is void: it cannot be current, queued or count
            // for anything, so it takes precedence over every other label.
            const isSuperseded = Boolean(period.superseded_at);
            const isCurrent = !isSuperseded && period.id === currentPeriodId;
            const isFuture = !isSuperseded && new Date(period.starts_at).getTime() > now;
            const isPast = !isSuperseded && new Date(period.ends_at).getTime() < now && !isCurrent;

            return (
              <TableRow
                key={period.id}
                className={cn(
                  isCurrent && 'bg-primary/5',
                  isSuperseded && 'text-muted-foreground line-through opacity-60',
                )}
              >
                <TableCell className="whitespace-nowrap font-medium">
                  {formatDate(period.starts_at)} – {formatDate(period.ends_at)}
                </TableCell>
                <TableCell>{period.plan?.name ?? '—'}</TableCell>
                <TableCell>{BILLING_CYCLE_LABEL[period.billing_cycle]}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatAmountMinor(period.amount_minor, period.currency)}
                </TableCell>
                <TableCell>
                  <Badge variant={PAYMENT_VARIANT[period.payment_status] ?? 'secondary'}>
                    {PERIOD_PAYMENT_STATUS_LABEL[period.payment_status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {period.is_trial ? 'Trial' : PERIOD_SOURCE_LABEL[period.source]}
                </TableCell>
                <TableCell>
                  {isSuperseded ? (
                    <span className="no-underline" title={UI_MESSAGES.SUBSCRIPTION.SUPERSEDED_HINT}>
                      <Badge variant="destructive">
                        {UI_MESSAGES.SUBSCRIPTION.CYCLE_SUPERSEDED}
                      </Badge>
                    </span>
                  ) : isCurrent ? (
                    <Badge variant="default">{UI_MESSAGES.SUBSCRIPTION.CYCLE_CURRENT}</Badge>
                  ) : isFuture ? (
                    // The whole point of this table.
                    <Badge variant="outline">{UI_MESSAGES.SUBSCRIPTION.CYCLE_QUEUED}</Badge>
                  ) : isPast ? (
                    <span className="text-xs text-muted-foreground">
                      {UI_MESSAGES.SUBSCRIPTION.CYCLE_PAST}
                    </span>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
