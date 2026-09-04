'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BILLING_CYCLE_LABEL,
  BILLING_CYCLE_VALUES,
  PERIOD_PAYMENT_STATUS_LABEL,
  PERIOD_PAYMENT_STATUS_VALUES,
  SUBSCRIPTION_STATUS_VALUES,
  UI_MESSAGES,
  type BillingCycle,
  type PeriodPaymentStatus,
  type SubscriptionStatus,
} from '@/constants';
import { fromDateTimeLocalInput, toDateTimeLocalInput } from '@/lib/utils';
import type { AdminCompanySubscriptionView, PeriodPayload, Plan, UpdateSubscriptionPayload } from '@/types';

interface SubscriptionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: AdminCompanySubscriptionView | null;
  plans: Plan[];
  loading: boolean;
  error: string | null;
  onSave: (
    subscription: UpdateSubscriptionPayload,
    period: PeriodPayload | null,
    periodId: string | null,
  ) => Promise<void>;
}

/**
 * The super admin's main lever: change the plan/cycle/status, and edit the
 * current billing cycle's dates and payment status, in one place.
 *
 * The two halves are saved as separate API calls because they are separate
 * resources — a subscription-only change must not require a cycle to exist.
 */
export function SubscriptionEditDialog({
  open,
  onOpenChange,
  view,
  plans,
  loading,
  error,
  onSave,
}: SubscriptionEditDialogProps) {
  const [planKey, setPlanKey] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle | ''>('');
  const [status, setStatus] = useState<SubscriptionStatus | ''>('');
  const [graceDays, setGraceDays] = useState('');
  const [notes, setNotes] = useState('');

  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PeriodPaymentStatus | ''>('');
  const [amountMajor, setAmountMajor] = useState('');

  // Re-seed from the server every time the dialog opens, so a cancelled edit is
  // genuinely discarded rather than lingering in local state.
  useEffect(() => {
    if (!open || !view) return;
    const sub = view.subscription;
    const period = view.current_period;

    setPlanKey(sub?.plan?.key ?? '');
    setBillingCycle(sub?.billing_cycle ?? '');
    setStatus(sub?.status ?? '');
    setGraceDays(sub?.grace_days === null || sub?.grace_days === undefined ? '' : String(sub.grace_days));
    setNotes(sub?.notes ?? '');

    setStartsAt(toDateTimeLocalInput(period?.starts_at));
    setEndsAt(toDateTimeLocalInput(period?.ends_at));
    setPaymentStatus(period?.payment_status ?? '');
    // Displayed in rupees; converted back to paise on save.
    setAmountMajor(period ? String(period.amount_minor / 100) : '');
  }, [open, view]);

  const handleSubmit = async () => {
    const subscriptionPayload: UpdateSubscriptionPayload = {};
    if (planKey) subscriptionPayload.plan_key = planKey;
    if (billingCycle) subscriptionPayload.billing_cycle = billingCycle;
    if (status) subscriptionPayload.status = status;
    subscriptionPayload.grace_days = graceDays === '' ? null : Number(graceDays);
    subscriptionPayload.notes = notes || null;

    const period = view?.current_period;
    let periodPayload: PeriodPayload | null = null;
    if (period) {
      periodPayload = {
        // The input holds local wall-clock time; convert back to the UTC instant
        // the API stores.
        starts_at: fromDateTimeLocalInput(startsAt),
        ends_at: fromDateTimeLocalInput(endsAt),
        payment_status: paymentStatus || undefined,
        // Money is stored in minor units; round so a stray decimal cannot write
        // a fractional paise value.
        amount_minor: amountMajor === '' ? undefined : Math.round(Number(amountMajor) * 100),
      };
    }

    await onSave(subscriptionPayload, periodPayload, period?.id ?? null);
  };

  const selectClass =
    'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <Dialog open={open} onOpenChange={(next) => (loading ? null : onOpenChange(next))}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.SUBSCRIPTION.EDIT_SUBSCRIPTION}</DialogTitle>
          <DialogDescription>{view?.subscription?.company?.name ?? ''}</DialogDescription>
        </DialogHeader>

        {!view?.subscription ? (
          <p className="text-sm text-muted-foreground">
            {UI_MESSAGES.SUBSCRIPTION.NO_SUBSCRIPTION}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="plan">{UI_MESSAGES.SUBSCRIPTION.PLAN_LABEL}</Label>
                <select
                  id="plan"
                  className={selectClass}
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
                <Label htmlFor="cycle">{UI_MESSAGES.SUBSCRIPTION.CYCLE_LABEL}</Label>
                <select
                  id="cycle"
                  className={selectClass}
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

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className={selectClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                >
                  {SUBSCRIPTION_STATUS_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="grace">{UI_MESSAGES.SUBSCRIPTION.GRACE_DAYS_LABEL}</Label>
                <Input
                  id="grace"
                  type="number"
                  min={0}
                  max={365}
                  placeholder="Inherit from plan"
                  value={graceDays}
                  onChange={(e) => setGraceDays(e.target.value)}
                />
              </div>
            </div>

            {view.current_period ? (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">{UI_MESSAGES.SUBSCRIPTION.EDIT_PERIOD}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="starts">{UI_MESSAGES.SUBSCRIPTION.STARTS_AT_LABEL}</Label>
                    <Input
                      id="starts"
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ends">{UI_MESSAGES.SUBSCRIPTION.ENDS_AT_LABEL}</Label>
                    <Input
                      id="ends"
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payment">
                      {UI_MESSAGES.SUBSCRIPTION.PAYMENT_STATUS_LABEL}
                    </Label>
                    <select
                      id="payment"
                      className={selectClass}
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
                    <Label htmlFor="amount">{UI_MESSAGES.SUBSCRIPTION.AMOUNT_LABEL} (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min={0}
                      step="0.01"
                      value={amountMajor}
                      onChange={(e) => setAmountMajor(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="notes">{UI_MESSAGES.SUBSCRIPTION.NOTES_LABEL}</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {UI_MESSAGES.COMMON.CANCEL}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !view?.subscription}>
            {loading ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.COMMON.SAVE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
