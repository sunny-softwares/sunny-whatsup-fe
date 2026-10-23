'use client';

import { useMemo } from 'react';
import { HEATMAP_RAMP, HOURS_IN_DAY_DISPLAY, UI_MESSAGES } from '@/constants';
import { formatCount, heatmapColor } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalyticsHeatmapCell } from '@/types';

interface ActivityHeatmapProps {
  cells: AnalyticsHeatmapCell[];
  timezone: string;
}

const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/**
 * Weekday × hour activity grid.
 *
 * The API returns all 168 cells including the zeros, so this renders a complete
 * grid rather than inferring one — a heatmap with holes in it is unreadable,
 * and inferring the missing cells client-side is how the grid and the totals
 * start to disagree.
 *
 * Every cell carries its count in a `title`, and a value scale sits beneath, so
 * the exact number is always recoverable from a shade.
 */
export function ActivityHeatmap({ cells, timezone }: ActivityHeatmapProps) {
  const { rows, max } = useMemo(() => {
    const byDay = new Map<number, { label: string; hours: Map<number, number> }>();
    let highest = 0;

    for (const cell of cells) {
      if (!byDay.has(cell.iso)) byDay.set(cell.iso, { label: cell.label, hours: new Map() });
      byDay.get(cell.iso)!.hours.set(cell.hour, cell.count);
      if (cell.count > highest) highest = cell.count;
    }

    return {
      rows: [...byDay.entries()]
        .sort(([a], [b]) => a - b)
        .map(([iso, day]) => ({ iso, label: day.label, hours: day.hours })),
      max: highest,
    };
  }, [cells]);

  const hours = Array.from({ length: HOURS_IN_DAY_DISPLAY }, (_, hour) => hour);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{UI_MESSAGES.ANALYTICS.HEATMAP_TITLE}</CardTitle>
        <CardDescription>
          {UI_MESSAGES.ANALYTICS.HEATMAP_HINT} · {timezone}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[44rem]">
            <div className="flex gap-1 pl-10">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-[10px] text-muted-foreground"
                  aria-hidden
                >
                  {/* Every third label only — 24 two-digit labels in a row
                      collide at any width this grid fits in. */}
                  {hour % 3 === 0 ? String(hour).padStart(2, '0') : ''}
                </div>
              ))}
            </div>

            <div className="mt-1 space-y-1">
              {rows.map((row) => (
                <div key={row.iso} className="flex items-center gap-1">
                  <div className="w-10 shrink-0 text-xs text-muted-foreground">{row.label}</div>
                  {hours.map((hour) => {
                    const count = row.hours.get(hour) ?? 0;
                    return (
                      <div
                        key={hour}
                        title={`${row.label} ${formatHour(hour)} — ${formatCount(count)}`}
                        className="h-6 flex-1 rounded-[3px] border border-border/40"
                        style={{ backgroundColor: heatmapColor(count, max) }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>0</span>
          {HEATMAP_RAMP.map((color) => (
            <span
              key={color}
              aria-hidden
              className="h-3 w-5 rounded-[2px] border border-border/40"
              style={{ backgroundColor: color }}
            />
          ))}
          <span>{formatCount(max)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
