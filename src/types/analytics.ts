import type { MessageStatus } from '@/constants/statuses';

/**
 * Super-admin analytics responses.
 *
 * Two shapes recur and are worth knowing before reading the rest:
 *
 * - `AnalyticsRange` is HALF-OPEN. `from` is included, `to` is not, and
 *   `from_date`/`to_date` are the calendar dates a human would name — the last
 *   day the window covers, not the exclusive bound. Render the dates; the
 *   instants are there for debugging.
 *
 * - `AnalyticsMessageMetrics` counts a message under exactly ONE status, and
 *   status only moves forward. A message that was read is no longer counted
 *   under `delivered`. That is why `accepted` and `delivered_or_better` exist
 *   and why the rates come from the server: dividing `delivered` by `total` in
 *   a component would quietly under-report every healthy tenant.
 */

export type DatePreset = string;
export type Granularity = string;

export interface AnalyticsRange {
  preset: DatePreset;
  label: string;
  timezone: string;
  /** Null for `all_time`, which has no lower bound. */
  from: string | null;
  to: string;
  from_date: string | null;
  /** Last day INCLUDED, in the window's timezone. */
  to_date: string | null;
  days: number | null;
  /**
   * Days of the window that have actually happened. On the 18th, `this_month`
   * spans 31 days but only 18 have elapsed — every per-day average divides by
   * this, not by `days`.
   */
  elapsed_days: number | null;
  granularity?: Granularity;
  granularity_label?: string;
}

export type MessageStatusCounts = Record<MessageStatus, number>;

export interface AnalyticsMessageMetrics extends MessageStatusCounts {
  total: number;
  /** Messages Meta accepted: sent + delivered + read. */
  accepted: number;
  delivered_or_better: number;
  acceptance_rate: number | null;
  /** Of ACCEPTED messages, the share that reached a handset. */
  delivery_rate: number | null;
  read_rate: number | null;
  failure_rate: number | null;
  pending_rate: number | null;
}

export interface AnalyticsWindowMetrics extends AnalyticsMessageMetrics {
  failed_unhandled: number;
  failed_handled: number;
  active_companies: number;
  active_wabas: number;
  active_phone_numbers: number;
  templates_used: number;
  active_senders: number;
  unique_recipients: number;
  active_days: number;
  first_message_at: string | null;
  last_message_at: string | null;
}

export interface AnalyticsAverages {
  per_day: number | null;
  per_active_day: number | null;
  per_company: number | null;
  per_company_per_day: number | null;
  per_hour: number | null;
  sent_per_day: number | null;
  failed_per_day: number | null;
}

export interface AnalyticsDelta {
  current: number;
  previous: number;
  change: number;
  /** Null when the previous value was zero — growth from nothing has no percentage. */
  change_pct: number | null;
}

export interface AnalyticsBreakdownRow {
  key?: string;
  id?: string | null;
  label?: string;
  category?: string;
  company_name?: string;
  companies?: number;
  plan_key?: string | null;
  last_message_at?: string;
  count: number;
  share: number | null;
}

export interface AnalyticsGrowthTotals {
  companies: number;
  approved_companies: number;
  users: number;
  waba_accounts: number;
  templates: number;
  phone_numbers: number;
}

export interface AnalyticsSnapshot {
  companies: {
    total: number;
    active: number;
    by_status: AnalyticsBreakdownRow[];
    with_connected_waba: number;
    with_messages: number;
  };
  users: { total: number; by_status: AnalyticsBreakdownRow[]; by_role: AnalyticsBreakdownRow[] };
  waba_accounts: { total: number; connected: number; by_status: AnalyticsBreakdownRow[] };
  phone_numbers: { total: number; by_status: AnalyticsBreakdownRow[] };
  templates: {
    total: number;
    by_status: AnalyticsBreakdownRow[];
    by_category: AnalyticsBreakdownRow[];
  };
  subscriptions: { total: number; by_status: AnalyticsBreakdownRow[] };
  messages: { total: number };
}

