'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import type { Pagination as PaginationMeta } from '@/types';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  pagination: PaginationMeta;
  itemCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ pagination, itemCount, onPageChange, disabled }: PaginationProps) {
  const { page, totalPages, total } = pagination;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <span className="text-muted-foreground">{UI_MESSAGES.PAGINATION.SHOWING(itemCount, total)}</span>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{UI_MESSAGES.PAGINATION.PAGE_OF(page, Math.max(totalPages, 1))}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || !canPrev}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {UI_MESSAGES.PAGINATION.PREV}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || !canNext}
          >
            {UI_MESSAGES.PAGINATION.NEXT}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
