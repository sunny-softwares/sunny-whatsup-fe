'use client';

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
import { WebhookCopyButton } from '@/components/webhooks/WebhookCopyButton';

const M = UI_MESSAGES.WEBHOOKS;

interface WebhookSecretDialogProps {
  // The plaintext secret to show; the dialog is open while it is set.
  secret: string | null;
  title: string;
  onClose: () => void;
}

/** Shows a signing secret once, with a copy button — same pattern as API tokens. */
export function WebhookSecretDialog({ secret, title, onClose }: WebhookSecretDialogProps) {
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
          {secret ? <WebhookCopyButton value={secret} /> : null}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>{M.DONE}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
