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
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_VARIANT,
  RAZORPAY_MODE,
  UI_MESSAGES,
  formatAmountMinor,
} from '@/constants';
import { formatDateTime } from '@/lib/utils';
import type { Payment } from '@/types';

interface PaymentHistoryTableProps {
  payments: Payment[];
  /** Super-admin view shows the raw gateway ids for support work. */
  showGatewayIds?: boolean;
}

export function PaymentHistoryTable({ payments, showGatewayIds }: PaymentHistoryTableProps) {
  if (!payments.length) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        {UI_MESSAGES.SUBSCRIPTION.PAYMENT_HISTORY_EMPTY}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            {showGatewayIds ? <TableHead>Razorpay</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="whitespace-nowrap">
                {formatDateTime(payment.paid_at ?? payment.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{payment.plan?.name ?? '—'}</span>
                  {/* Makes test-mode rows obvious so they are never mistaken for revenue. */}
                  {payment.razorpay_mode === RAZORPAY_MODE.TEST ? (
                    <Badge variant="muted">test</Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatAmountMinor(payment.amount_minor, payment.currency)}
                {payment.amount_refunded_minor > 0 ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (−{formatAmountMinor(payment.amount_refunded_minor, payment.currency)})
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground">{payment.method ?? '—'}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant={PAYMENT_STATUS_VARIANT[payment.status]}>
                    {PAYMENT_STATUS_LABEL[payment.status]}
                  </Badge>
                  {payment.error_description ? (
                    <p className="max-w-[220px] text-xs text-muted-foreground">
                      {payment.error_description}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              {showGatewayIds ? (
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <div>{payment.razorpay_order_id ?? '—'}</div>
                  <div>{payment.razorpay_payment_id ?? ''}</div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
