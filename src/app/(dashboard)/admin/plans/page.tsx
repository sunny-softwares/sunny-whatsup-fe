'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminSubscriptionApi } from '@/lib/api/adminSubscription.api';
import { pickErrorMessage } from '@/lib/utils';
import {
  BILLING_CYCLE,
  COMPANY_FEATURE_META,
  COMPANY_FEATURE_VALUES,
  UI_MESSAGES,
  formatAmountMinor,
} from '@/constants';
import type { Plan } from '@/types';

/**
 * Plan catalogue management.
 *
 * Everything on this page is DB state: flipping "Purchasable" is how a
 * coming-soon plan goes on sale, and editing a price only affects future
 * purchases — every existing billing cycle snapshotted its own amount.
 */
function PlanEditor({ plan, onSaved }: { plan: Plan; onSaved: () => void }) {
  const priceFor = (cycle: string) =>
    (plan.prices ?? []).find((p) => p.billing_cycle === cycle)?.amount_minor ?? 0;

  // Prices are edited in rupees and converted to paise on save.
  const [monthly, setMonthly] = useState(String(priceFor(BILLING_CYCLE.MONTHLY) / 100));
  const [yearly, setYearly] = useState(String(priceFor(BILLING_CYCLE.YEARLY) / 100));
  const [trialDays, setTrialDays] = useState(String(plan.trial_days));
  const [graceDays, setGraceDays] = useState(String(plan.grace_days));
  const [isPurchasable, setIsPurchasable] = useState(plan.is_purchasable);
  const [isComingSoon, setIsComingSoon] = useState(plan.is_coming_soon);
  // Defensive: the API is typed as always sending this, but a shape drift here
  // should degrade to "nothing ticked" rather than crash the whole page.
  const [featureKeys, setFeatureKeys] = useState<string[]>(plan.feature_keys ?? []);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggleFeature = (key: string) =>
    setFeatureKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await adminSubscriptionApi.updatePlan(plan.id, {
        trial_days: Number(trialDays),
        grace_days: Number(graceDays),
        is_purchasable: isPurchasable,
        is_coming_soon: isComingSoon,
      });
      await adminSubscriptionApi.setPlanPrices(plan.id, [
        { billing_cycle: BILLING_CYCLE.MONTHLY, amount_minor: Math.round(Number(monthly) * 100) },
        { billing_cycle: BILLING_CYCLE.YEARLY, amount_minor: Math.round(Number(yearly) * 100) },
      ]);
      await adminSubscriptionApi.setPlanFeatures(plan.id, featureKeys);
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            {plan.description ? <CardDescription>{plan.description}</CardDescription> : null}
          </div>
          <div className="flex gap-2">
            {plan.is_coming_soon ? (
              <Badge variant="secondary">{UI_MESSAGES.SUBSCRIPTION.COMING_SOON_BADGE}</Badge>
            ) : null}
            <Badge variant={plan.is_purchasable ? 'success' : 'muted'}>
              {plan.is_purchasable ? 'On sale' : 'Not for sale'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${plan.id}-monthly`}>
              {UI_MESSAGES.SUBSCRIPTION.MONTHLY_PRICE_LABEL}
            </Label>
            <Input
              id={`${plan.id}-monthly`}
              type="number"
              min={0}
              step="1"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {formatAmountMinor(Math.round(Number(monthly) * 100))}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${plan.id}-yearly`}>
              {UI_MESSAGES.SUBSCRIPTION.YEARLY_PRICE_LABEL}
            </Label>
            <Input
              id={`${plan.id}-yearly`}
              type="number"
              min={0}
              step="1"
              value={yearly}
              onChange={(e) => setYearly(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {formatAmountMinor(Math.round(Number(yearly) * 100))}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${plan.id}-trial`}>{UI_MESSAGES.SUBSCRIPTION.TRIAL_DAYS_LABEL}</Label>
            <Input
              id={`${plan.id}-trial`}
              type="number"
              min={0}
              max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${plan.id}-grace`}>{UI_MESSAGES.SUBSCRIPTION.GRACE_DAYS_LABEL}</Label>
            <Input
              id={`${plan.id}-grace`}
              type="number"
              min={0}
              max={365}
              value={graceDays}
              onChange={(e) => setGraceDays(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isPurchasable}
              onChange={(e) => setIsPurchasable(e.target.checked)}
            />
            {UI_MESSAGES.SUBSCRIPTION.PURCHASABLE_LABEL}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isComingSoon} onChange={(e) => setIsComingSoon(e.target.checked)} />
            {UI_MESSAGES.SUBSCRIPTION.COMING_SOON_LABEL}
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Features granted by this plan</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANY_FEATURE_VALUES.map((key) => (
              <label key={key} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={featureKeys.includes(key)}
                  onChange={() => toggleFeature(key)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block">{COMPANY_FEATURE_META[key].label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {COMPANY_FEATURE_META[key].description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {saved ? <p className="text-sm text-primary">{UI_MESSAGES.COMMON.SUCCESS}</p> : null}

        <div className="flex justify-end border-t pt-4">
          <Button onClick={handleSave} disabled={busy}>
            {busy ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.SUBSCRIPTION.SAVE_PLAN}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminSubscriptionApi.listPlans();
      setPlans(res.data);
      setError(null);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={UI_MESSAGES.SUBSCRIPTION.PLANS_TITLE}
        description={UI_MESSAGES.SUBSCRIPTION.PLANS_SUBTITLE}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            // Keyed so editing a plan and reloading re-seeds the local form state
            // from the server rather than keeping stale inputs.
            <PlanEditor key={`${plan.id}-${plan.is_purchasable}`} plan={plan} onSaved={load} />
          ))}
        </div>
      )}
    </div>
  );
}
