'use client';

import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { EMPTY_METRIC } from '@/constants';
import { deltaTone, formatSignedPercent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { AnalyticsDelta } from '@/types';

interface MetricCardProps {
  label: string;
  value: string;
  /** Qualifies the number: the denominator, the window, the caveat. */
  hint?: string;
  delta?: AnalyticsDelta | null;
  /** False for metrics where a rise is bad news — failures, failure rate. */
  higherIsBetter?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: 'default' | 'success' | 'warning' | 'destructive' | 'muted';
}

const accentMap = {
  default: 'text-foreground',
  success: 'text-green-700',
  warning: 'text-yellow-700',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
};

const toneMap = {
  positive: 'text-green-700',
  negative: 'text-destructive',
  neutral: 'text-muted-foreground',
};

/**
 * One number, with its change against the comparison window.
 *
 * The delta carries an arrow as well as a colour, so the direction survives
 * both colour blindness and a greyscale print — colour alone is never the only
 * thing saying "this went down".
 */
export function MetricCard({
  label,
  value,
  hint,
  delta,
  higherIsBetter = true,
  icon: Icon,
  accent = 'default',
}: MetricCardProps) {
  const tone = deltaTone(delta?.change_pct, higherIsBetter);
  const DeltaIcon =
    !delta || delta.change_pct === null || delta.change_pct === 0
      ? ArrowRight
      : delta.change_pct > 0
        ? ArrowUpRight
        : ArrowDownRight;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground" /> : null}
        </div>

        <p className={cn('mt-2 text-2xl font-bold tabular-nums', accentMap[accent])}>{value}</p>

        {delta ? (
          <p className={cn('mt-1 flex items-center gap-1 text-xs', toneMap[tone])}>
            <DeltaIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular-nums">{formatSignedPercent(delta.change_pct)}</span>
            <span className="text-muted-foreground">vs previous</span>
          </p>
        ) : null}

        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint || EMPTY_METRIC}</p> : null}
      </CardContent>
    </Card>
  );
}
