'use client';

import { useMemo } from 'react';
import { CalendarRange, RotateCcw } from 'lucide-react';
import {
  CUSTOM_PRESET,
  STATUS_LABEL,
  UI_MESSAGES,
  type MessageStatus,
} from '@/constants';
import { formatRangeLabel } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import type { AnalyticsFilterOptions, AnalyticsQueryParams, AnalyticsRange } from '@/types';

export interface AnalyticsFilterState extends AnalyticsQueryParams {
  preset: string;
}

interface AnalyticsFilterBarProps {
  filters: AnalyticsFilterState;
  onChange: (next: AnalyticsFilterState) => void;
  options: AnalyticsFilterOptions | null;
  /** The window the server actually resolved, echoed back for confirmation. */
  resolvedRange?: AnalyticsRange | null;
  /** That window answers an earlier query and is being replaced. */
  rangeStale?: boolean;
  disabled?: boolean;
}

const labelFor = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * The control surface for every analytics panel.
 *
 * Two decisions worth naming:
 *
 * 1. The preset list, the granularities and every option list come from the
 *    API, not from a constant here. The server validates against its own copy,
 *    so a hardcoded list in the client is a list that eventually 422s.
 *
 * 2. The window the server RESOLVED is echoed back beside the picker. "Last 30
 *    days" is ambiguous — whose days, counted from when — and showing the
 *    actual dates and timezone turns an assumption into something the admin can
 *    check at a glance.
 */
