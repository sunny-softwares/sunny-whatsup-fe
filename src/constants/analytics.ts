import { MESSAGE_STATUS, type MessageStatus } from './statuses';

/**
 * Super-admin analytics: display configuration only.
 *
 * What is deliberately NOT here: the date presets, the granularities and the
 * filter option lists. Those are served by `/super-admin/analytics/filters`,
 * because the backend validates against its own copy and a second list in the
 * client is a list that will eventually disagree with it.
 */

// ---------------------------------------------------------------------------
// Chart colours
//
// Five status colours and eight categorical slots, all checked against the
// light chart surface for: the lightness band, a chroma floor, adjacent-pair
// separation under deuteranopia and tritanopia, a normal-vision floor, and 3:1
// contrast against the surface. The worst adjacent pair in each set clears the
// ΔE 8 CVD target and the ΔE 15 normal-vision floor.
//
// Substituting a colour by eye is how that property gets lost — re-check any
// change rather than assuming a similar-looking hex behaves the same.
// ---------------------------------------------------------------------------

/**
 * One colour per delivery status, in lifecycle order.
 *
 * Deliberately NOT a green-to-green ramp: `delivered` and `read` are the two
 * values most often compared, and two greens are the pair a red-green colour
 * blind reader cannot separate at all.
 */
export const STATUS_COLOR: Record<MessageStatus, string> = {
  [MESSAGE_STATUS.QUEUED]: '#D97706',
  [MESSAGE_STATUS.SENT]: '#0891B2',
  [MESSAGE_STATUS.DELIVERED]: '#4F46E5',
  [MESSAGE_STATUS.READ]: '#15803D',
  [MESSAGE_STATUS.FAILED]: '#DC2626',
};

/** Lifecycle order — how statuses stack in a chart and read in a legend. */
export const STATUS_ORDER: MessageStatus[] = [
  MESSAGE_STATUS.QUEUED,
  MESSAGE_STATUS.SENT,
  MESSAGE_STATUS.DELIVERED,
  MESSAGE_STATUS.READ,
  MESSAGE_STATUS.FAILED,
];

export const STATUS_LABEL: Record<MessageStatus, string> = {
  [MESSAGE_STATUS.QUEUED]: 'Queued',
  [MESSAGE_STATUS.SENT]: 'Sent',
  [MESSAGE_STATUS.DELIVERED]: 'Delivered',
  [MESSAGE_STATUS.READ]: 'Read',
  [MESSAGE_STATUS.FAILED]: 'Failed',
};

/**
 * Categorical slots for breakdowns with no inherent colour (plans, methods,
 * companies). Assigned BY POSITION and never cycled: a ninth series folds into
 * "Other" rather than reusing slot 1, so two different things are never the
 * same colour on one chart.
 */
export const CATEGORICAL_COLORS = [
  '#15803D',
  '#4F46E5',
  '#D97706',
  '#0891B2',
  '#BE185D',
  '#65A30D',
  '#7C3AED',
  '#C2410C',
] as const;

/** Single-hue ramp for the activity heatmap, light → dark. */
export const HEATMAP_RAMP = [
  '#F0FDF4',
  '#DCFCE7',
  '#BBF7D0',
  '#86EFAC',
  '#4ADE80',
  '#22C55E',
  '#16A34A',
  '#15803D',
] as const;

/** Recessive chart furniture, so the data stays the loudest thing on screen. */
export const CHART_INK = {
  GRID: 'hsl(var(--border))',
  AXIS: 'hsl(var(--muted-foreground))',
  COMPARISON: 'hsl(var(--muted-foreground))',
  SURFACE: 'hsl(var(--card))',
} as const;

export const CHART_HEIGHT = {
  COMPACT: 220,
  DEFAULT: 300,
  TALL: 380,
} as const;

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

export const ANALYTICS_TAB = {
  OVERVIEW: 'overview',
  TRENDS: 'trends',
  AVERAGES: 'averages',
  COMPANIES: 'companies',
  BREAKDOWN: 'breakdown',
  GROWTH: 'growth',
  FAILURES: 'failures',
  REVENUE: 'revenue',
} as const;
export type AnalyticsTab = (typeof ANALYTICS_TAB)[keyof typeof ANALYTICS_TAB];

