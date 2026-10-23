'use client';

import type { TooltipProps } from 'recharts';
import { formatCount } from '@/lib/analytics';

export interface TooltipRow {
  name: string;
  value: number | null;
  color?: string;
  /** Overrides the default thousands-separated number. */
  display?: string;
}

interface ChartTooltipProps extends TooltipProps<number, string> {
  /** Turns the hovered payload into the rows to show, in display order. */
  rows?: (payload: Record<string, unknown>) => TooltipRow[];
  /** Heading for the hovered point — usually the formatted bucket label. */
  title?: (payload: Record<string, unknown>) => string;
  /** Appended under the rows: a total, a rate, a caveat. */
  footer?: (payload: Record<string, unknown>) => string | null;
}

/**
 * The tooltip every chart on this dashboard uses.
 *
 * Shared rather than configured per chart because a tooltip is where a reader
 * checks a number they are about to act on: the series swatch, the label and
 * the value must line up the same way everywhere, or two charts on one screen
 * read as two different products.
 *
 * Values come straight from the hovered row, so the tooltip never re-derives a
 * rate the API already computed.
 */
export function ChartTooltip({ active, payload, rows, title, footer }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const datum = (payload[0].payload ?? {}) as Record<string, unknown>;

  const items: TooltipRow[] = rows
    ? rows(datum)
    : payload.map((entry) => ({
        name: String(entry.name ?? ''),
        value: typeof entry.value === 'number' ? entry.value : null,
        color: entry.color,
      }));

  const heading = title?.(datum);
  const note = footer?.(datum);

  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-md">
      {heading ? <p className="mb-1.5 font-medium text-foreground">{heading}</p> : null}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            {item.color ? (
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            ) : null}
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums text-foreground">
              {item.display ?? formatCount(item.value)}
            </span>
          </li>
        ))}
      </ul>
      {note ? <p className="mt-1.5 border-t pt-1.5 text-muted-foreground">{note}</p> : null}
    </div>
  );
}
