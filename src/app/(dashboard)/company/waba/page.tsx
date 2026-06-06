'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Unlink } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { companyApi } from '@/lib/api/company.api';
import { templateApi } from '@/lib/api/template.api';
import { pickErrorMessage, formatDate, cn } from '@/lib/utils';
import type { WabaAccount } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetaEmbeddedSignupButton } from '@/components/meta/MetaEmbeddedSignupButton';
import { ManualTokenForm } from '@/components/meta/ManualTokenForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type ConnectMode = 'embedded' | 'manual';

interface PurgePreview {
  templates: number;
  messages: number;
  phone_numbers: number;
}

export default function WabaPage() {
  const [waba, setWaba] = useState<WabaAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<ConnectMode>('embedded');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [purgePreview, setPurgePreview] = useState<PurgePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await companyApi.getWaba();
      setWaba(res.data);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleEmbeddedConnect = async ({ code, wabaId }: { code: string; wabaId?: string }) => {
    setBusy(true);
    setError(null);
    setPurgeResult(null);
    try {
      await companyApi.connectWaba({ code, waba_id: wabaId });
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const handleManualConnect = async ({
    access_token,
    waba_id,
  }: {
    access_token: string;
    waba_id: string;
  }) => {
    setBusy(true);
    setError(null);
    setPurgeResult(null);
    try {
      await companyApi.connectWaba({ access_token, waba_id });
      await load();
    } catch (err) {
      const message = pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR);
      setError(message);
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  };

  const openDisconnectDialog = async () => {
    setError(null);
    setPurgeResult(null);
    setConfirmOpen(true);
    setPreviewLoading(true);
    try {
      const [templates, messages] = await Promise.all([
        templateApi.list({ pageSize: 1 }),
        companyApi.listMessages({ pageSize: 1 }),
      ]);
      setPurgePreview({
        templates: templates.meta?.pagination?.total ?? templates.data?.length ?? 0,
        messages: messages.meta?.pagination?.total ?? messages.data?.length ?? 0,
        phone_numbers: waba?.phoneNumbers?.length ?? 0,
      });
    } catch {
      setPurgePreview({
        templates: 0,
        messages: 0,
        phone_numbers: waba?.phoneNumbers?.length ?? 0,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await companyApi.disconnectWaba();
      const p = res.data.purged;
      setPurgeResult(
        `Disconnected. Purged ${p.templates_count} template(s), ${p.messages_count} message(s), ${p.phone_numbers_count} phone number(s).`,
      );
      setConfirmOpen(false);
      setPurgePreview(null);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const isConnected = waba?.status === 'connected';

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.COMPANY.WABA_TITLE}
        description={UI_MESSAGES.COMPANY.CONNECT_WABA_HINT}
      />

      {purgeResult ? (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          {purgeResult}
        </div>
      ) : null}

      {loading ? <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p> : null}

      {!loading && !isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Meta WhatsApp Business Account</CardTitle>
            <CardDescription>
              Use Embedded Signup for production, or paste a System User token for sandbox / local
              testing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="inline-flex flex-wrap rounded-md border bg-muted p-1">
              <button
                type="button"
                onClick={() => setMode('embedded')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === 'embedded'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Embedded Signup
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === 'manual'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Sandbox / Manual token
              </button>
            </div>

            {mode === 'embedded' ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Launches the Meta JS SDK. Your Meta app must have the WhatsApp product enabled and a
                  WhatsApp Embedded Signup configuration created.
                </p>
                <MetaEmbeddedSignupButton onSuccess={handleEmbeddedConnect} disabled={busy} />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>
            ) : (
              <ManualTokenForm onSubmit={handleManualConnect} disabled={busy} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {!loading && isConnected && waba ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    <span className="truncate">{waba.business_name || waba.waba_id}</span>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  </CardTitle>
                  <CardDescription className="break-all">WABA ID: {waba.waba_id}</CardDescription>
                </div>
                <Badge variant="success" className="self-start sm:self-auto">
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Connected at</p>
                <p className="text-sm font-medium">{formatDate(waba.connected_at)}</p>
              </div>
              <div className="sm:text-right">
                <Button
                  variant="destructive"
                  onClick={openDisconnectDialog}
                  disabled={busy}
                  className="w-full sm:w-auto"
                >
                  <Unlink className="mr-2 h-4 w-4" /> Disconnect & purge
                </Button>
              </div>
              {error ? <p className="col-span-full text-sm text-destructive">{error}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Phone numbers</CardTitle>
            </CardHeader>
            <CardContent>
              {waba.phoneNumbers && waba.phoneNumbers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Display</TableHead>
                      <TableHead>Phone Number ID</TableHead>
                      <TableHead>Verified name</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Default</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waba.phoneNumbers.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.display_phone_number}</TableCell>
                        <TableCell className="text-muted-foreground">{p.phone_number_id}</TableCell>
                        <TableCell>{p.verified_name ?? '—'}</TableCell>
                        <TableCell>{p.quality_rating ?? '—'}</TableCell>
                        <TableCell>{p.is_default ? <Badge variant="success">Default</Badge> : null}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No phone numbers found for this WABA yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        destructive
        loading={busy}
        title="Disconnect this Meta WABA?"
        description={
          <div className="space-y-2">
            <p>
              This permanently removes all data associated with this WABA. Once disconnected, it will
              not appear anywhere in the UI again.
            </p>
            <div className="rounded-md border bg-muted/50 p-3 text-xs">
              <div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
                Will be deleted
              </div>
              {previewLoading ? (
                <p className="text-muted-foreground">Calculating…</p>
              ) : (
                <ul className="space-y-0.5">
                  <li>· {purgePreview?.templates ?? 0} message template(s)</li>
                  <li>· {purgePreview?.messages ?? 0} message log(s)</li>
                  <li>· {purgePreview?.phone_numbers ?? 0} phone number(s)</li>
                  <li>· The WABA connection itself</li>
                </ul>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              A snapshot is archived to{' '}
              <code className="rounded bg-muted px-1">data_archive_events</code> for developer audit.
              Primary records are hard-deleted.
            </p>
          </div>
        }
        confirmLabel="Yes, disconnect and delete everything"
        cancelLabel="Cancel"
        onConfirm={handleDisconnect}
      />
    </>
  );
}
