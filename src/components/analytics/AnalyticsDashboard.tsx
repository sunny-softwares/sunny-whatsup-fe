'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ANALYTICS_PAGE_SIZE,
  ANALYTICS_TAB,
  ANALYTICS_TABS,
  ANALYTICS_TOP_N,
  COMPANY_ANALYTICS_SORT_FIELD,
  CUSTOM_PRESET,
  DEFAULT_ANALYTICS_PRESET,
  SORT_ORDER,
  UI_MESSAGES,
  type AnalyticsTab,
  type SortOrder,
} from '@/constants';
import { analyticsApi } from '@/lib/api/analytics.api';
import { useAnalyticsResource } from '@/hooks/useAnalyticsResource';
import { pickErrorMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Tabs } from '@/components/ui/tabs';
import { AnalyticsFilterBar, type AnalyticsFilterState } from './AnalyticsFilterBar';
import { AveragesPanel } from './AveragesPanel';
import { BreakdownPanel } from './BreakdownPanel';
import { CompaniesPanel } from './CompaniesPanel';
import { FailuresPanel } from './FailuresPanel';
import { GrowthPanel } from './GrowthPanel';
import { OverviewPanel } from './OverviewPanel';
import { RevenuePanel } from './RevenuePanel';
import { TrendsPanel } from './TrendsPanel';
import type { AnalyticsFilterOptions, AnalyticsRange } from '@/types';

/**
 * The super-admin analytics dashboard.
 *
 * Panels fetch INDEPENDENTLY and only while their tab is open. The alternative
 * — one request that returns everything — would make opening the dashboard run
 * nine aggregate queries over the message log when the admin wanted one number,
 * and would make every filter change pay for all nine again.
 *
 * The filter state is serialised into a key string that each panel's fetch
 * depends on. That is what ties a chart to the filters that produced it: the
 * key changes, the request re-runs, and a response that arrives for a key that
 * is no longer current is discarded rather than drawn.
 */
