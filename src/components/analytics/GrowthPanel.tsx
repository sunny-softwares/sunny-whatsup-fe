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
import {
  CATEGORICAL_COLORS,
  CHART_HEIGHT,
  CHART_INK,
  UI_MESSAGES,
} from '@/constants';
import {
  formatBucketLabel,
  formatBucketTick,
  formatCompact,
  formatDecimal,
} from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip } from './ChartTooltip';
import { MetricCard } from './MetricCard';
import type { AnalyticsGrowth } from '@/types';

interface GrowthPanelProps {
  data: AnalyticsGrowth;
}

// Fixed slots, assigned by position and never cycled, so a series keeps its
// colour whatever else is on the chart.
const SERIES = [
  { key: 'new_companies', label: 'Companies', color: CATEGORICAL_COLORS[0] },
  { key: 'approved_companies', label: 'Approvals', color: CATEGORICAL_COLORS[1] },
  { key: 'new_users', label: 'Users', color: CATEGORICAL_COLORS[2] },
  { key: 'new_waba_accounts', label: 'WABA accounts', color: CATEGORICAL_COLORS[3] },
  { key: 'new_templates', label: 'Templates', color: CATEGORICAL_COLORS[4] },
] as const;

const CUMULATIVE = [
  { key: 'cumulative_companies', label: 'Companies', color: CATEGORICAL_COLORS[0] },
  { key: 'cumulative_users', label: 'Users', color: CATEGORICAL_COLORS[2] },
  { key: 'cumulative_waba_accounts', label: 'WABA accounts', color: CATEGORICAL_COLORS[3] },
  { key: 'cumulative_templates', label: 'Templates', color: CATEGORICAL_COLORS[4] },
] as const;

/** Signups and activations over the window, as additions and as running totals. */
export function GrowthPanel({ data }: GrowthPanelProps) {
  const granularity = data.range.granularity;
  const tickProps = {
    fontSize: 11,
    stroke: CHART_INK.AXIS,
    tickLine: false,
    axisLine: false,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.NEW_COMPANIES}
          value={String(data.totals.companies)}
          hint={`${formatDecimal(data.averages.companies_per_day)} per day`}
        />
        <MetricCard
          label={UI_MESSAGES.ANALYTICS.NEW_USERS}
          value={String(data.totals.users)}
          hint={`${formatDecimal(data.averages.users_per_day)} per day`}
        />
        <MetricCard label="New WABA accounts" value={String(data.totals.waba_accounts)} />
        <MetricCard
          label="New templates"
          value={String(data.totals.templates)}
          hint={`${formatDecimal(data.averages.templates_per_day)} per day`}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.GROWTH_TITLE}</CardTitle>
          <CardDescription>{UI_MESSAGES.ANALYTICS.GROWTH_HINT}</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: CHART_HEIGHT.DEFAULT }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.buckets} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(value) => formatBucketTick(String(value), granularity)}
                  minTickGap={24}
                  {...tickProps}
                />
                <YAxis
                  allowDecimals={false}
                  tickFormatter={(value) => formatCompact(Number(value))}
                  width={44}
                  {...tickProps}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={
                    <ChartTooltip
                      title={(datum) => formatBucketLabel(String(datum.bucket), granularity)}
                      rows={(datum) =>
                        SERIES.map((series) => ({
                          name: series.label,
                          value: Number(datum[series.key] ?? 0),
                          color: series.color,
                        }))
                      }
                    />
                  }
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {SERIES.map((series) => (
                  <Bar
                    key={series.key}
                    dataKey={series.key}
                    name={series.label}
                    fill={series.color}
                    radius={[3, 3, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.CUMULATIVE_TITLE}</CardTitle>
          <CardDescription>{UI_MESSAGES.ANALYTICS.CUMULATIVE_HINT}</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: CHART_HEIGHT.DEFAULT }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.buckets} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(value) => formatBucketTick(String(value), granularity)}
                  minTickGap={24}
                  {...tickProps}
                />
                <YAxis
                  allowDecimals={false}
                  tickFormatter={(value) => formatCompact(Number(value))}
                  width={44}
                  {...tickProps}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      title={(datum) => formatBucketLabel(String(datum.bucket), granularity)}
                      rows={(datum) =>
                        CUMULATIVE.map((series) => ({
                          name: series.label,
                          value: Number(datum[series.key] ?? 0),
                          color: series.color,
                        }))
                      }
                    />
                  }
                />
                <Legend iconType="line" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {CUMULATIVE.map((series) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
