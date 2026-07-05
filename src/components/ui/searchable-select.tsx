'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // When true (default) a selected value can be cleared back to "".
  clearable?: boolean;
  className?: string;
}

/**
 * Combobox: a dropdown whose options are filtered by typing. Used wherever a
 * single company (or similar entity) must be picked from a long list.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  clearable = true,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Close when clicking outside the component.
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

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex h-10 w-full items-center gap-1 rounded-md border border-input bg-background px-3 text-sm',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          // While closed the input mirrors the selection; typing switches it
          // to filter mode and opens the list.
          value={open ? query : selected?.label ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              setQuery('');
              inputRef.current?.blur();
            }
            if (e.key === 'Enter' && open && filtered.length === 1) {
              e.preventDefault();
              select(filtered[0].value);
            }
          }}
          className="h-full w-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {clearable && value && !disabled ? (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
            aria-label={UI_MESSAGES.COMMON.CLEAR_SELECTION}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          onClick={() => {
            if (disabled) return;
            setOpen((prev) => !prev);
            if (!open) inputRef.current?.focus();
          }}
        />
      </div>

      {open ? (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-background py-1 shadow-md">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {UI_MESSAGES.COMMON.NO_MATCHES}
            </p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => select(option.value)}
                className={cn(
                  'block w-full truncate px-3 py-2 text-left text-sm hover:bg-muted',
                  option.value === value && 'bg-primary/10 font-medium text-primary',
                )}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
