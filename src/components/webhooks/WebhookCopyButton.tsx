'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const M = UI_MESSAGES.WEBHOOKS;
const COPIED_RESET_MS = 2000;

interface WebhookCopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/**
 * Copies a value and confirms with "Copied!" for a moment. If the clipboard is
 * unavailable nothing changes; the value stays on screen to copy by hand.
 */
export function WebhookCopyButton({ value, label = M.COPY, className }: WebhookCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new value starts un-copied; a pending reset never fires after unmount.
  useEffect(() => {
    setCopied(false);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn('shrink-0', className)}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="mr-1.5 h-3.5 w-3.5" /> {M.COPIED}
        </>
      ) : (
        <>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> {label}
        </>
      )}
    </Button>
  );
}
