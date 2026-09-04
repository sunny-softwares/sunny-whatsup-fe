'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ENTITLEMENT_STATE_LABEL,
  ENTITLEMENT_STATE_VARIANT,
  BILLING_CYCLE_LABEL,
  PERIOD_PAYMENT_STATUS_LABEL,
  UI_MESSAGES,
  formatAmountMinor,
} from '@/constants';
import { formatDate } from '@/lib/utils';
import type { CompanySubscriptionView } from '@/types';

interface SubscriptionSummaryCardProps {
  view: CompanySubscriptionView;
  onCancel: () => void;
  onResume: () => void;
  busy: boolean;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function SubscriptionSummaryCard({
  view,
  onCancel,
  onResume,
  busy,
}: SubscriptionSummaryCardProps) {
  const { subscription, current_period: period, state, days_remaining: daysRemaining } = view;

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{UI_MESSAGES.SUBSCRIPTION.NO_SUBSCRIPTION}</p>
        </CardContent>
      </Card>
    );
  }

  const planName = period?.plan?.name ?? subscription.plan?.name ?? '—';
  const cycle = period?.billing_cycle ?? subscription.billing_cycle;

  // Renewing early buys a cycle that has not started yet, so it is invisible in
  // `current_period`. Surfacing it is what stops a real purchase from looking
  // like it was swallowed.
  const coverageEndsAt = view.coverage_ends_at;
  const hasBankedCoverage =
    !!coverageEndsAt &&
    !!period &&
    new Date(coverageEndsAt).getTime() > new Date(period.ends_at).getTime();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>{UI_MESSAGES.SUBSCRIPTION.CURRENT_PLAN}</CardTitle>
          <CardDescription>{planName}</CardDescription>
        </div>
        {state ? (
          <Badge variant={ENTITLEMENT_STATE_VARIANT[state]}>
            {ENTITLEMENT_STATE_LABEL[state]}
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label={UI_MESSAGES.SUBSCRIPTION.CYCLE_LABEL} value={BILLING_CYCLE_LABEL[cycle]} />
          <Field
            label={UI_MESSAGES.SUBSCRIPTION.ENDS_AT_LABEL}
            value={period ? formatDate(period.ends_at) : '—'}
          />
          <Field
            label={UI_MESSAGES.SUBSCRIPTION.PAYMENT_STATUS_LABEL}
            value={period ? PERIOD_PAYMENT_STATUS_LABEL[period.payment_status] : '—'}
          />
          <Field
            label={UI_MESSAGES.SUBSCRIPTION.AMOUNT_LABEL}
            value={period ? formatAmountMinor(period.amount_minor, period.currency) : '—'}
          />
        </dl>

        {typeof daysRemaining === 'number' ? (
          <p className="text-sm text-muted-foreground">
            {UI_MESSAGES.SUBSCRIPTION.DAYS_REMAINING(daysRemaining)}
          </p>
        ) : null}

        {hasBankedCoverage ? (
          <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <p className="font-medium text-primary">
              {UI_MESSAGES.SUBSCRIPTION.PAID_THROUGH(formatDate(coverageEndsAt as string))}
            </p>
            <p className="mt-1 text-muted-foreground">
              {UI_MESSAGES.SUBSCRIPTION.PAID_THROUGH_HINT}
            </p>
            {view.upcoming_periods.length ? (
              <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                {view.upcoming_periods.map((upcoming) => (
                  <li key={upcoming.id}>
                    {upcoming.plan?.name ?? planName} · {formatDate(upcoming.starts_at)} –{' '}
                    {formatDate(upcoming.ends_at)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          {subscription.cancel_at_period_end ? (
            <>
              <p className="flex-1 text-sm text-muted-foreground">
                {UI_MESSAGES.SUBSCRIPTION.CANCEL_CONFIRM}
              </p>
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onResume}>
                {UI_MESSAGES.SUBSCRIPTION.RESUME_BUTTON}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={onCancel}
              className="text-muted-foreground hover:text-destructive"
            >
              {UI_MESSAGES.SUBSCRIPTION.CANCEL_BUTTON}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