export interface AnalyticsOverview {
  range: AnalyticsRange;
  comparison: AnalyticsRange | null;
  messages: AnalyticsWindowMetrics;
  previous_messages: AnalyticsWindowMetrics | null;
  averages: AnalyticsAverages;
  previous_averages: AnalyticsAverages | null;
  peak: { day: string; count: number } | null;
  growth: AnalyticsGrowthTotals;
  previous_growth: AnalyticsGrowthTotals | null;
  deltas: Record<string, AnalyticsDelta> | null;
  snapshot: AnalyticsSnapshot;
}

export interface AnalyticsTimeseriesBucket extends AnalyticsMessageMetrics {
  /** Bucket start as local wall-clock time in the window's timezone. */
  bucket: string;
  active_companies: number;
  unique_recipients: number;
}

export interface AnalyticsTimeseries {
  range: AnalyticsRange;
  comparison: AnalyticsRange | null;
  buckets: AnalyticsTimeseriesBucket[];
  /** The comparison window, aligned by POSITION so the two series overlay. */
  previous_buckets: AnalyticsTimeseriesBucket[] | null;
  summary: {
    total: number;
    buckets: number;
    average_per_bucket: number | null;
    busiest: AnalyticsTimeseriesBucket | null;
  };
}

export interface AnalyticsAverageWindow extends AnalyticsRange {
  is_selected: boolean;
  messages: AnalyticsWindowMetrics;
  averages: AnalyticsAverages;
}

export interface AnalyticsAveragesResponse {
  range: AnalyticsRange;
  windows: AnalyticsAverageWindow[];
}

export interface AnalyticsCompanyRow extends AnalyticsMessageMetrics {
  company_id: string;
  name: string;
  company_status: string;
  is_active: boolean;
  created_at: string;
  plan: { key: string; name: string } | null;
  subscription_status: string | null;
  failed_unhandled: number;
  unique_recipients: number;
  templates_used: number;
  active_days: number;
  avg_per_day: number | null;
  avg_per_active_day: number | null;
  first_message_at: string | null;
  last_message_at: string | null;
  share: number | null;
  previous_total: number | null;
  change?: AnalyticsDelta;
}

export interface AnalyticsCompaniesMeta {
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  range: AnalyticsRange;
  comparison: AnalyticsRange | null;
  totals: AnalyticsWindowMetrics;
  page_total: number;
}

export interface AnalyticsHeatmapCell {
  iso: number;
  label: string;
  hour: number;
  count: number;
}

export interface AnalyticsBreakdown {
  range: AnalyticsRange;
  by_status: AnalyticsBreakdownRow[];
  by_message_type: AnalyticsBreakdownRow[];
  by_company_status: AnalyticsBreakdownRow[];
  by_template_category: AnalyticsBreakdownRow[];
  by_plan: AnalyticsBreakdownRow[];
  top_companies: AnalyticsBreakdownRow[];
  top_templates: AnalyticsBreakdownRow[];
  top_waba_accounts: AnalyticsBreakdownRow[];
  top_phone_numbers: AnalyticsBreakdownRow[];
  top_recipients: AnalyticsBreakdownRow[];
  by_hour: { hour: number; count: number; share: number | null }[];
  by_weekday: { iso: number; label: string; count: number; share: number | null }[];
  /** A complete 7 × 24 grid, zeros included. */
  heatmap: AnalyticsHeatmapCell[];
}

export interface AnalyticsGrowthBucket {
  bucket: string;
  new_companies: number;
  approved_companies: number;
  new_users: number;
  new_waba_accounts: number;
  new_templates: number;
  cumulative_companies: number;
  cumulative_users: number;
  cumulative_waba_accounts: number;
  cumulative_templates: number;
}

export interface AnalyticsGrowth {
  range: AnalyticsRange;
  buckets: AnalyticsGrowthBucket[];
  totals: AnalyticsGrowthTotals;
  averages: {
    companies_per_day: number | null;
    users_per_day: number | null;
    templates_per_day: number | null;
  };
}

export interface AnalyticsFailureCode {
  code: string;
  label: string;
  count: number;
  unhandled: number;
  companies: number;
  last_seen_at: string | null;
  share: number | null;
}

