'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, CalendarClock, CreditCard, IndianRupee, Users, XCircle } from 'lucide-react';
import {
  CATEGORICAL_COLORS,
  CHART_HEIGHT,
  CHART_INK,
  UI_MESSAGES,
  formatAmountMinor,
} from '@/constants';
import {
  formatBucketLabel,
  formatBucketTick,
  formatCount,
  formatPercent,
} from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChartTooltip } from './ChartTooltip';
import { DistributionList, type DistributionItem } from './DistributionList';
import { MetricCard } from './MetricCard';
import type { AnalyticsRevenue, AnalyticsRevenueRow } from '@/types';

interface RevenuePanelProps {
  data: AnalyticsRevenue;
  paymentMode: string;
  onPaymentModeChange: (value: string) => void;
  modeOptions: string[];
}

const titleCase = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Money captured in the window, and the state of the subscription book.
 *
 * Amounts stay in MINOR units until the moment they are printed. Converting to
 * rupees early and summing floats is how a paise goes missing between the chart
 * and the tile beside it.
 */
export function RevenuePanel({
  data,
  paymentMode,
  onPaymentModeChange,
  modeOptions,
}: RevenuePanelProps) {
  const currency = data.primary_currency ?? undefined;
  const money = (minor: number | null | undefined) =>
    minor === null || minor === undefined ? '—' : formatAmountMinor(minor, currency);

  const granularity = data.range.granularity;
  const tickProps = {
    fontSize: 11,
    stroke: CHART_INK.AXIS,
    tickLine: false,
    axisLine: false,
  };

  const toMoneyItems = (rows: AnalyticsRevenueRow[], prefix: string): DistributionItem[] =>
    rows.map((row, index) => ({
      id: row.id ?? row.key ?? `${prefix}-${index}`,
      label: row.label ?? (row.key ? titleCase(row.key) : ''),
      hint: `${formatCount(row.payments ?? row.count ?? 0)} payments`,
      value: row.captured_minor,
      share: row.share ?? null,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="payment-mode">{UI_MESSAGES.ANALYTICS.PAYMENT_MODE_LABEL}</Label>
          <select
            id="payment-mode"
            value={paymentMode}
            onChange={(e) => onPaymentModeChange(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{UI_MESSAGES.ANALYTICS.ALL_MODES}</option>
            {modeOptions.map((mode) => (
              <option key={mode} value={mode}>
                {titleCase(mode)}
              </option>
            ))}
          </select>
        </div>
        <p className="pb-2.5 text-sm text-muted-foreground">{UI_MESSAGES.ANALYTICS.REVENUE_HINT}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.CAPTURED}
          value={money(data.totals.captured_minor)}
          hint={`${formatCount(data.totals.payments)} ${UI_MESSAGES.ANALYTICS.PAYMENTS.toLowerCase()}`}
          delta={data.deltas?.captured_minor}
          icon={IndianRupee}
          accent="success"
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.NET}
          value={money(data.totals.net_minor)}
          hint={`${money(data.totals.refunded_minor)} ${UI_MESSAGES.ANALYTICS.REFUNDED.toLowerCase()}`}
          icon={CreditCard}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.ARPU}
          value={money(data.totals.arpu_minor)}
          hint={`${formatCount(data.totals.paying_companies)} ${UI_MESSAGES.ANALYTICS.PAYING_COMPANIES.toLowerCase()}`}
          icon={Users}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.REVENUE_PER_DAY}
          value={money(data.totals.revenue_per_day_minor)}
          hint={`${UI_MESSAGES.ANALYTICS.AVERAGE_PAYMENT}: ${money(data.totals.average_payment_minor)}`}
          icon={IndianRupee}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.FAILED_PAYMENTS}
          value={formatCount(data.totals.failed_payments)}
          higherIsBetter={false}
          icon={XCircle}
          accent={data.totals.failed_payments > 0 ? 'destructive' : 'muted'}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.EXPIRING_SOON(data.subscriptions.expiring_within_days)}
          value={formatCount(data.subscriptions.expiring_soon)}
          hint={UI_MESSAGES.ANALYTICS.SUBSCRIPTION_BOOK_HINT}
          icon={CalendarClock}
          accent={data.subscriptions.expiring_soon > 0 ? 'warning' : 'muted'}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.OVERDUE}
          value={formatCount(data.subscriptions.overdue)}
          hint={UI_MESSAGES.ANALYTICS.SUBSCRIPTION_BOOK_HINT}
          higherIsBetter={false}
          icon={AlertTriangle}
          accent={data.subscriptions.overdue > 0 ? 'destructive' : 'muted'}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.PAYMENTS}
          value={formatCount(data.totals.payments)}
          delta={data.deltas?.payments}
          icon={CreditCard}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.REVENUE_TITLE}</CardTitle>
          <CardDescription>
            {UI_MESSAGES.ANALYTICS.CAPTURED}
            {currency ? ` · ${currency}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: CHART_HEIGHT.DEFAULT }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_bucket} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(value) => formatBucketTick(String(value), granularity)}
                  minTickGap={24}
                  {...tickProps}
                />
                {/* Ticks are formatted as money, so the axis never shows a bare
                    minor-unit figure that reads as 100× the real amount. */}
                <YAxis
                  tickFormatter={(value) => formatAmountMinor(Number(value), currency)}
                  width={80}
                  {...tickProps}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={
                    <ChartTooltip
                      title={(datum) => formatBucketLabel(String(datum.bucket), granularity)}
                      rows={(datum) => [
                        {
                          name: UI_MESSAGES.ANALYTICS.CAPTURED,
                          value: null,
                          display: money(Number(datum.captured_minor ?? 0)),
                          color: CATEGORICAL_COLORS[0],
                        },
                        {
                          name: UI_MESSAGES.ANALYTICS.REFUNDED,
                          value: null,
                          display: money(Number(datum.refunded_minor ?? 0)),
                        },
                        {
                          name: UI_MESSAGES.ANALYTICS.PAYMENTS,
                          value: Number(datum.payments ?? 0),
                        },
                      ]}
                      footer={(datum) =>
                        `${formatCount(Number(datum.companies ?? 0))} ${UI_MESSAGES.ANALYTICS.PAYING_COMPANIES.toLowerCase()}`
                      }
                    />
                  }
                />
                <Bar
                  dataKey="captured_minor"
                  name={UI_MESSAGES.ANALYTICS.CAPTURED}
                  fill={CATEGORICAL_COLORS[0]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.BY_PLAN}
          items={toMoneyItems(data.by_plan, 'plan')}
          colorful
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.TOP_PAYERS}
          items={toMoneyItems(data.top_payers, 'payer')}
          colorful
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.BY_METHOD}
          items={toMoneyItems(data.by_method, 'method')}
          colorful
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.BY_CYCLE}
          items={toMoneyItems(data.by_billing_cycle, 'cycle')}
          colorful
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.SUBSCRIPTION_BOOK}</CardTitle>
          <CardDescription>{UI_MESSAGES.ANALYTICS.SUBSCRIPTION_BOOK_HINT}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {UI_MESSAGES.ANALYTICS.BY_PLAN}
            </p>
            <dl className="space-y-1.5 text-sm">
              {data.subscriptions.by_plan.map((row) => (
                <div key={row.plan_key ?? row.label} className="flex justify-between gap-3">
                  <dt className="truncate">{row.label}</dt>
                  <dd className="shrink-0 tabular-nums">
                    {formatCount(row.count)}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatPercent(row.share)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {UI_MESSAGES.ANALYTICS.CYCLES_BY_PAYMENT}
            </p>
            <dl className="space-y-1.5 text-sm">
              {data.subscriptions.periods_by_payment_status.map((row) => (
                <div key={row.key} className="flex justify-between gap-3">
                  <dt>{titleCase(row.key ?? '')}</dt>
                  <dd className="tabular-nums">{formatCount(row.count)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {UI_MESSAGES.ANALYTICS.CYCLES_BY_SOURCE}
            </p>
            <dl className="space-y-1.5 text-sm">
              {data.subscriptions.periods_by_source.map((row) => (
                <div key={row.key} className="flex justify-between gap-3">
                  <dt>{titleCase(row.key ?? '')}</dt>
                  <dd className="tabular-nums">{formatCount(row.count)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </CardContent>
      </Card>

      <DistributionList
        title={UI_MESSAGES.ANALYTICS.BY_MODE}
        description={UI_MESSAGES.ANALYTICS.BY_MODE_HINT}
        items={toMoneyItems(data.by_mode, 'mode')}
        colorful
      />
    </div>
  );
}
