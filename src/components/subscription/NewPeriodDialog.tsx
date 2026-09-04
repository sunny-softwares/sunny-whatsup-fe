'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BILLING_CYCLE_LABEL,
  BILLING_CYCLE_VALUES,
  PERIOD_PAYMENT_STATUS,
  PERIOD_PAYMENT_STATUS_LABEL,
  PERIOD_PAYMENT_STATUS_VALUES,
  UI_MESSAGES,
  type BillingCycle,
  type PeriodPaymentStatus,
} from '@/constants';
import { formatDate, fromDateTimeLocalInput, toDateTimeLocalInput } from '@/lib/utils';
import type { AdminCompanySubscriptionView, PeriodPayload, Plan } from '@/types';

const SELECT_CLASS =
  'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface NewPeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  view: AdminCompanySubscriptionView | null;
  plans: Plan[];
  loading: boolean;
  error: string | null;
  onCreate: (payload: PeriodPayload) => Promise<void>;
}

/**
 * Creates a billing cycle by hand.
 *
 * Leaving the dates blank appends the cycle to the end of the timeline, so it
 * queues behind whatever is running — or starts immediately when nothing is
 * live. The dialog computes and shows that outcome up front, because "will this
 * take effect now or later" is the one thing an admin must not have to guess.
 */