export interface AnalyticsFailures {
  range: AnalyticsRange;
  summary: {
    total: number;
    unhandled: number;
    handled: number;
    handled_rate: number | null;
    companies_affected: number;
    recipients_affected: number;
    per_day: number | null;
  };
  by_code: AnalyticsFailureCode[];
  by_company: AnalyticsBreakdownRow[];
  by_template: AnalyticsBreakdownRow[];
  by_phone_number: AnalyticsBreakdownRow[];
  trend: {
    bucket: string;
    total: number;
    failed: number;
    unhandled: number;
    failure_rate: number | null;
  }[];
}

export interface AnalyticsRevenueRow {
  key?: string;
  id?: string;
  label?: string;
  plan_key?: string | null;
  payments: number;
  companies?: number;
  captured_minor: number;
  last_payment_at?: string | null;
  share?: number | null;
  count?: number;
}

export interface AnalyticsRevenue {
  range: AnalyticsRange;
  comparison: AnalyticsRange | null;
  primary_currency: string | null;
  totals: {
    captured_minor: number;
    refunded_minor: number;
    net_minor: number;
    payments: number;
    failed_payments: number;
    paying_companies: number;
    average_payment_minor: number;
    arpu_minor: number | null;
    revenue_per_day_minor: number | null;
    first_payment_at: string | null;
    last_payment_at: string | null;
  };
  deltas: Record<string, AnalyticsDelta> | null;
  by_bucket: {
    bucket: string;
    payments: number;
    captured_minor: number;
    refunded_minor: number;
    companies: number;
  }[];
  by_plan: AnalyticsRevenueRow[];
  by_billing_cycle: AnalyticsRevenueRow[];
  by_method: AnalyticsRevenueRow[];
  by_currency: AnalyticsRevenueRow[];
  by_mode: AnalyticsRevenueRow[];
  top_payers: AnalyticsRevenueRow[];
  subscriptions: {
    by_plan: AnalyticsBreakdownRow[];
    periods_by_payment_status: AnalyticsBreakdownRow[];
    periods_by_source: AnalyticsBreakdownRow[];
    expiring_within_days: number;
    expiring_soon: number;
    overdue: number;
  };
}

export interface AnalyticsOptionRow {
  id: string;
  name?: string;
  label?: string;
  key?: string;
  status?: string;
  is_active?: boolean;
  company_id?: string;
  waba_account_id?: string;
  created_at?: string;
}

/**
 * The filter bar's vocabulary, served by the API.
 *
 * Presets and granularities arrive from the backend rather than being declared
 * here: the server validates against its own list, and a second copy in the
 * client is a list that eventually disagrees.
 */
export interface AnalyticsFilterOptions {
  companies: AnalyticsOptionRow[];
  plans: AnalyticsOptionRow[];
  waba_accounts: AnalyticsOptionRow[];
  phone_numbers: AnalyticsOptionRow[];
  presets: { value: DatePreset; label: string; requires_dates: boolean }[];
  granularities: { value: Granularity; label: string }[];
  message_statuses: MessageStatus[];
  message_types: string[];
  company_statuses: string[];
  template_statuses: string[];
  template_categories: string[];
  payment_statuses: string[];
  billing_cycles: string[];
  razorpay_modes: string[];
  company_sort_fields: string[];
}

/** Query parameters shared by every analytics endpoint. */
export interface AnalyticsQueryParams {
  preset?: DatePreset;
  date_from?: string;
  date_to?: string;
  timezone?: string;
  granularity?: Granularity;
  company_ids?: string[];
  company_statuses?: string[];
  statuses?: MessageStatus[];
  message_types?: string[];
  waba_account_ids?: string[];
  phone_number_ids?: string[];
  template_ids?: string[];
  plan_ids?: string[];
  search?: string;
  only_active_companies?: boolean;
  limit?: number;
}

export interface AnalyticsCompanyParams extends AnalyticsQueryParams {
  page?: number;
  pageSize?: number;
  sort_by?: string;
  sort_order?: string;
  include_silent?: boolean;
}

export interface AnalyticsRevenueParams extends AnalyticsQueryParams {
  payment_mode?: string;
}
