'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { buildSendMessageCurl, mediaHeaderCurlHint } from '@/lib/curl';
import { pickErrorMessage } from '@/lib/utils';
import type { MessageTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CurlDialogProps {
  template: MessageTemplate | null;
  companyId: string;
  onClose: () => void;
}

const isNotFound = (err: unknown) =>
  (err as { response?: { status?: number } })?.response?.status === 404;

/**
 * Shows a ready-to-run curl command for sending a message with the given
 * template through the external (API token) send-message endpoint. The
 * company's API token is fetched via the audit-logged reveal endpoint; when
 * the company has no token yet, the dialog says so instead.
 */
export function CurlDialog({ template, companyId, onClose }: CurlDialogProps) {
  const [curl, setCurl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!template) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setCurl(null);
      setNotice(null);
      setError(null);
      setCopied(false);
      try {
        const res = await superAdminApi.revealCompanyApiToken(companyId);
        if (cancelled) return;
        if (!res.data.token) {
          setNotice(UI_MESSAGES.API_TOKEN.NOT_REVEALABLE);
          return;
        }
        setCurl(buildSendMessageCurl({ token: res.data.token, template }));
      } catch (err) {
        if (cancelled) return;
        if (isNotFound(err)) {
          setNotice(UI_MESSAGES.CURL.NO_TOKEN);
        } else {
          setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [template, companyId]);

  const handleCopy = async () => {
    if (!curl) return;
    try {
      await navigator.clipboard.writeText(curl);
      setCopied(true);
    } catch {
      // Clipboard unavailable — the command stays visible for manual copying.
    }
  };

  return (
    <Dialog open={!!template} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.CURL.TITLE}</DialogTitle>
          {curl ? (
            <DialogDescription className="mt-1">{UI_MESSAGES.CURL.HINT}</DialogDescription>
          ) : null}
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
        ) : notice ? (
          <p className="text-sm text-muted-foreground">{notice}</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : curl ? (
          <div className="min-w-0 space-y-2">
            <div className="flex min-w-0 items-start gap-2">
              <pre className="min-w-0 flex-1 overflow-x-auto rounded-md border bg-muted p-3 text-xs leading-relaxed">
                {curl}
              </pre>
              <Button variant="outline" size="sm" className="shrink-0" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" /> {UI_MESSAGES.API_TOKEN.COPIED}
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> {UI_MESSAGES.API_TOKEN.COPY}
                  </>
                )}
              </Button>
            </div>
            {template && mediaHeaderCurlHint(template) ? (
              <p className="text-xs text-muted-foreground">{mediaHeaderCurlHint(template)}</p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {UI_MESSAGES.API_TOKEN.DONE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
