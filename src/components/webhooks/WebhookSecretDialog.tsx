'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const M = UI_MESSAGES.WEBHOOKS;
const COPIED_RESET_MS = 2000;

interface WebhookSecretDialogProps {
  // The plaintext secret to show; the dialog is open while it is set.
  secret: string | null;
  title: string;
  onClose: () => void;
}

/** Shows a signing secret once, with a copy button — same pattern as API tokens. */
export function WebhookSecretDialog({ secret, title, onClose }: WebhookSecretDialogProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [secret]);

  const handleCopy = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <Dialog open={!!secret} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-1">{M.SECRET_DIALOG_HINT}</DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-2">
          <code className="min-w-0 flex-1 break-all rounded-md border bg-muted p-3 text-xs">
            {secret}
          </code>
          <Button variant="outline" size="sm" className="shrink-0" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" /> {M.COPIED}
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> {M.COPY}
              </>
            )}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>{M.DONE}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
