import {
  BUCKET_TICK_FORMAT,
  BUCKET_TOOLTIP_FORMAT,
  CATEGORICAL_COLORS,
  COMPACT_NUMBER_FORMAT,
  DATE_FORMAT,
  DECIMAL_FORMAT,
  EMPTY_METRIC,
  HEATMAP_RAMP,
} from '@/constants';
import type { AnalyticsRange } from '@/types';

/**
 * Formatting helpers for the analytics dashboard.
 *
 * The one rule worth stating: a null metric is rendered as a dash, never as
 * zero. The API returns null where a rate has no base to divide by — nobody
 * sent anything — and showing "0% delivered" there reads as a catastrophe
 * rather than as silence.
 */

export const formatCount = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? EMPTY_METRIC
    : value.toLocaleString(DATE_FORMAT.LOCALE);

/** Compact form for axis ticks and tight tiles: 27610 → "27.6K". */
export const formatCompact = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? EMPTY_METRIC
    : value.toLocaleString(DATE_FORMAT.LOCALE, COMPACT_NUMBER_FORMAT);

export const formatDecimal = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? EMPTY_METRIC
    : value.toLocaleString(DATE_FORMAT.LOCALE, DECIMAL_FORMAT);

export const formatPercent = (value: number | null | undefined): string =>
  value === null || value === undefined ? EMPTY_METRIC : `${formatDecimal(value)}%`;

/** Signed percentage for a delta chip: +14.6%, −3.2%, or a dash. */
export const formatSignedPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return EMPTY_METRIC;
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatDecimal(value)}%`;
};

/**
 * Reads a bucket key as LOCAL time.
 *
 * Buckets arrive as zone-free wall-clock strings (`2026-10-18T00:00:00`)
 * already resolved into the window's timezone by the server. `new Date` reads
 * exactly that as local time, which is what we want. Appending a `Z` would
 * re-interpret it as UTC and shift every label by the viewer's offset — making
 * the chart disagree with the date range printed directly above it.
 */
const parseBucket = (bucket: string): Date | null => {
  const date = new Date(bucket);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatBucketWith = (
  bucket: string,
  granularity: string | undefined,
  table: Record<string, Intl.DateTimeFormatOptions>,
): string => {
  const date = parseBucket(bucket);
  if (!date) return bucket;
  const options = table[granularity ?? 'day'] ?? table.day;
  return new Intl.DateTimeFormat(DATE_FORMAT.LOCALE, options).format(date);
};

/** Short label for an axis tick. */
export const formatBucketTick = (bucket: string, granularity?: string): string =>
  formatBucketWith(bucket, granularity, BUCKET_TICK_FORMAT);

/** Unambiguous label for a tooltip, where there is room for it. */
export const formatBucketLabel = (bucket: string, granularity?: string): string =>
  formatBucketWith(bucket, granularity, BUCKET_TOOLTIP_FORMAT);

/** "19 Sep 2026 — 18 Oct 2026", or the preset's own label for all-time. */
export const formatRangeLabel = (range: AnalyticsRange | null | undefined): string => {
  if (!range) return EMPTY_METRIC;
  const asDate = (value: string | null) => {
    if (!value) return null;
    const date = parseBucket(value);
    return date ? new Intl.DateTimeFormat(DATE_FORMAT.LOCALE, DATE_FORMAT.OPTIONS).format(date) : value;
  };
  const from = asDate(range.from_date);
  const to = asDate(range.to_date);
  if (!from) return to ? `Up to ${to}` : range.label;
  return from === to ? from : `${from} — ${to}`;
};

/**
 * Colour for the Nth categorical series.
 *
 * Indexes past the palette return undefined rather than wrapping around: a
 * cycled palette gives two different things the same colour, which is worse
 * than no colour at all. Callers fold the tail into an "Other" row.
 */
export const categoricalColor = (index: number): string | undefined =>
  CATEGORICAL_COLORS[index];

/**
 * Heatmap step for a value against the grid's own maximum.
 *
 * Scaled by the square root rather than linearly: message volume is heavily
 * skewed — one business hour dwarfs the night — and a linear scale paints 160
 * of the 168 cells the same palest shade.
 */
export const heatmapColor = (count: number, max: number): string => {
  if (!max || count <= 0) return HEATMAP_RAMP[0];
  const ratio = Math.sqrt(count / max);
  const index = Math.min(HEATMAP_RAMP.length - 1, Math.ceil(ratio * (HEATMAP_RAMP.length - 1)));
  return HEATMAP_RAMP[index];
};

/**
 * Whether a metric going UP is good news.
 *
 * Needed because the delta chip colours itself, and more failures rising green
 * would be an actively misleading screen.
 */
export const deltaTone = (
  changePct: number | null | undefined,
  higherIsBetter: boolean,
): 'positive' | 'negative' | 'neutral' => {
  if (changePct === null || changePct === undefined || changePct === 0) return 'neutral';
  const rising = changePct > 0;
  return rising === higherIsBetter ? 'positive' : 'negative';
};
