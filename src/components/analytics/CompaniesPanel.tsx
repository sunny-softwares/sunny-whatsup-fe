'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
  COMPANY_ANALYTICS_SORT_FIELD,
  STATUS_COLOR,
  UI_MESSAGES,
  type SortOrder,
} from '@/constants';
import {
  formatCount,
  formatDecimal,
  formatPercent,
  formatSignedPercent,
} from '@/lib/analytics';
import { formatDate, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader, nextSort } from '@/components/ui/sortable-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AnalyticsCompaniesMeta, AnalyticsCompanyRow } from '@/types';

interface CompaniesPanelProps {
  rows: AnalyticsCompanyRow[];
  meta: AnalyticsCompaniesMeta | null;
  sortBy: string;
  sortOrder: SortOrder;
  onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
  page: number;
  onPageChange: (page: number) => void;
  includeSilent: boolean;
  onIncludeSilentChange: (value: boolean) => void;
  loading?: boolean;
}

/**
 * Per-tenant volume and delivery health, sortable and paginated.
 *
 * Sorting happens on the SERVER — "the worst failure rate on the platform" has
 * to look at every company, and sorting the current page would only ever find
 * the worst of twenty. The same reason pagination is server-side.
 */
export function CompaniesPanel({
  rows,
  meta,
  sortBy,
  sortOrder,
  onSortChange,
  page,
  onPageChange,
  includeSilent,
  onIncludeSilentChange,
  loading,
}: CompaniesPanelProps) {
  const sort = { by: sortBy, order: sortOrder };
  const handleSort = (field: string) => {
    const next = nextSort(sort, field);
    onSortChange(next.by, next.order);
  };

  return (
    <Card>
      <CardHeader className="gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.COMPANIES_TITLE}</CardTitle>
          <CardDescription>{UI_MESSAGES.ANALYTICS.COMPANIES_HINT}</CardDescription>
        </div>
        <Label className="flex shrink-0 items-center gap-2 font-normal">
          <Checkbox
            checked={includeSilent}
            disabled={loading}
            onChange={(e) => onIncludeSilentChange(e.target.checked)}
          />
          {UI_MESSAGES.ANALYTICS.INCLUDE_SILENT}
        </Label>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader
                  label={UI_MESSAGES.ADMIN.SELECT_COMPANY_LABEL}
                  field={COMPANY_ANALYTICS_SORT_FIELD.NAME}
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label={UI_MESSAGES.ANALYTICS.TOTAL_MESSAGES}
                  field={COMPANY_ANALYTICS_SORT_FIELD.TOTAL}
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
                <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.SHARE}</TableHead>
                <SortableHeader
                  label={UI_MESSAGES.ANALYTICS.AVG_PER_DAY}
                  field={COMPANY_ANALYTICS_SORT_FIELD.AVG_PER_DAY}
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHeader
                  label={UI_MESSAGES.ANALYTICS.DELIVERY_RATE}
                  field={COMPANY_ANALYTICS_SORT_FIELD.DELIVERY_RATE}
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHeader
                  label={UI_MESSAGES.ANALYTICS.FAILURE_RATE}
                  field={COMPANY_ANALYTICS_SORT_FIELD.FAILURE_RATE}
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHeader
                  label={UI_MESSAGES.ANALYTICS.FAILED_MESSAGES}
                  field={COMPANY_ANALYTICS_SORT_FIELD.FAILED}
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
                <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.RECIPIENTS}</TableHead>
                <SortableHeader
                  label={UI_MESSAGES.ANALYTICS.ACTIVE_DAYS}
                  field={COMPANY_ANALYTICS_SORT_FIELD.ACTIVE_DAYS}
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
                <TableHead className="text-right">{UI_MESSAGES.ANALYTICS.CHANGE}</TableHead>
                <SortableHeader
                  label={UI_MESSAGES.ANALYTICS.LAST_MESSAGE}
                  field={COMPANY_ANALYTICS_SORT_FIELD.LAST_MESSAGE_AT}
                  sort={sort}
                  onSort={handleSort}
                />
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                    {loading ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.COMMON.EMPTY}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const changePct = row.change?.change_pct ?? null;
                  const ChangeIcon = (changePct ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;
                  return (
                    <TableRow key={row.company_id}>
                      <TableCell className="min-w-[12rem]">
                        <div className="font-medium">{row.name}</div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {row.plan ? (
                            <Badge variant="outline">{row.plan.name}</Badge>
                          ) : null}
                          {!row.is_active ? (
                            <Badge variant="muted">{UI_MESSAGES.ADMIN.INACTIVE}</Badge>
                          ) : null}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(row.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCount(row.total)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatPercent(row.share)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDecimal(row.avg_per_day)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(row.delivery_rate)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right tabular-nums',
                          (row.failure_rate ?? 0) > 0 && 'text-destructive',
                        )}
                      >
                        {formatPercent(row.failure_rate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(row.failed)}
                        {row.failed_unhandled > 0 ? (
                          <span
                            className="ml-1.5 text-xs"
                            style={{ color: STATUS_COLOR.failed }}
                            title={UI_MESSAGES.ANALYTICS.OUTSTANDING_HINT}
                          >
                            ({formatCount(row.failed_unhandled)})
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatCount(row.unique_recipients)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatCount(row.active_days)}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.change && changePct !== null ? (
                          <span
                            className={cn(
                              'inline-flex items-center gap-0.5 tabular-nums',
                              changePct >= 0 ? 'text-green-700' : 'text-destructive',
                            )}
                          >
                            <ChangeIcon className="h-3.5 w-3.5" />
                            {formatSignedPercent(changePct)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {row.previous_total === null
                              ? UI_MESSAGES.ANALYTICS.NO_COMPARISON
                              : formatCount(row.previous_total)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(row.last_message_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {meta ? (
          <Pagination
            pagination={{ ...meta.pagination, page }}
            itemCount={rows.length}
            onPageChange={onPageChange}
            disabled={loading}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
