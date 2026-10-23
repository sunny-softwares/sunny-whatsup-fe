'use client';

import { UI_MESSAGES } from '@/constants';
import { formatCount, formatDecimal, formatPercent, formatRangeLabel } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AnalyticsAveragesResponse } from '@/types';

interface AveragesPanelProps {
  data: AnalyticsAveragesResponse;
}

/**
 * Every standard window in one table: today, the last 7/30/90 days, this and
 * last calendar week/month/quarter, this and last year, and all time.
 *
 * A table rather than a chart on purpose. These are nine unrelated windows, not
 * a series — there is no axis they share and no shape to read — and the actual
 * job is comparing a handful of numbers, which a table does exactly.
 */
export function AveragesPanel({ data }: AveragesPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.AVERAGES_TITLE}</CardTitle>
        <CardDescription>{UI_MESSAGES.ANALYTICS.AVERAGES_HINT}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_MESSAGES.ANALYTICS.WINDOW}</TableHead>
                <TableHead>{UI_MESSAGES.ANALYTICS.DATES}</TableHead>
                <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.DAYS}</TableHead>
                <TableHead className="text-right">
                  {UI_MESSAGES.ANALYTICS.TOTAL_MESSAGES}
                </TableHead>
                <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.AVG_PER_DAY}</TableHead>
                <TableHead className="text-right">
                  {UI_MESSAGES.ANALYTICS.AVG_PER_ACTIVE_DAY}
                </TableHead>
                <TableHead className="text-right">
                  {UI_MESSAGES.ANALYTICS.AVG_PER_COMPANY}
                </TableHead>
                <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.ACTIVE_DAYS}</TableHead>
                <TableHead className="text-right">
                  {UI_MESSAGES.ANALYTICS.DELIVERY_RATE}
                </TableHead>
                <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.FAILURE_RATE}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.windows.map((window) => (
                <TableRow
                  key={`${window.preset}-${window.from_date ?? 'start'}`}
                  className={cn(window.is_selected && 'bg-accent/60')}
                >
                  <TableCell className="whitespace-nowrap font-medium">
                    {window.label}
                    {window.is_selected ? (
                      <Badge variant="outline" className="ml-2">
                        Selected
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatRangeLabel(window)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {/* Elapsed, not spanned — a calendar window that runs past
                        today is shown as "18 / 31" rather than a flat 31. */}
                    {window.elapsed_days === window.days
                      ? formatCount(window.days)
                      : `${formatCount(window.elapsed_days)} / ${formatCount(window.days)}`}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCount(window.messages.total)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(window.averages.per_day)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(window.averages.per_active_day)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(window.averages.per_company)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCount(window.messages.active_days)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPercent(window.messages.delivery_rate)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right tabular-nums',
                      (window.messages.failure_rate ?? 0) > 0 && 'text-destructive',
                    )}
                  >
                    {formatPercent(window.messages.failure_rate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
