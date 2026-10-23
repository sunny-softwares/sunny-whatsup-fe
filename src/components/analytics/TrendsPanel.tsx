'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
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
  CHART_HEIGHT,
  CHART_INK,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_ORDER,
  UI_MESSAGES,
} from '@/constants';
import {
  formatBucketLabel,
  formatBucketTick,
  formatCompact,
  formatCount,
  formatPercent,
  formatRangeLabel,
} from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip } from './ChartTooltip';
import type { AnalyticsTimeseries } from '@/types';

interface TrendsPanelProps {
  data: AnalyticsTimeseries;
}

/**
 * Message volume over time.
 *
 * Three charts, each answering one question, because a single chart carrying
 * volume AND rates would need two y-scales — and a dual-axis chart lets the
 * reader "see" a correlation that is an artefact of where the two scales
 * happened to be pinned.
 */
export function TrendsPanel({ data }: TrendsPanelProps) {
  const granularity = data.range.granularity;

  // The comparison window is aligned by POSITION, not by date: its bucket N is
  // folded onto this window's bucket N so the two overlay as one series pair.
  const comparisonSeries = useMemo(
    () =>
      data.buckets.map((bucket, index) => ({
        ...bucket,
        previous_total: data.previous_buckets?.[index]?.total ?? null,
        previous_bucket: data.previous_buckets?.[index]?.bucket ?? null,
      })),
    [data.buckets, data.previous_buckets],
  );

  const tickProps = {
    fontSize: 11,
    stroke: CHART_INK.AXIS,
    tickLine: false,
    axisLine: false,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.TREND_TITLE}</CardTitle>
          <CardDescription>{UI_MESSAGES.ANALYTICS.TREND_HINT}</CardDescription>
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
                <YAxis tickFormatter={(value) => formatCompact(Number(value))} width={48} {...tickProps} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={
                    <ChartTooltip
                      title={(datum) => formatBucketLabel(String(datum.bucket), granularity)}
                      rows={(datum) =>
                        STATUS_ORDER.map((status) => ({
                          name: STATUS_LABEL[status],
                          value: Number(datum[status] ?? 0),
                          color: STATUS_COLOR[status],
                        }))
                      }
                      footer={(datum) =>
                        `${UI_MESSAGES.ANALYTICS.STACK_TOTAL}: ${formatCount(Number(datum.total ?? 0))}`
                      }
                    />
                  }
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {STATUS_ORDER.map((status, index) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    name={STATUS_LABEL[status]}
                    stackId="messages"
                    fill={STATUS_COLOR[status]}
                    // A hairline of the card surface between stacked segments,
                    // so two adjacent colours never read as one block.
                    stroke={CHART_INK.SURFACE}
                    strokeWidth={1}
                    radius={index === STATUS_ORDER.length - 1 ? [4, 4, 0, 0] : undefined}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {data.previous_buckets ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.COMPARISON_TITLE}</CardTitle>
            <CardDescription>
              {UI_MESSAGES.ANALYTICS.COMPARISON_HINT} · {formatRangeLabel(data.comparison)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: CHART_HEIGHT.DEFAULT }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={comparisonSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="currentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={STATUS_COLOR.read} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={STATUS_COLOR.read} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                  <XAxis
                    dataKey="bucket"
                    tickFormatter={(value) => formatBucketTick(String(value), granularity)}
                    minTickGap={24}
                    {...tickProps}
                  />
                  <YAxis tickFormatter={(value) => formatCompact(Number(value))} width={48} {...tickProps} />
                  <Tooltip
                    content={
                      <ChartTooltip
                        title={(datum) => formatBucketLabel(String(datum.bucket), granularity)}
                        rows={(datum) => [
                          {
                            name: data.range.label,
                            value: Number(datum.total ?? 0),
                            color: STATUS_COLOR.read,
                          },
                          {
                            name: data.comparison?.label ?? 'Previous',
                            value:
                              datum.previous_total === null ? null : Number(datum.previous_total),
                            color: CHART_INK.COMPARISON,
                          },
                        ]}
                        footer={(datum) =>
                          datum.previous_bucket
                            ? `Previous bucket: ${formatBucketLabel(String(datum.previous_bucket), granularity)}`
                            : null
                        }
                      />
                    }
                  />
                  <Legend iconType="line" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  {/* The comparison sits behind as a dashed grey line: present
                      for reference, never competing with the current period. */}
                  <Area
                    type="monotone"
                    dataKey="previous_total"
                    name={data.comparison?.label ?? 'Previous'}
                    stroke={CHART_INK.COMPARISON}
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    fill="none"
                    dot={false}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name={data.range.label}
                    stroke={STATUS_COLOR.read}
                    strokeWidth={2}
                    fill="url(#currentFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.RATES_TITLE}</CardTitle>
          <CardDescription>
            {UI_MESSAGES.ANALYTICS.DELIVERY_RATE_HINT} · {UI_MESSAGES.ANALYTICS.FAILURE_RATE_HINT}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: CHART_HEIGHT.COMPACT }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.buckets} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(value) => formatBucketTick(String(value), granularity)}
                  minTickGap={24}
                  {...tickProps}
                />
                {/* Both series are percentages, so one shared 0–100 axis is
                    honest — no second scale, no manufactured correlation. */}
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  width={48}
                  {...tickProps}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      title={(datum) => formatBucketLabel(String(datum.bucket), granularity)}
                      rows={(datum) => [
                        {
                          name: UI_MESSAGES.ANALYTICS.DELIVERY_RATE,
                          value: null,
                          display: formatPercent(datum.delivery_rate as number | null),
                          color: STATUS_COLOR.delivered,
                        },
                        {
                          name: UI_MESSAGES.ANALYTICS.READ_RATE,
                          value: null,
                          display: formatPercent(datum.read_rate as number | null),
                          color: STATUS_COLOR.read,
                        },
                        {
                          name: UI_MESSAGES.ANALYTICS.FAILURE_RATE,
                          value: null,
                          display: formatPercent(datum.failure_rate as number | null),
                          color: STATUS_COLOR.failed,
                        },
                      ]}
                      footer={(datum) =>
                        `${UI_MESSAGES.ANALYTICS.STACK_TOTAL}: ${formatCount(Number(datum.total ?? 0))}`
                      }
                    />
                  }
                />
                <Legend iconType="line" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {/* connectNulls joins across quiet buckets, where a rate has no
                    base and is null — a gap there would read as an outage. */}
                <Line
                  type="monotone"
                  dataKey="delivery_rate"
                  name={UI_MESSAGES.ANALYTICS.DELIVERY_RATE}
                  stroke={STATUS_COLOR.delivered}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="read_rate"
                  name={UI_MESSAGES.ANALYTICS.READ_RATE}
                  stroke={STATUS_COLOR.read}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
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
    </div>
  );
}
