'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, TriangleAlert, Users, XCircle } from 'lucide-react';
import { CHART_HEIGHT, CHART_INK, STATUS_COLOR, UI_MESSAGES } from '@/constants';
import {
  formatBucketLabel,
  formatBucketTick,
  formatCompact,
  formatCount,
  formatDecimal,
  formatPercent,
} from '@/lib/analytics';
import { formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChartTooltip } from './ChartTooltip';
import { DistributionList } from './DistributionList';
import { MetricCard } from './MetricCard';
import type { AnalyticsBreakdownRow, AnalyticsFailures } from '@/types';

interface FailuresPanelProps {
  data: AnalyticsFailures;
}

const toItems = (rows: AnalyticsBreakdownRow[], prefix: string) =>
  rows.map((row, index) => ({
    id: row.id ?? `${prefix}-${index}`,
    label: row.label ?? '',
    hint: row.company_name,
    value: row.count,
    share: row.share,
    color: STATUS_COLOR.failed,
  }));

/**
 * What failed, why, and what is still outstanding.
 *
 * The failure COUNT and the failure RATE are both here, because neither is
 * enough alone: a tenant that doubled its volume and kept its rate flat has
 * twice the failures and no problem, and reading only the count would start an
 * investigation into nothing.
 *
 * They get two stacked charts sharing one x-axis rather than one chart with two
 * y-scales. A dual axis lets whoever picks the two scales decide where the
 * lines appear to cross, and the reader sees a correlation that was chosen
 * rather than measured.
 */
export function FailuresPanel({ data }: FailuresPanelProps) {
  const granularity = data.range.granularity;
  const tickProps = {
    fontSize: 11,
    stroke: CHART_INK.AXIS,
    tickLine: false,
    axisLine: false,
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{UI_MESSAGES.ANALYTICS.FAILURES_SCOPE_HINT}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.FAILED_MESSAGES}
          value={formatCount(data.summary.total)}
          hint={`${formatDecimal(data.summary.per_day)} per day`}
          higherIsBetter={false}
          icon={XCircle}
          accent={data.summary.total > 0 ? 'destructive' : 'muted'}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.UNHANDLED}
          value={formatCount(data.summary.unhandled)}
          hint={UI_MESSAGES.ANALYTICS.OUTSTANDING_HINT}
          higherIsBetter={false}
          icon={TriangleAlert}
          accent={data.summary.unhandled > 0 ? 'warning' : 'muted'}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.HANDLED_RATE}
          value={formatPercent(data.summary.handled_rate)}
          hint={`${formatCount(data.summary.handled)} ${UI_MESSAGES.ANALYTICS.HANDLED.toLowerCase()}`}
          icon={CheckCircle2}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.COMPANIES_AFFECTED}
          value={formatCount(data.summary.companies_affected)}
          hint={`${formatCount(data.summary.recipients_affected)} recipients`}
          higherIsBetter={false}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.FAILURE_TREND}</CardTitle>
          <CardDescription>{UI_MESSAGES.ANALYTICS.FAILURE_RATE_HINT}</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: CHART_HEIGHT.DEFAULT }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(value) => formatBucketTick(String(value), granularity)}
                  minTickGap={24}
                  {...tickProps}
                />
                <YAxis
                  tickFormatter={(value) => formatCompact(Number(value))}
                  width={44}
                  {...tickProps}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={
                    <ChartTooltip
                      title={(datum) => formatBucketLabel(String(datum.bucket), granularity)}
                      rows={(datum) => [
                        {
                          name: UI_MESSAGES.ANALYTICS.FAILED_MESSAGES,
                          value: Number(datum.failed ?? 0),
                          color: STATUS_COLOR.failed,
                        },
                        {
                          name: UI_MESSAGES.ANALYTICS.UNHANDLED,
                          value: Number(datum.unhandled ?? 0),
                          color: STATUS_COLOR.queued,
                        },
                        {
                          name: UI_MESSAGES.ANALYTICS.FAILURE_RATE,
                          value: null,
                          display: formatPercent(datum.failure_rate as number | null),
                        },
                      ]}
                      footer={(datum) =>
                        `${UI_MESSAGES.ANALYTICS.STACK_TOTAL}: ${formatCount(Number(datum.total ?? 0))}`
                      }
                    />
                  }
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar
                  dataKey="failed"
                  name={UI_MESSAGES.ANALYTICS.FAILED_MESSAGES}
                  fill={STATUS_COLOR.failed}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="unhandled"
                  name={UI_MESSAGES.ANALYTICS.UNHANDLED}
                  fill={STATUS_COLOR.queued}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* The rate gets its own plot under the counts, sharing the x-axis.
              A second y-scale on the chart above would let the choice of scale
              decide where the two series appear to cross. */}
          <div className="mt-2" style={{ height: CHART_HEIGHT.COMPACT }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(value) => formatBucketTick(String(value), granularity)}
                  minTickGap={24}
                  {...tickProps}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  width={44}
                  {...tickProps}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      title={(datum) => formatBucketLabel(String(datum.bucket), granularity)}
                      rows={(datum) => [
                        {
                          name: UI_MESSAGES.ANALYTICS.FAILURE_RATE,
                          value: null,
                          display: formatPercent(datum.failure_rate as number | null),
                          color: STATUS_COLOR.failed,
                        },
                      ]}
                      footer={(datum) =>
                        `${formatCount(Number(datum.failed ?? 0))} of ${formatCount(Number(datum.total ?? 0))}`
                      }
                    />
                  }
                />
                {/* One series: the card title names it, so no legend box. */}
                <Line
                  type="monotone"
                  dataKey="failure_rate"
                  name={UI_MESSAGES.ANALYTICS.FAILURE_RATE}
                  stroke={STATUS_COLOR.failed}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.BY_ERROR_CODE}</CardTitle>
          <CardDescription>{UI_MESSAGES.ANALYTICS.FAILURES_TITLE}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{UI_MESSAGES.ANALYTICS.ERROR_CODE}</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">
                    {UI_MESSAGES.ANALYTICS.FAILED_MESSAGES}
                  </TableHead>
                  <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.UNHANDLED}</TableHead>
                  <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.SHARE}</TableHead>
                  <TableHead className="text-right">
                    {UI_MESSAGES.ANALYTICS.COMPANIES_AFFECTED}
                  </TableHead>
                  <TableHead>{UI_MESSAGES.ANALYTICS.LAST_SEEN}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.by_code.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      {UI_MESSAGES.COMMON.EMPTY}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.by_code.map((row) => (
                    <TableRow key={`${row.code}-${row.label}`}>
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                      <TableCell className="max-w-[26rem]">{row.label}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCount(row.count)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(row.unhandled)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatPercent(row.share)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatCount(row.companies)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(row.last_seen_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.TOP_COMPANIES}
          items={toItems(data.by_company, 'company')}
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.TOP_TEMPLATES}
          items={toItems(data.by_template, 'template')}
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.TOP_NUMBERS}
          items={toItems(data.by_phone_number, 'phone')}
        />
      </div>
    </div>
  );
}