export function NewPeriodDialog({
  open,
  onOpenChange,
  companyName,
  view,
  plans,
  loading,
  error,
  onCreate,
}: NewPeriodDialogProps) {
  const [planKey, setPlanKey] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PeriodPaymentStatus>(
    PERIOD_PAYMENT_STATUS.PAID,
  );
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [amountMajor, setAmountMajor] = useState('');
  const [graceDays, setGraceDays] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [makeActive, setMakeActive] = useState(false);
  const [notes, setNotes] = useState('');

  // Mirrors the server's defaultPeriodStart: append to the end of the timeline
  // if anything still runs, otherwise start now.
  const { defaultStart, placement } = useMemo(() => {
    const now = new Date();
    const ends = view?.periods
      ?.map((p) => new Date(p.ends_at))
      .filter((d) => !Number.isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());
    const latest = ends?.[0];

    if (latest && latest > now) return { defaultStart: latest, placement: 'queued' as const };
    return { defaultStart: now, placement: 'current' as const };
  }, [view?.periods]);

  useEffect(() => {
    if (!open) return;
    setPlanKey(view?.subscription?.plan?.key ?? plans[0]?.key ?? '');
    setBillingCycle((view?.subscription?.billing_cycle as BillingCycle) ?? 'yearly');
    setUseCustomDates(false);
    setStartsAt(toDateTimeLocalInput(defaultStart));
    setEndsAt('');
    setPaymentStatus(PERIOD_PAYMENT_STATUS.PAID);
    setUseCustomAmount(false);
    setAmountMajor('');
    setGraceDays('');
    setIsTrial(false);
    setMakeActive(false);
    setNotes('');
  }, [open, view, plans, defaultStart]);

  // How many cycles would be voided: everything still in play, i.e. anything
  // that has not already ended. Past cycles are history and are left alone.
  const wouldSupersede = useMemo(() => {
    const now = Date.now();
    return (view?.periods ?? []).filter(
      (p) => !p.superseded_at && new Date(p.ends_at).getTime() > now,
    ).length;
  }, [view?.periods]);

  // What the plan charges for the chosen cycle — shown so the admin knows what
  // the amount will be if they do not override it.
  const planPrice = useMemo(() => {
    const plan = plans.find((p) => p.key === planKey);
    return plan?.prices.find((p) => p.billing_cycle === billingCycle) ?? null;
  }, [plans, planKey, billingCycle]);

  const handleSubmit = async () => {
    const payload: PeriodPayload = {
      plan_key: planKey || undefined,
      billing_cycle: billingCycle,
      payment_status: paymentStatus,
      is_trial: isTrial,
      make_active: makeActive,
      notes: notes || null,
    };

    if (useCustomDates) {
      if (startsAt) payload.starts_at = fromDateTimeLocalInput(startsAt);
      if (endsAt) payload.ends_at = fromDateTimeLocalInput(endsAt);
    }
    if (useCustomAmount && amountMajor !== '') {
      // Stored in minor units; round so a stray decimal cannot write a
      // fractional paise value.
      payload.amount_minor = Math.round(Number(amountMajor) * 100);
    }
    if (graceDays !== '') payload.grace_days = Number(graceDays);

    await onCreate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (loading ? null : onOpenChange(next))}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.SUBSCRIPTION.NEW_PERIOD}</DialogTitle>
          <DialogDescription>{companyName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ticking "make active" changes the outcome completely, so the banner
              has to say so before the admin commits. */}
          <div
            className={
              makeActive
                ? 'rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'
                : placement === 'queued'
                  ? 'rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary'
                  : 'rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900'
            }
          >
            {makeActive
              ? UI_MESSAGES.SUBSCRIPTION.PLACEMENT_REPLACE(wouldSupersede)
              : placement === 'queued'
                ? UI_MESSAGES.SUBSCRIPTION.PLACEMENT_QUEUED(formatDate(defaultStart.toISOString()))
                : UI_MESSAGES.SUBSCRIPTION.PLACEMENT_CURRENT}
          </div>

          <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
            <Checkbox
              checked={makeActive}
              onChange={(e) => setMakeActive(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="block font-medium">{UI_MESSAGES.SUBSCRIPTION.MAKE_ACTIVE}</span>
              <span className="block text-xs text-muted-foreground">
                {UI_MESSAGES.SUBSCRIPTION.MAKE_ACTIVE_HINT}
              </span>
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="np-plan">{UI_MESSAGES.SUBSCRIPTION.PLAN_LABEL}</Label>
              <select
                id="np-plan"
                className={SELECT_CLASS}
                value={planKey}
                onChange={(e) => setPlanKey(e.target.value)}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.key}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="np-cycle">{UI_MESSAGES.SUBSCRIPTION.CYCLE_LABEL}</Label>
              <select
                id="np-cycle"
                className={SELECT_CLASS}
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
              >
                {BILLING_CYCLE_VALUES.map((cycle) => (
                  <option key={cycle} value={cycle}>
                    {BILLING_CYCLE_LABEL[cycle]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={useCustomDates}
                onChange={(e) => setUseCustomDates(e.target.checked)}
              />
              {UI_MESSAGES.SUBSCRIPTION.CUSTOM_DATES}
            </label>

            {useCustomDates ? (
              <div className="grid gap-4 pt-1 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="np-start">{UI_MESSAGES.SUBSCRIPTION.STARTS_AT_LABEL}</Label>
                  <Input
                    id="np-start"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="np-end">{UI_MESSAGES.SUBSCRIPTION.ENDS_AT_LABEL}</Label>
                  <Input
                    id="np-end"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {UI_MESSAGES.SUBSCRIPTION.ENDS_AT_HINT}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {UI_MESSAGES.SUBSCRIPTION.DEFAULT_DATES_HINT(
                  formatDate(defaultStart.toISOString()),
                  BILLING_CYCLE_LABEL[billingCycle].toLowerCase(),
                )}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="np-payment">{UI_MESSAGES.SUBSCRIPTION.PAYMENT_STATUS_LABEL}</Label>
              <select
                id="np-payment"
                className={SELECT_CLASS}
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PeriodPaymentStatus)}
              >
                {PERIOD_PAYMENT_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PERIOD_PAYMENT_STATUS_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="np-grace">{UI_MESSAGES.SUBSCRIPTION.GRACE_DAYS_LABEL}</Label>
              <Input
                id="np-grace"
                type="number"
                min={0}
                max={365}
                placeholder={UI_MESSAGES.SUBSCRIPTION.GRACE_INHERIT}
                value={graceDays}
                onChange={(e) => setGraceDays(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={useCustomAmount}
                onChange={(e) => setUseCustomAmount(e.target.checked)}
              />
              {UI_MESSAGES.SUBSCRIPTION.CUSTOM_AMOUNT}
            </label>

            {useCustomAmount ? (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="np-amount">{UI_MESSAGES.SUBSCRIPTION.AMOUNT_LABEL} (₹)</Label>
                <Input
                  id="np-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountMajor}
                  onChange={(e) => setAmountMajor(e.target.value)}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {planPrice
                  ? UI_MESSAGES.SUBSCRIPTION.DEFAULT_AMOUNT_HINT(
                      (planPrice.amount_minor / 100).toLocaleString('en-IN'),
                    )
                  : UI_MESSAGES.SUBSCRIPTION.NO_PLAN_PRICE_HINT}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} />
            {UI_MESSAGES.SUBSCRIPTION.MARK_AS_TRIAL}
          </label>

          <div className="space-y-1.5">
            <Label htmlFor="np-notes">{UI_MESSAGES.SUBSCRIPTION.NOTES_LABEL}</Label>
            <Input
              id="np-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={UI_MESSAGES.SUBSCRIPTION.NOTES_PLACEHOLDER}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {UI_MESSAGES.COMMON.CANCEL}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !planKey}>
            {loading ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.SUBSCRIPTION.CREATE_CYCLE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
