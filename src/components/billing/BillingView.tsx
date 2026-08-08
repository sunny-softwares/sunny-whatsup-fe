'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { BILLING_LINKS, UI_MESSAGES } from '@/constants';
import { pickErrorMessage } from '@/lib/utils';
import type { WabaAccount } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Data source for the billing view. The company admin reads its own WABA; the
// super admin reads the selected company's — same UI drives both.
export interface BillingViewApi {
  getWaba: () => Promise<{ data: WabaAccount | null }>;
}

interface BillingViewProps {
  title: string;
  description?: string;
  api: BillingViewApi;
  // When false, fetching is skipped and notReadyMessage is shown (e.g. super
  // admin before a company is chosen). Defaults to true.
  ready?: boolean;
  notReadyMessage?: string;
  // Changing this re-fetches (e.g. the selected companyId).
  reloadKey?: string;
  // Extra control rendered above the content (e.g. company selector).
  toolbarStart?: React.ReactNode;
}

/**
 * Billing hand-off view.
 *
 * Meta publishes no Graph API for a WABA's outstanding balance, payment method,
 * or billing cycle, so this page holds no billing data of its own and stores
 * nothing. It only reads the connected WABA ID so the Billing Hub link can be
 * pinned to that exact account instead of dropping the user on whichever
 * business portfolio Meta happens to show them.
 */
export function BillingView({
  title,
  description,
  api,
  ready = true,
  notReadyMessage,
  reloadKey,
  toolbarStart,
}: BillingViewProps) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const [waba, setWaba] = useState<WabaAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ready) {
      setWaba(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiRef.current.getWaba();
      setWaba(res.data);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
    // reloadKey re-fetches when the selected company changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reloadKey]);

  useEffect(() => {
    load();
  }, [load]);

  const wabaId = waba?.waba_id ?? null;
  // Without a connected WABA there is no asset to pin the link to, so fall back
  // to the plain Billing Hub rather than sending a broken asset_id.
  const href = wabaId ? BILLING_LINKS.metaBillingHubForWaba(wabaId) : BILLING_LINKS.META_BILLING_HUB;

  return (
    <div>
      <PageHeader title={title} description={description} />

      {toolbarStart ? (
        <Card className="mb-4">
          <CardContent className="flex flex-wrap items-end gap-3 p-4">{toolbarStart}</CardContent>
        </Card>
      ) : null}

      {!ready ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            {notReadyMessage ?? UI_MESSAGES.COMMON.EMPTY}
          </CardContent>
        </Card>
      ) : (
        <>
          {error ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{UI_MESSAGES.BILLING.CARD_TITLE}</CardTitle>
              <CardDescription>{UI_MESSAGES.BILLING.CARD_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
              ) : (
                <>
                  {wabaId ? (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {UI_MESSAGES.BILLING.WABA_ID_LABEL}
                      </span>{' '}
                      <span className="font-medium">{wabaId}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {UI_MESSAGES.BILLING.NO_WABA}
                    </p>
                  )}

                  <Button asChild>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {UI_MESSAGES.BILLING.OPEN_BUTTON}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
