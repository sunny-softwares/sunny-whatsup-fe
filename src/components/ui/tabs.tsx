'use client';

import { cn } from '@/lib/utils';

export interface TabOption<T extends string> {
  value: T;
  label: string;
  /** Rendered after the label, for a count or a warning marker. */
  badge?: React.ReactNode;
}

interface TabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * A horizontal tab strip.
 *
 * Built on native buttons with the WAI-ARIA tab roles rather than pulling in a
 * headless tab library: the panels here are independent sections that each
 * fetch their own data, so there is nothing for a library's focus management
 * and panel registry to coordinate.
 *
 * Scrolls horizontally rather than wrapping, so a narrow screen shows a
 * partially visible tab — the affordance that says "there are more" — instead
 * of a second row that pushes the content down.
 */
export function Tabs<T extends string>({ options, value, onChange, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn('flex gap-1 overflow-x-auto border-b', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors',
              // The active marker is a border on the button itself, so it sits
              // exactly on the container's own border line.
              'border-b-2 -mb-px',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
            {option.badge ? <span className="ml-1.5">{option.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
