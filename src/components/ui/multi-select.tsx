'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  /** Second line in the list — a company name, a status, anything qualifying. */
  hint?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Word shown in the summary: "3 companies". Falls back to "selected". */
  noun?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A filter dropdown that selects several options at once.
 *
 * The closed state shows a SUMMARY ("3 companies") rather than a row of chips.
 * Chips are the obvious design and the wrong one here: the analytics filter bar
 * holds six of these side by side, and a control that grows with its selection
 * reflows the whole bar every time someone picks another company.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  noun,
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const toggle = (optionValue: string) => {
    onChange(
      selected.has(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  };

  // One selection names itself; several are counted, because listing them is
  // what makes the control grow.
  const summary =
    value.length === 0
      ? null
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? `1 ${noun ?? 'selected'}`)
        : `${value.length} ${noun ?? 'selected'}`;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center gap-1 rounded-md border border-input bg-background px-3 text-left text-sm',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', !summary && 'text-muted-foreground')}>
          {summary ?? placeholder}
        </span>
        {value.length > 0 && !disabled ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={UI_MESSAGES.COMMON.CLEAR_SELECTION}
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.stopPropagation();
              e.preventDefault();
              onChange([]);
            }}
            className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full min-w-[14rem] rounded-md border bg-background shadow-md">
          {options.length > 8 ? (
            <div className="border-b p-2">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={UI_MESSAGES.COMMON.SEARCH}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          ) : null}

          <div role="listbox" aria-multiselectable className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                {UI_MESSAGES.COMMON.NO_MATCHES}
              </p>
            ) : (
              filtered.map((option) => {
                const isSelected = selected.has(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(option.value)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                      )}
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.hint ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.hint}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
