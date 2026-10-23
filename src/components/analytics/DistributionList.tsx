'use client';

import { UI_MESSAGES } from '@/constants';
import { categoricalColor, formatCount, formatPercent } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface DistributionItem {
  id: string;
  label: string;
  hint?: string;
  value: number;
  share: number | null;
  /** Fixes the bar colour — used where the category already owns one. */
  color?: string;
}

interface DistributionListProps {
  title: string;
  description?: string;
  items: DistributionItem[];
  /** Appended to each value, e.g. "msgs". */
  unit?: string;
  /** Colour every bar from the categorical palette rather than one accent. */
  colorful?: boolean;
}

/**
 * A ranked list of categories as labelled horizontal bars.
 *
 * Chosen over a pie or donut deliberately: these lists are read to compare
 * magnitudes and to find a name, and a bar whose length encodes the value does
 * both — where a pie makes the reader compare angles and hunt a legend. The
 * value and its share are printed beside every row, so nothing depends on
 * judging a length by eye.
 *
 * Bars are measured against the LARGEST item, not against the total, so the
 * second-place row is still visible when one category dominates.
 */
export function DistributionList({
  title,
  description,
  items,
  unit,
  colorful = false,
}: DistributionListProps) {
  const max = items.reduce((best, item) => Math.max(best, item.value), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item, index) => {
              const color =
                item.color ?? (colorful ? categoricalColor(index) : undefined) ?? 'hsl(var(--primary))';
              return (
                <li key={item.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      {item.label}
                      {item.hint ? (
                        <span className="ml-1.5 text-xs text-muted-foreground">{item.hint}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatCount(item.value)}
                      {unit ? <span className="ml-1 text-muted-foreground">{unit}</span> : null}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatPercent(item.share)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${max ? Math.max((item.value / max) * 100, item.value > 0 ? 2 : 0) : 0}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
