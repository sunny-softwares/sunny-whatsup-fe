'use client';

import { Check, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RazorpayCheckoutButton } from './RazorpayCheckoutButton';
import {
  BILLING_CYCLE_SUFFIX,
  UI_MESSAGES,
  formatAmountMinor,
  type BillingCycle,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  billingCycle: BillingCycle;
  isCurrent: boolean;
  /** On a trial the company has never paid, so "Renew" would be wrong. */
  isTrialing: boolean;
  /** False when Razorpay is unconfigured — the CTA is hidden rather than broken. */
  paymentEnabled: boolean;
  interestRegistered: boolean;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancelled: () => void;
  onRegisterInterest: (planKey: string) => void;
  interestBusy: boolean;
}

export function PlanCard({
  plan,
  billingCycle,
  isCurrent,
  isTrialing,
  paymentEnabled,
  interestRegistered,
  onSuccess,
  onError,
  onCancelled,
  onRegisterInterest,
  interestBusy,
}: PlanCardProps) {
  const price = plan.prices.find((p) => p.billing_cycle === billingCycle);
  // A plan is coming-soon when it cannot be bought — the flag is just how it is
  // presented. Both come from the database.
  const comingSoon = plan.is_coming_soon || !plan.is_purchasable;

  return (
    <Card
      className={cn(
        'flex h-full flex-col',
        isCurrent && 'border-primary ring-1 ring-primary',
        comingSoon && 'opacity-90',
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          {isCurrent ? (
            <Badge variant="success">{UI_MESSAGES.SUBSCRIPTION.CURRENT_BADGE}</Badge>
          ) : comingSoon ? (
            <Badge variant="secondary">{UI_MESSAGES.SUBSCRIPTION.COMING_SOON_BADGE}</Badge>
          ) : null}
        </div>

        <div>
          {price ? (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">
                {formatAmountMinor(price.amount_minor, price.currency)}
              </span>
              <span className="text-sm text-muted-foreground">
                {BILLING_CYCLE_SUFFIX[billingCycle]}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</span>
          )}
        </div>

        {plan.description ? <CardDescription>{plan.description}</CardDescription> : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-6">
        <ul className="space-y-2 text-sm">
          {plan.highlights.map((highlight, index) => {
            // Highlights on a coming-soon plan lead with what is inherited from
            // the plan below it, so only the genuinely new capabilities are shown
            // as pending.
            const pending = comingSoon && index > 0;
            const Icon = pending ? Circle : Check;
            return (
              <li key={highlight} className="flex items-start gap-2">
                <Icon
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    pending ? 'text-muted-foreground' : 'text-primary',
                  )}
                />
                <span className={cn(pending && 'text-muted-foreground')}>{highlight}</span>
              </li>
            );
          })}
        </ul>

        <div>
          {comingSoon ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={interestRegistered || interestBusy}
              onClick={() => onRegisterInterest(plan.key)}
            >
              {interestRegistered
                ? UI_MESSAGES.SUBSCRIPTION.NOTIFY_ME_DONE
                : UI_MESSAGES.SUBSCRIPTION.NOTIFY_ME}
            </Button>
          ) : !paymentEnabled ? (
            <p className="text-sm text-muted-foreground">
              {UI_MESSAGES.SUBSCRIPTION.PAYMENT_UNAVAILABLE}
            </p>
          ) : !price ? (
            // No active price configured for this cycle. Offering a button that
            // can only fail server-side is worse than saying so.
            <p className="text-sm text-muted-foreground">
              {UI_MESSAGES.SUBSCRIPTION.PRICE_UNAVAILABLE}
            </p>
          ) : (
            <RazorpayCheckoutButton
              planKey={plan.key}
              billingCycle={billingCycle}
              className="w-full"
              variant={isCurrent && !isTrialing ? 'outline' : 'default'}
              label={
                // A trial has never been paid for, so "Renew" would be wrong
                // even though this is nominally the current plan.
                isTrialing
                  ? UI_MESSAGES.SUBSCRIPTION.PAY_NOW
                  : isCurrent
                    ? UI_MESSAGES.SUBSCRIPTION.RENEW_NOW
                    : UI_MESSAGES.SUBSCRIPTION.UPGRADE
              }
              onSuccess={onSuccess}
              onError={onError}
              onCancelled={onCancelled}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
