'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, RefreshCw, Unlink } from 'lucide-react';
import {
  PHONE_CODE_VERIFICATION_STATUS,
  PHONE_PLATFORM_TYPE,
  UI_MESSAGES,
} from '@/constants';
import { pickErrorMessage, formatDate, cn } from '@/lib/utils';
import type {
  MessageListParams,
  Pagination as PaginationMeta,
  PhoneNumber,
  TemplateListParams,
  WabaAccount,
} from '@/types';
import type { ConnectWabaPayload } from '@/lib/api/company.api';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetaEmbeddedSignupButton } from '@/components/meta/MetaEmbeddedSignupButton';
import { ManualTokenForm } from '@/components/meta/ManualTokenForm';
import {
  VerifyPhoneDialog,
  RegisterPhoneDialog,
} from '@/components/dashboard/PhoneActionDialogs';
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

interface DisconnectPurged {
  templates_count: number;
  messages_count: number;
  phone_numbers_count: number;
}

// Data source for the WABA view. Both the company admin (acting on its own
// tenant) and the super admin (acting on a selected company) provide their own
// implementation, so the same UI drives both.
export interface WabaViewApi {
  getWaba: () => Promise<{ data: WabaAccount | null }>;
  connectWaba: (payload: ConnectWabaPayload) => Promise<unknown>;
  disconnectWaba: () => Promise<{ data: { purged: DisconnectPurged } }>;
  // Refreshes the WABA metadata + phone number list/statuses from Meta.
  syncWaba: () => Promise<{ data: WabaAccount | null }>;
  listTemplates: (
    params: TemplateListParams,
  ) => Promise<{ data: unknown[]; meta?: { pagination?: PaginationMeta } }>;
  listMessages: (
    params: MessageListParams,
  ) => Promise<{ data: unknown[]; meta?: { pagination?: PaginationMeta } }>;
  // Phone number ownership verification + Cloud API registration.
  requestPhoneCode: (phoneId: string, codeMethod: string) => Promise<unknown>;
  verifyPhoneCode: (phoneId: string, code: string) => Promise<unknown>;
  registerPhone: (phoneId: string, pin: string) => Promise<unknown>;
}

interface WabaViewProps {
  title: string;
  description?: string;
  api: WabaViewApi;
  // When false, fetching is skipped and notReadyMessage is shown (e.g. super
  // admin before a company is chosen). Defaults to true.
  ready?: boolean;
  notReadyMessage?: string;
  // Changing this re-fetches (e.g. the selected companyId).
  reloadKey?: string;
  // Extra control rendered above the content (e.g. company selector).
  toolbarStart?: React.ReactNode;
}

