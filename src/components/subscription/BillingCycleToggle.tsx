'use client';

import {
  BILLING_CYCLE,
  BILLING_CYCLE_LABEL,
  BILLING_CYCLE_VALUES,
  UI_MESSAGES,
  type BillingCycle,
} from '@/constants';
import { cn } from '@/lib/utils';

interface BillingCycleToggleProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  /** Advertised on the yearly option when there is a real saving. */
  savingPercent?: number | null;
  disabled?: boolean;
}

export function BillingCycleToggle({
  value,
  onChange,
  savingPercent,
  disabled,
}: BillingCycleToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={UI_MESSAGES.SUBSCRIPTION.CYCLE_LABEL}
      className="inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1"
    >
      {BILLING_CYCLE_VALUES.map((cycle) => {
        const active = cycle === value;
        const showSaving = cycle === BILLING_CYCLE.YEARLY && !!savingPercent;

        return (
          <button
            key={cycle}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(cycle)}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              'disabled:pointer-events-none disabled:opacity-50',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {BILLING_CYCLE_LABEL[cycle]}
            {showSaving ? (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                {UI_MESSAGES.SUBSCRIPTION.SAVE_PERCENT(savingPercent as number)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
