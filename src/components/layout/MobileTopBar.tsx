'use client';

import { Menu } from 'lucide-react';
import { ENV } from '@/constants';
import { Button } from '@/components/ui/button';

interface MobileTopBarProps {
  onOpenMenu: () => void;
}

export function MobileTopBar({ onOpenMenu }: MobileTopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-base font-semibold text-primary">{ENV.APP_NAME}</span>
      </div>
    </header>
  );
}
