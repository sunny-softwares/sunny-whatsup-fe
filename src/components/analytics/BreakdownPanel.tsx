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
import {
  CHART_HEIGHT,
  CHART_INK,
  STATUS_COLOR,
  STATUS_LABEL,
  UI_MESSAGES,
  type MessageStatus,
} from '@/constants';
import { formatCompact, formatCount, formatPercent } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityHeatmap } from './ActivityHeatmap';
import { ChartTooltip } from './ChartTooltip';
import { DistributionList, type DistributionItem } from './DistributionList';
import type { AnalyticsBreakdown, AnalyticsBreakdownRow } from '@/types';

interface BreakdownPanelProps {
  data: AnalyticsBreakdown;
}

const titleCase = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** A grouped row becomes a bar: key or label for the name, count for the length. */
const toItems = (rows: AnalyticsBreakdownRow[], fallbackPrefix: string): DistributionItem[] =>
  rows.map((row, index) => ({
    id: row.id ?? row.key ?? `${fallbackPrefix}-${index}`,
    label: row.label ?? (row.key ? titleCase(row.key) : UI_MESSAGES.COMMON.EMPTY),
    hint: row.company_name ?? (row.companies ? `${row.companies} companies` : undefined),
    value: row.count,
    share: row.share,
  }));

/**
 * Every distribution of the same filtered set, on one screen.
 *
 * Bars throughout rather than pies: all of these are read by comparing
 * magnitudes and finding a name, which a labelled bar does directly. The two
 * genuinely cyclical dimensions — hour of day and day of week — get column
 * charts, where the x-axis itself carries the cycle.
 */
export function BreakdownPanel({ data }: BreakdownPanelProps) {
  const tickProps = {
    fontSize: 11,
    stroke: CHART_INK.AXIS,
    tickLine: false,
    axisLine: false,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.BY_STATUS}
          items={data.by_status.map((row) => ({
            id: row.key ?? '',
            label: STATUS_LABEL[row.key as MessageStatus] ?? titleCase(row.key ?? ''),
            value: row.count,
            share: row.share,
            color: STATUS_COLOR[row.key as MessageStatus],
          }))}
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.BY_TYPE}
          items={toItems(data.by_message_type, 'type')}
          colorful
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.BY_PLAN}
          description={UI_MESSAGES.ANALYTICS.PLAN_LABEL}
          items={toItems(data.by_plan, 'plan')}
          colorful
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.BY_CATEGORY}
          items={toItems(data.by_template_category, 'category')}
          colorful
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.TOP_COMPANIES}
          items={toItems(data.top_companies, 'company')}
          colorful
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.TOP_TEMPLATES}
          items={toItems(data.top_templates, 'template')}
          colorful
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.TOP_NUMBERS}
          items={toItems(data.top_phone_numbers, 'phone')}
          colorful
        />
        <DistributionList
          title={UI_MESSAGES.ANALYTICS.TOP_WABAS}
          items={toItems(data.top_waba_accounts, 'waba')}
          colorful
        />
      </div>

      <DistributionList
        title={UI_MESSAGES.ANALYTICS.TOP_RECIPIENTS}
        items={toItems(data.top_recipients, 'recipient')}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.BY_HOUR}</CardTitle>
            <CardDescription>
              {UI_MESSAGES.ANALYTICS.BY_HOUR_HINT} · {data.range.timezone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: CHART_HEIGHT.COMPACT }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_hour} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(value) => String(value).padStart(2, '0')}
                    interval={2}
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
                        title={(datum) => `${String(datum.hour).padStart(2, '0')}:00`}
                        rows={(datum) => [
                          {
                            name: UI_MESSAGES.ANALYTICS.TOTAL_MESSAGES,
                            value: Number(datum.count ?? 0),
                            color: 'hsl(var(--primary))',
                          },
                        ]}
                        footer={(datum) =>
                          `${UI_MESSAGES.ANALYTICS.SHARE}: ${formatPercent(datum.share as number | null)}`
                        }
                      />
                    }
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.BY_WEEKDAY}</CardTitle>
            <CardDescription>{data.range.timezone}</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: CHART_HEIGHT.COMPACT }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_weekday} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke={CHART_INK.GRID} />
                  <XAxis dataKey="label" {...tickProps} />
                  <YAxis
                    tickFormatter={(value) => formatCompact(Number(value))}
                    width={44}
                    {...tickProps}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={
                      <ChartTooltip
                        title={(datum) => String(datum.label)}
                        rows={(datum) => [
                          {
                            name: UI_MESSAGES.ANALYTICS.TOTAL_MESSAGES,
                            value: Number(datum.count ?? 0),
                            color: 'hsl(var(--primary))',
                          },
                        ]}
                        footer={(datum) =>
                          `${UI_MESSAGES.ANALYTICS.SHARE}: ${formatPercent(datum.share as number | null)}`
                        }
                      />
                    }
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActivityHeatmap cells={data.heatmap} timezone={data.range.timezone} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.BY_COMPANY_STATE}</CardTitle>
          <CardDescription>{UI_MESSAGES.ANALYTICS.COMPANY_STATUS_LABEL}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {data.by_company_status.map((row) => (
              <div key={row.key}>
                <dt className="text-xs text-muted-foreground">{titleCase(row.key ?? '')}</dt>
                <dd className="font-semibold tabular-nums">{formatCount(row.count)}</dd>
                <dd className="text-xs text-muted-foreground">{formatPercent(row.share)}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