export function AnalyticsDashboard() {
  const [tab, setTab] = useState<AnalyticsTab>(ANALYTICS_TAB.OVERVIEW);
  const [filters, setFilters] = useState<AnalyticsFilterState>({
    preset: DEFAULT_ANALYTICS_PRESET,
  });

  const [options, setOptions] = useState<AnalyticsFilterOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Company-leaderboard state. Kept here rather than inside the panel so that
  // changing a filter can reset the page — otherwise a narrowed result set
  // leaves you stranded on page 7 of a two-page list.
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>(COMPANY_ANALYTICS_SORT_FIELD.TOTAL);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDER.DESC);
  const [includeSilent, setIncludeSilent] = useState(false);
  const [paymentMode, setPaymentMode] = useState('');

  useEffect(() => {
    analyticsApi
      .filters()
      .then((res) => setOptions(res.data))
      .catch((err) => setOptionsError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR)));
  }, []);

  /**
   * The filters as the API will receive them.
   *
   * `date_from`/`date_to` only travel with a custom preset — leaving them on a
   * named preset would be ignored by the server but would still change the
   * cache key, re-fetching every panel for no reason.
   */
  const query = useMemo(() => {
    const isCustom = filters.preset === CUSTOM_PRESET;
    return {
      preset: filters.preset,
      date_from: isCustom ? filters.date_from : undefined,
      date_to: isCustom ? filters.date_to : undefined,
      granularity: filters.granularity,
      company_ids: filters.company_ids,
      company_statuses: filters.company_statuses,
      statuses: filters.statuses,
      message_types: filters.message_types,
      phone_number_ids: filters.phone_number_ids,
      plan_ids: filters.plan_ids,
      search: filters.search?.trim() || undefined,
    };
  }, [filters]);

  const queryKey = useMemo(() => JSON.stringify(query), [query]);

  // A custom window with only one end filled in is a half-typed date, not a
  // request: firing it would show a window the admin is still mid-way through
  // choosing.
  const ready =
    filters.preset !== CUSTOM_PRESET || Boolean(filters.date_from && filters.date_to);

  const handleFilterChange = useCallback((next: AnalyticsFilterState) => {
    setFilters(next);
    setPage(1);
  }, []);

  const overview = useAnalyticsResource(
    () => analyticsApi.overview(query).then((res) => res.data),
    `overview:${queryKey}`,
    ready && tab === ANALYTICS_TAB.OVERVIEW,
  );

  const timeseries = useAnalyticsResource(
    () => analyticsApi.timeseries(query).then((res) => res.data),
    `timeseries:${queryKey}`,
    ready && tab === ANALYTICS_TAB.TRENDS,
  );

  const averages = useAnalyticsResource(
    () => analyticsApi.averages(query).then((res) => res.data),
    `averages:${queryKey}`,
    ready && tab === ANALYTICS_TAB.AVERAGES,
  );

  const companies = useAnalyticsResource(
    () =>
      analyticsApi.companies({
        ...query,
        page,
        pageSize: ANALYTICS_PAGE_SIZE,
        sort_by: sortBy,
        sort_order: sortOrder,
        include_silent: includeSilent,
      }),
    `companies:${queryKey}:${page}:${sortBy}:${sortOrder}:${includeSilent}`,
    ready && tab === ANALYTICS_TAB.COMPANIES,
  );

  const breakdown = useAnalyticsResource(
    () => analyticsApi.breakdown({ ...query, limit: ANALYTICS_TOP_N }).then((res) => res.data),
    `breakdown:${queryKey}`,
    ready && tab === ANALYTICS_TAB.BREAKDOWN,
  );

  const growth = useAnalyticsResource(
    () => analyticsApi.growth(query).then((res) => res.data),
    `growth:${queryKey}`,
    ready && tab === ANALYTICS_TAB.GROWTH,
  );

  const failures = useAnalyticsResource(
    () => analyticsApi.failures({ ...query, limit: ANALYTICS_TOP_N }).then((res) => res.data),
    `failures:${queryKey}`,
    ready && tab === ANALYTICS_TAB.FAILURES,
  );

  const revenue = useAnalyticsResource(
    () =>
      analyticsApi
        .revenue({ ...query, limit: ANALYTICS_TOP_N, payment_mode: paymentMode || undefined })
        .then((res) => res.data),
    `revenue:${queryKey}:${paymentMode}`,
    ready && tab === ANALYTICS_TAB.REVENUE,
  );

  // Whichever panel is open supplies the resolved window the filter bar echoes
  // back, so the dates shown are always the ones that produced what is on
  // screen rather than a client-side guess at them.
  const resolvedRange: AnalyticsRange | null =
    overview.data?.range ??
    timeseries.data?.range ??
    averages.data?.range ??
    companies.data?.meta?.range ??
    breakdown.data?.range ??
    growth.data?.range ??
    failures.data?.range ??
    revenue.data?.range ??
    null;

  const active = {
    [ANALYTICS_TAB.OVERVIEW]: overview,
    [ANALYTICS_TAB.TRENDS]: timeseries,
    [ANALYTICS_TAB.AVERAGES]: averages,
    [ANALYTICS_TAB.COMPANIES]: companies,
    [ANALYTICS_TAB.BREAKDOWN]: breakdown,
    [ANALYTICS_TAB.GROWTH]: growth,
    [ANALYTICS_TAB.FAILURES]: failures,
    [ANALYTICS_TAB.REVENUE]: revenue,
  }[tab];

  const renderPanel = () => {
    if (!ready) {
      return <p className="text-sm text-muted-foreground">{UI_MESSAGES.ANALYTICS.PICK_DATES}</p>;
    }
    if (active.error) return <p className="text-sm text-destructive">{active.error}</p>;
    // Every endpoint answers with an object even when nothing matched, so a
    // null `data` always means "not fetched yet" — never "no results". Showing
    // the empty state here would flash "No data" for a frame on every tab
    // switch, on a page whose numbers people act on.
    if (!active.data) {
      return <p className="text-sm text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>;
    }

    switch (tab) {
      case ANALYTICS_TAB.OVERVIEW:
        return overview.data ? <OverviewPanel data={overview.data} /> : null;
      case ANALYTICS_TAB.TRENDS:
        return timeseries.data ? <TrendsPanel data={timeseries.data} /> : null;
      case ANALYTICS_TAB.AVERAGES:
        return averages.data ? <AveragesPanel data={averages.data} /> : null;
      case ANALYTICS_TAB.COMPANIES:
        return (
          <CompaniesPanel
            rows={companies.data?.data ?? []}
            meta={companies.data?.meta ?? null}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(by, order) => {
              setSortBy(by);
              setSortOrder(order);
              setPage(1);
            }}
            page={page}
            onPageChange={setPage}
            includeSilent={includeSilent}
            onIncludeSilentChange={(value) => {
              setIncludeSilent(value);
              setPage(1);
            }}
            loading={companies.loading}
          />
        );
      case ANALYTICS_TAB.BREAKDOWN:
        return breakdown.data ? <BreakdownPanel data={breakdown.data} /> : null;
      case ANALYTICS_TAB.GROWTH:
        return growth.data ? <GrowthPanel data={growth.data} /> : null;
      case ANALYTICS_TAB.FAILURES:
        return failures.data ? <FailuresPanel data={failures.data} /> : null;
      case ANALYTICS_TAB.REVENUE:
        return revenue.data ? (
          <RevenuePanel
            data={revenue.data}
            paymentMode={paymentMode}
            onPaymentModeChange={setPaymentMode}
            modeOptions={options?.razorpay_modes ?? []}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{UI_MESSAGES.ANALYTICS.TITLE}</h2>
        <p className="text-sm text-muted-foreground">{UI_MESSAGES.ANALYTICS.SUBTITLE}</p>
      </div>

      {optionsError ? <p className="text-sm text-destructive">{optionsError}</p> : null}

      <AnalyticsFilterBar
        filters={filters}
        onChange={handleFilterChange}
        options={options}
        resolvedRange={resolvedRange}
      />

      <Tabs options={ANALYTICS_TABS} value={tab} onChange={setTab} />

      {/* Dimmed rather than blanked while re-fetching: the previous numbers stay
          readable, and the whole page does not jump as panels unmount. */}
      <div
        className={cn('pt-2 transition-opacity', active.loading && active.data && 'opacity-50')}
        aria-busy={active.loading}
      >
        {renderPanel()}
      </div>
    </section>
  );
}