export function AnalyticsFilterBar({
  filters,
  onChange,
  options,
  resolvedRange,
  rangeStale = false,
  disabled,
}: AnalyticsFilterBarProps) {
  const set = <K extends keyof AnalyticsFilterState>(key: K, value: AnalyticsFilterState[K]) =>
    onChange({ ...filters, [key]: value });

  const companyOptions = useMemo<MultiSelectOption[]>(
    () =>
      (options?.companies ?? []).map((company) => ({
        value: company.id,
        label: company.name ?? company.id,
        hint: company.is_active === false ? UI_MESSAGES.ADMIN.INACTIVE : company.status,
      })),
    [options],
  );

  const planOptions = useMemo<MultiSelectOption[]>(
    () => (options?.plans ?? []).map((plan) => ({ value: plan.id, label: plan.name ?? plan.id })),
    [options],
  );

  const statusOptions = useMemo<MultiSelectOption[]>(
    () =>
      (options?.message_statuses ?? []).map((status) => ({
        value: status,
        label: STATUS_LABEL[status as MessageStatus] ?? labelFor(status),
      })),
    [options],
  );

  const typeOptions = useMemo<MultiSelectOption[]>(
    () => (options?.message_types ?? []).map((type) => ({ value: type, label: labelFor(type) })),
    [options],
  );

  const companyStatusOptions = useMemo<MultiSelectOption[]>(
    () =>
      (options?.company_statuses ?? []).map((status) => ({ value: status, label: labelFor(status) })),
    [options],
  );

  const phoneOptions = useMemo<MultiSelectOption[]>(
    () =>
      (options?.phone_numbers ?? []).map((phone) => ({
        value: phone.id,
        label: phone.label ?? phone.id,
        hint: phone.status,
      })),
    [options],
  );

  const isCustom = filters.preset === CUSTOM_PRESET;

  // Only the filters that actually narrow anything — so the "clear" button
  // appears exactly when there is something to clear.
  const activeFilterCount = [
    filters.company_ids,
    filters.company_statuses,
    filters.statuses,
    filters.message_types,
    filters.plan_ids,
    filters.phone_number_ids,
  ].reduce((count, list) => count + (list?.length ? 1 : 0), 0) + (filters.search ? 1 : 0);

  const clearFilters = () =>
    onChange({
      preset: filters.preset,
      date_from: filters.date_from,
      date_to: filters.date_to,
      granularity: filters.granularity,
    });

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="analytics-preset">{UI_MESSAGES.ANALYTICS.PERIOD_LABEL}</Label>
            <select
              id="analytics-preset"
              value={filters.preset}
              disabled={disabled || !options}
              onChange={(e) => set('preset', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
            >
              {(options?.presets ?? []).map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {isCustom ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="analytics-from">{UI_MESSAGES.ANALYTICS.FROM_LABEL}</Label>
                <Input
                  id="analytics-from"
                  type="date"
                  value={filters.date_from ?? ''}
                  max={filters.date_to || undefined}
                  disabled={disabled}
                  onChange={(e) => set('date_from', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="analytics-to">{UI_MESSAGES.ANALYTICS.TO_LABEL}</Label>
                <Input
                  id="analytics-to"
                  type="date"
                  value={filters.date_to ?? ''}
                  min={filters.date_from || undefined}
                  disabled={disabled}
                  onChange={(e) => set('date_to', e.target.value)}
                />
              </div>
            </>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="analytics-granularity">{UI_MESSAGES.ANALYTICS.GRANULARITY_LABEL}</Label>
            <select
              id="analytics-granularity"
              value={filters.granularity ?? ''}
              disabled={disabled || !options}
              onChange={(e) => set('granularity', e.target.value || undefined)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
            >
              {/* Empty value means "let the server pick from the window length". */}
              <option value="">{UI_MESSAGES.ANALYTICS.GRANULARITY_AUTO}</option>
              {(options?.granularities ?? []).map((granularity) => (
                <option key={granularity.value} value={granularity.value}>
                  {granularity.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>{UI_MESSAGES.ANALYTICS.COMPANIES_LABEL}</Label>
            <MultiSelect
              options={companyOptions}
              value={filters.company_ids ?? []}
              onChange={(value) => set('company_ids', value)}
              placeholder={UI_MESSAGES.ANALYTICS.ALL_COMPANIES}
              noun="companies"
              disabled={disabled || !options}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{UI_MESSAGES.ANALYTICS.STATUS_LABEL}</Label>
            <MultiSelect
              options={statusOptions}
              value={filters.statuses ?? []}
              onChange={(value) => set('statuses', value as MessageStatus[])}
              placeholder={UI_MESSAGES.ANALYTICS.ALL_STATUSES}
              noun="statuses"
              disabled={disabled || !options}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{UI_MESSAGES.ANALYTICS.PLAN_LABEL}</Label>
            <MultiSelect
              options={planOptions}
              value={filters.plan_ids ?? []}
              onChange={(value) => set('plan_ids', value)}
              placeholder={UI_MESSAGES.ANALYTICS.ALL_PLANS}
              noun="plans"
              disabled={disabled || !options}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{UI_MESSAGES.ANALYTICS.MESSAGE_TYPE_LABEL}</Label>
            <MultiSelect
              options={typeOptions}
              value={filters.message_types ?? []}
              onChange={(value) => set('message_types', value)}
              placeholder={UI_MESSAGES.ANALYTICS.ALL_TYPES}
              noun="types"
              disabled={disabled || !options}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{UI_MESSAGES.ANALYTICS.COMPANY_STATUS_LABEL}</Label>
            <MultiSelect
              options={companyStatusOptions}
              value={filters.company_statuses ?? []}
              onChange={(value) => set('company_statuses', value)}
              placeholder={UI_MESSAGES.ANALYTICS.ANY_COMPANY_STATUS}
              noun="states"
              disabled={disabled || !options}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{UI_MESSAGES.ANALYTICS.PHONE_LABEL}</Label>
            <MultiSelect
              options={phoneOptions}
              value={filters.phone_number_ids ?? []}
              onChange={(value) => set('phone_number_ids', value)}
              placeholder={UI_MESSAGES.ANALYTICS.ALL_NUMBERS}
              noun="numbers"
              disabled={disabled || !options}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="analytics-search">{UI_MESSAGES.ANALYTICS.RECIPIENT_LABEL}</Label>
            <Input
              id="analytics-search"
              value={filters.search ?? ''}
              placeholder={UI_MESSAGES.ANALYTICS.RECIPIENT_PLACEHOLDER}
              disabled={disabled}
              onChange={(e) => set('search', e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-3 text-sm">
          <CalendarRange className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">{UI_MESSAGES.ANALYTICS.SHOWING}</span>
          {/* Dimmed rather than blanked while the next window loads: the dates
              stay readable, and nothing shifts as they are replaced. */}
          <span className={cn('font-medium', rangeStale && 'text-muted-foreground')}>
            {formatRangeLabel(resolvedRange)}
          </span>
          {rangeStale ? (
            <span className="text-xs text-muted-foreground">{UI_MESSAGES.ANALYTICS.UPDATING}</span>
          ) : null}
          {resolvedRange && !rangeStale ? (
            <>
              <Badge variant="muted">{resolvedRange.timezone}</Badge>
              {resolvedRange.granularity_label ? (
                <Badge variant="outline">{resolvedRange.granularity_label}</Badge>
              ) : null}
              {/* Calendar windows run past today; saying so explains why the
                  per-day average divides by fewer days than the range spans. */}
              {resolvedRange.elapsed_days !== null &&
              resolvedRange.days !== null &&
              resolvedRange.elapsed_days < resolvedRange.days ? (
                <Badge variant="warning">
                  {UI_MESSAGES.ANALYTICS.ELAPSED_OF(resolvedRange.elapsed_days, resolvedRange.days)}
                </Badge>
              ) : null}
            </>
          ) : null}

          {activeFilterCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={clearFilters}
              disabled={disabled}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {UI_MESSAGES.ANALYTICS.CLEAR_FILTERS(activeFilterCount)}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
