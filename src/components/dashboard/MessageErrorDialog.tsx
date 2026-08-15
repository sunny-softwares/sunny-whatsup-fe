'use client';

import { UI_MESSAGES } from '@/constants';
import type { MessageLog } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ErrorPayload = MessageLog['error_payload'];

/**
 * Pulls a human-readable reason out of a message log's error_payload, which
 * comes in two shapes: a Meta error object (send-time failure) or an array of
 * Meta error entries (webhook-reported failure). Both shapes may carry
 * error_data.details, message, and/or title — in decreasing order of clarity.
 */
export function extractMessageErrorReason(payload: ErrorPayload): string | null {
  const entry = Array.isArray(payload) ? payload[0] : payload;
  if (!entry || typeof entry !== 'object') return null;
  const errorData = entry.error_data;
  const details =
    errorData && typeof errorData === 'object'
      ? (errorData as Record<string, unknown>).details
      : undefined;
  const reason = [details, entry.message, entry.title].find(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );
  return reason ?? null;
}

interface MessageErrorDialogProps {
  log: MessageLog | null;
  onClose: () => void;
}

export function MessageErrorDialog({ log, onClose }: MessageErrorDialogProps) {
  const reason = extractMessageErrorReason(log?.error_payload);

  return (
    <Dialog open={!!log} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.MESSAGE_ERROR.DIALOG_TITLE}</DialogTitle>
          <DialogDescription className="mt-1">
            {UI_MESSAGES.MESSAGE_ERROR.DIALOG_SUBTITLE}
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-3">
          <p className="text-sm">
            {reason ?? UI_MESSAGES.MESSAGE_ERROR.UNKNOWN_REASON}
          </p>
          {log?.error_payload ? (
            <div className="min-w-0 space-y-1">
              <p className="text-xs text-muted-foreground">{UI_MESSAGES.MESSAGE_ERROR.RAW_LABEL}</p>
              <pre className="min-w-0 max-h-64 overflow-auto rounded-md border bg-muted p-3 text-xs leading-relaxed">
                {JSON.stringify(log.error_payload, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {UI_MESSAGES.API_TOKEN.DONE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
