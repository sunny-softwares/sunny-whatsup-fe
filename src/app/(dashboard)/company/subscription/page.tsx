'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BillingCycleToggle } from '@/components/subscription/BillingCycleToggle';
import { PlanCard } from '@/components/subscription/PlanCard';
import { PaymentHistoryTable } from '@/components/subscription/PaymentHistoryTable';
import { SubscriptionSummaryCard } from '@/components/subscription/SubscriptionSummaryCard';
import { subscriptionApi } from '@/lib/api/subscription.api';
import { pickErrorMessage } from '@/lib/utils';
import { useSubscriptionStore } from '@/store/subscription.store';
import {
  BILLING_CYCLE,
  RAZORPAY_MODE,
  UI_MESSAGES,
  yearlySavingPercent,
  type BillingCycle,
} from '@/constants';
import type { CompanySubscriptionView, Payment } from '@/types';

export default function CompanySubscriptionPage() {
  const [view, setView] = useState<CompanySubscriptionView | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BILLING_CYCLE.YEARLY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [interested, setInterested] = useState<string[]>([]);
  const [interestBusy, setInterestBusy] = useState(false);

  const setStoreView = useSubscriptionStore((s) => s.load);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, payRes] = await Promise.all([
        subscriptionApi.get(),
        subscriptionApi.listPayments({ pageSize: 20 }),
      ]);
      setView(subRes.data);
      setPayments(payRes.data);
      setError(null);
      // Default the toggle to whatever they are actually on.
      if (subRes.data.current_period?.billing_cycle) {
        setBillingCycle(subRes.data.current_period.billing_cycle);
      }
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Yearly saving is computed from the live prices of the FIRST purchasable
  // plan, so it tracks whatever the super admin has configured rather than
  // asserting a fixed discount.
  const savingPercent = useMemo(() => {
    const plan = view?.plans.find((p) => p.is_purchasable);
    if (!plan) return null;
    const monthly = plan.prices.find((p) => p.billing_cycle === BILLING_CYCLE.MONTHLY);
    const yearly = plan.prices.find((p) => p.billing_cycle === BILLING_CYCLE.YEARLY);
    return yearlySavingPercent(monthly?.amount_minor, yearly?.amount_minor);
  }, [view?.plans]);

  const currentPlanId = view?.current_period?.plan_id ?? view?.subscription?.plan_id ?? null;

  const handlePaymentSuccess = useCallback(async () => {
    setNotice(UI_MESSAGES.SUBSCRIPTION.PAYMENT_SUCCESS);
    setError(null);
    await load();
    // Refresh the store so the banner reflects the new state immediately rather
    // than waiting for the next API call to carry an updated notice.
    await setStoreView();
  }, [load, setStoreView]);

  const handleCancel = async () => {
    setBusy(true);
    try {
      await subscriptionApi.cancel();
      setNotice(null);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
      setCancelOpen(false);
    }
  };

  const handleResume = async () => {
    setBusy(true);
    try {
      await subscriptionApi.resume();
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const handleRegisterInterest = async (planKey: string) => {
    setInterestBusy(true);
    try {
      await subscriptionApi.registerInterest({ plan_key: planKey });
      setInterested((prev) => (prev.includes(planKey) ? prev : [...prev, planKey]));
      setNotice(UI_MESSAGES.SUBSCRIPTION.NOTIFY_ME_DONE);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setInterestBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={UI_MESSAGES.SUBSCRIPTION.TITLE}
        description={UI_MESSAGES.SUBSCRIPTION.SUBTITLE}
      />

      {/* Makes it impossible to mistake a test payment for a real one. */}
      {view?.payment.mode === RAZORPAY_MODE.TEST ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {UI_MESSAGES.SUBSCRIPTION.TEST_MODE_BANNER}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="text-sm text-primary">{notice}</p> : null}

      {loading ? (
        <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
      ) : !view ? (
        <p className="text-muted-foreground">{UI_MESSAGES.SUBSCRIPTION.NO_SUBSCRIPTION}</p>
      ) : (
        <>
          <SubscriptionSummaryCard
            view={view}
            busy={busy}
            onCancel={() => setCancelOpen(true)}
            onResume={handleResume}
          />

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{UI_MESSAGES.SUBSCRIPTION.CHOOSE_PLAN}</h2>
              <BillingCycleToggle
                value={billingCycle}
                onChange={setBillingCycle}
                savingPercent={savingPercent}
                disabled={busy}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {view.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  isCurrent={plan.id === currentPlanId}
                  isTrialing={view.current_period?.is_trial === true}
                  paymentEnabled={view.payment.enabled}
                  interestRegistered={interested.includes(plan.key)}
                  interestBusy={interestBusy}
                  onRegisterInterest={handleRegisterInterest}
                  onSuccess={handlePaymentSuccess}
                  onError={(message) => {
                    setNotice(null);
                    setError(message);
                  }}
                  onCancelled={() => setNotice(UI_MESSAGES.SUBSCRIPTION.CHECKOUT_CANCELLED)}
                />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {UI_MESSAGES.SUBSCRIPTION.PAYMENT_HISTORY_TITLE}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <PaymentHistoryTable payments={payments} />
            </CardContent>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={UI_MESSAGES.SUBSCRIPTION.CANCEL_TITLE}
        description={UI_MESSAGES.SUBSCRIPTION.CANCEL_CONFIRM}
        confirmLabel={UI_MESSAGES.SUBSCRIPTION.CANCEL_BUTTON}
        destructive
        loading={busy}
        onConfirm={handleCancel}
      />
    </div>
  );
}
