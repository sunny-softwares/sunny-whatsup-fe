'use client';

import {
  Building2,
  CalendarCheck,
  CheckCheck,
  Eye,
  Gauge,
  MessageSquare,
  Send,
  TriangleAlert,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER, UI_MESSAGES } from '@/constants';
import {
  formatCount,
  formatDecimal,
  formatPercent,
  formatRangeLabel,
} from '@/lib/analytics';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { DistributionList } from './DistributionList';
import type { AnalyticsOverview } from '@/types';

interface OverviewPanelProps {
  data: AnalyticsOverview;
}

/**
 * The headline panel: what happened in the window, and how that compares.
 *
 * Every rate tile states its denominator in the hint. Delivery rate against
 * ACCEPTED messages and failure rate against EVERYTHING attempted are different
 * bases, and a reader who assumes they share one will reach the wrong
 * conclusion about a tenant.
 */
export function OverviewPanel({ data }: OverviewPanelProps) {
  const { messages, averages, deltas, range, comparison, growth, snapshot, peak } = data;
  const elapsed = range.elapsed_days ?? range.days ?? 1;

  return (
    <div className="space-y-6">
      {comparison ? (
        <p className="text-sm text-muted-foreground">
          {UI_MESSAGES.ANALYTICS.COMPARED_TO(formatRangeLabel(comparison))}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{UI_MESSAGES.ANALYTICS.NO_COMPARISON}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.TOTAL_MESSAGES}
          value={formatCount(messages.total)}
          hint={formatRangeLabel(range)}
          delta={deltas?.total}
          icon={MessageSquare}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.AVG_PER_DAY}
          value={formatDecimal(averages.per_day)}
          hint={UI_MESSAGES.ANALYTICS.AVG_PER_DAY_HINT(elapsed)}
          delta={deltas?.avg_per_day}
          icon={Gauge}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.AVG_PER_ACTIVE_DAY}
          value={formatDecimal(averages.per_active_day)}
          hint={UI_MESSAGES.ANALYTICS.AVG_PER_ACTIVE_DAY_HINT(messages.active_days)}
          icon={CalendarCheck}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.AVG_PER_COMPANY}
          value={formatDecimal(averages.per_company)}
          hint={`${formatCount(messages.active_companies)} ${UI_MESSAGES.ANALYTICS.ACTIVE_COMPANIES.toLowerCase()}`}
          icon={Building2}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.ACCEPTED}
          value={formatCount(messages.accepted)}
          hint={UI_MESSAGES.ANALYTICS.ACCEPTED_HINT}
          delta={deltas?.accepted}
          icon={Send}
          accent="success"
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.DELIVERY_RATE}
          value={formatPercent(messages.delivery_rate)}
          hint={UI_MESSAGES.ANALYTICS.DELIVERY_RATE_HINT}
          delta={deltas?.delivery_rate}
          icon={CheckCheck}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.READ_RATE}
          value={formatPercent(messages.read_rate)}
          hint={UI_MESSAGES.ANALYTICS.READ_RATE_HINT}
          delta={deltas?.read_rate}
          icon={Eye}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.FAILURE_RATE}
          value={formatPercent(messages.failure_rate)}
          hint={UI_MESSAGES.ANALYTICS.FAILURE_RATE_HINT}
          delta={deltas?.failure_rate}
          // A rising failure rate is bad news, so the delta chip must not go
          // green for it.
          higherIsBetter={false}
          icon={XCircle}
          accent={messages.failure_rate ? 'destructive' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.OUTSTANDING_FAILURES}
          value={formatCount(messages.failed_unhandled)}
          hint={UI_MESSAGES.ANALYTICS.OUTSTANDING_HINT}
          higherIsBetter={false}
          icon={TriangleAlert}
          accent={messages.failed_unhandled > 0 ? 'warning' : 'muted'}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.UNIQUE_RECIPIENTS}
          value={formatCount(messages.unique_recipients)}
          delta={deltas?.unique_recipients}
          icon={Users}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.PEAK_DAY}
          value={peak ? formatCount(peak.count) : UI_MESSAGES.ANALYTICS.STACK_TOTAL}
          hint={peak ? formatDate(peak.day) : undefined}
          icon={Gauge}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.NEW_COMPANIES}
          value={formatCount(growth.companies)}
          hint={`${formatCount(growth.users)} ${UI_MESSAGES.ANALYTICS.NEW_USERS.toLowerCase()}`}
          delta={deltas?.new_companies}
          icon={UserPlus}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.BY_STATUS}
          description={UI_MESSAGES.ANALYTICS.FAILURE_RATE_HINT}
          items={STATUS_ORDER.map((status) => ({
            id: status,
            label: STATUS_LABEL[status],
            value: messages[status],
            share: messages.total ? (messages[status] / messages.total) * 100 : null,
            color: STATUS_COLOR[status],
          }))}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {UI_MESSAGES.ANALYTICS.PLATFORM_SNAPSHOT}
            </CardTitle>
            <CardDescription>{UI_MESSAGES.ANALYTICS.PLATFORM_SNAPSHOT_HINT}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              {[
                ['Companies', snapshot.companies.total],
                ['Active', snapshot.companies.active],
                ['With a WABA', snapshot.companies.with_connected_waba],
                ['Users', snapshot.users.total],
                ['Connected WABAs', snapshot.waba_accounts.connected],
                ['Phone numbers', snapshot.phone_numbers.total],
                ['Templates', snapshot.templates.total],
                ['Subscriptions', snapshot.subscriptions.total],
                ['Messages (all time)', snapshot.messages.total],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-semibold tabular-nums">{formatCount(Number(value))}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