export function WabaView({
  title,
  description,
  api,
  ready = true,
  notReadyMessage,
  reloadKey,
  toolbarStart,
}: WabaViewProps) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const [waba, setWaba] = useState<WabaAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mode, setMode] = useState<ConnectMode>('embedded');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [purgePreview, setPurgePreview] = useState<PurgePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  // Phone number being verified / registered via the action dialogs.
  const [verifyTarget, setVerifyTarget] = useState<PhoneNumber | null>(null);
  const [registerTarget, setRegisterTarget] = useState<PhoneNumber | null>(null);
  const [phoneActionResult, setPhoneActionResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ready) {
      setWaba(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setPurgeResult(null);
    setPhoneActionResult(null);
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

  const handleEmbeddedConnect = async ({ code, wabaId }: { code: string; wabaId?: string }) => {
    setBusy(true);
    setError(null);
    setPurgeResult(null);
    try {
      await apiRef.current.connectWaba({ code, waba_id: wabaId });
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
      await apiRef.current.connectWaba({ access_token, waba_id });
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
        apiRef.current.listTemplates({ pageSize: 1 }),
        apiRef.current.listMessages({ pageSize: 1 }),
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
      const res = await apiRef.current.disconnectWaba();
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

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setPurgeResult(null);
    setPhoneActionResult(null);
    try {
      const res = await apiRef.current.syncWaba();
      setWaba(res.data);
      setPhoneActionResult(UI_MESSAGES.COMPANY.WABA_SYNCED);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setSyncing(false);
    }
  };

  const handlePhoneVerified = async () => {
    await load();
    setPhoneActionResult(UI_MESSAGES.PHONE.VERIFIED_SUCCESS);
  };

  const handlePhoneRegistered = async () => {
    await load();
    setPhoneActionResult(UI_MESSAGES.PHONE.REGISTERED_SUCCESS);
  };

  // Cloud API onboarding state of a phone number. Registered numbers need no
  // action. Unregistered ones always get Register — coexistence numbers
  // (verified via the WhatsApp Business app QR scan) never reach a VERIFIED
  // code_verification_status, so gating Register behind it would strand them;
  // Meta enforces its own prerequisites on the register call.
  //
  // Verify (SMS/voice) is hidden for app-held numbers (platform_type
  // ON_PREMISE): completing that flow is the classic dedicated-number takeover
  // and would kick the number off the WhatsApp Business app.
  const renderRegistrationCell = (p: PhoneNumber) => {
    if (p.platform_type === PHONE_PLATFORM_TYPE.CLOUD_API) {
      return <Badge variant="success">{UI_MESSAGES.PHONE.REGISTERED}</Badge>;
    }
    const isAppHeld = p.platform_type === PHONE_PLATFORM_TYPE.ON_PREMISE;
    const needsVerify =
      !isAppHeld && p.code_verification_status !== PHONE_CODE_VERIFICATION_STATUS.VERIFIED;
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          {needsVerify ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setVerifyTarget(p)}
              disabled={busy || syncing}
            >
              {UI_MESSAGES.PHONE.VERIFY}
            </Button>
          ) : null}
          <Button size="sm" onClick={() => setRegisterTarget(p)} disabled={busy || syncing}>
            {UI_MESSAGES.PHONE.REGISTER}
          </Button>
        </div>
        {isAppHeld ? (
          <p className="text-xs text-muted-foreground">{UI_MESSAGES.PHONE.APP_LINKED}</p>
        ) : null}
      </div>
    );
  };

  const isConnected = waba?.status === 'connected';

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          ready && !loading && isConnected ? (
            <Button variant="outline" onClick={handleSync} disabled={syncing || busy}>
              <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
              {syncing ? UI_MESSAGES.COMPANY.WABA_SYNCING : UI_MESSAGES.COMPANY.WABA_SYNC}
            </Button>
          ) : null
        }
      />

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
          {purgeResult ? (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
              {purgeResult}
            </div>
          ) : null}

          {phoneActionResult ? (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
              {phoneActionResult}
            </div>
          ) : null}

          {loading ? <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p> : null}

          {!loading && !isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle>Connect Meta WhatsApp Business Account</CardTitle>
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
                </div>

                {mode === 'embedded' ? (
                  <div className="space-y-3">
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
                      <CardDescription className="break-all">
                        WABA ID: {waba.waba_id}
                      </CardDescription>
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
                  {error ? (
                    <p className="col-span-full text-sm text-destructive">{error}</p>
                  ) : null}
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
                          <TableHead>{UI_MESSAGES.PHONE.COL_REGISTRATION}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {waba.phoneNumbers.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.display_phone_number}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {p.phone_number_id}
                            </TableCell>
                            <TableCell>{p.verified_name ?? '—'}</TableCell>
                            <TableCell>{p.quality_rating ?? '—'}</TableCell>
                            <TableCell>
                              {p.is_default ? <Badge variant="success">Default</Badge> : null}
                            </TableCell>
                            <TableCell>{renderRegistrationCell(p)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No phone numbers found for this WABA yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </>
      )}

      <VerifyPhoneDialog
        phone={verifyTarget}
        onClose={() => setVerifyTarget(null)}
        requestCode={(phoneId, codeMethod) => apiRef.current.requestPhoneCode(phoneId, codeMethod)}
        verifyCode={(phoneId, code) => apiRef.current.verifyPhoneCode(phoneId, code)}
        onVerified={handlePhoneVerified}
      />

      <RegisterPhoneDialog
        phone={registerTarget}
        onClose={() => setRegisterTarget(null)}
        registerPhone={(phoneId, pin) => apiRef.current.registerPhone(phoneId, pin)}
        onRegistered={handlePhoneRegistered}
      />

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
