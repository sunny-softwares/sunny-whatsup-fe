'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { SORT_ORDER, type SortOrder } from '@/constants';
import { cn } from '@/lib/utils';
import { TableHead } from '@/components/ui/table';

interface SortState {
  by: string;
  order: SortOrder;
}

interface SortableHeaderProps {
  label: string;
  field: string;
  sort: SortState;
  onSort: (field: string) => void;
  className?: string;
}

// A table header that toggles sorting for its column. Clicking an inactive column
// sorts it ascending; clicking the active column flips the direction.
export function SortableHeader({ label, field, sort, onSort, className }: SortableHeaderProps) {
  const active = sort.by === field;
  const Icon = !active ? ChevronsUpDown : sort.order === SORT_ORDER.ASC ? ArrowUp : ArrowDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground',
          active && 'text-foreground',
        )}
      >
        {label}
        <Icon className="h-3.5 w-3.5 shrink-0" />
      </button>
    </TableHead>
  );
}

// Computes the next sort state when a column header is clicked.
export function nextSort(current: SortState, field: string): SortState {
  if (current.by !== field) return { by: field, order: SORT_ORDER.ASC };
  return {
    by: field,
    order: current.order === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC,
  };
}