export const ANALYTICS_TABS: { value: AnalyticsTab; label: string }[] = [
  { value: ANALYTICS_TAB.OVERVIEW, label: 'Overview' },
  { value: ANALYTICS_TAB.TRENDS, label: 'Trends' },
  { value: ANALYTICS_TAB.AVERAGES, label: 'Averages' },
  { value: ANALYTICS_TAB.COMPANIES, label: 'Companies' },
  { value: ANALYTICS_TAB.BREAKDOWN, label: 'Breakdowns' },
  { value: ANALYTICS_TAB.GROWTH, label: 'Growth' },
  { value: ANALYTICS_TAB.FAILURES, label: 'Failures' },
  { value: ANALYTICS_TAB.REVENUE, label: 'Revenue' },
];

/**
 * The window the dashboard opens on. A rolling month is long enough to show a
 * trend and short enough that an idle day stands out.
 */
export const DEFAULT_ANALYTICS_PRESET = 'last_30_days';
export const CUSTOM_PRESET = 'custom';
export const ALL_TIME_PRESET = 'all_time';

/** Rows per page on the company leaderboard. */
export const ANALYTICS_PAGE_SIZE = 20;

/** Rows in each "top N" list. */
export const ANALYTICS_TOP_N = 10;

export const COMPANY_ANALYTICS_SORT_FIELD = {
  TOTAL: 'total',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
  FAILURE_RATE: 'failure_rate',
  DELIVERY_RATE: 'delivery_rate',
  AVG_PER_DAY: 'avg_per_day',
  ACTIVE_DAYS: 'active_days',
  LAST_MESSAGE_AT: 'last_message_at',
  NAME: 'name',
  CREATED_AT: 'created_at',
} as const;
export type CompanyAnalyticsSortField =
  (typeof COMPANY_ANALYTICS_SORT_FIELD)[keyof typeof COMPANY_ANALYTICS_SORT_FIELD];

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Compact notation for axis ticks and tiles: 27610 → "27.6K".
 *
 * Locale-driven rather than a hand-rolled divide-and-suffix, so the thresholds
 * and the suffixes are the ones the viewer's locale actually uses.
 */
export const COMPACT_NUMBER_FORMAT: Intl.NumberFormatOptions = {
  notation: 'compact',
  maximumFractionDigits: 1,
};

export const DECIMAL_FORMAT: Intl.NumberFormatOptions = {
  maximumFractionDigits: 2,
};

/** Shown where a metric has no meaningful value (no base to divide by). */
export const EMPTY_METRIC = '—';

/** Columns in the activity heatmap — one per hour of the day. */
export const HOURS_IN_DAY_DISPLAY = 24;

/**
 * Bucket labels are local wall-clock strings with no zone, so they must be read
 * as local time — which is what `new Date('2026-10-18T00:00:00')` does. Adding
 * a `Z` would shift every label by the viewer's offset, and the chart would
 * disagree with the date range printed above it.
 */
export const BUCKET_TICK_FORMAT: Record<string, Intl.DateTimeFormatOptions> = {
  hour: { hour: 'numeric', hour12: true },
  day: { day: '2-digit', month: 'short' },
  week: { day: '2-digit', month: 'short' },
  month: { month: 'short', year: '2-digit' },
  quarter: { month: 'short', year: '2-digit' },
  year: { year: 'numeric' },
};

/** Long form for tooltips, where there is room to be unambiguous. */
export const BUCKET_TOOLTIP_FORMAT: Record<string, Intl.DateTimeFormatOptions> = {
  hour: { day: '2-digit', month: 'short', hour: 'numeric', hour12: true },
  day: { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' },
  week: { day: '2-digit', month: 'short', year: 'numeric' },
  month: { month: 'long', year: 'numeric' },
  quarter: { month: 'long', year: 'numeric' },
  year: { year: 'numeric' },
};
