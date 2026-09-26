'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import {
  PHONE_CODE_VERIFICATION_STATUS,
  PHONE_PLATFORM_TYPE,
  UI_MESSAGES,
} from '@/constants';
import { pickErrorMessage, cn } from '@/lib/utils';
import type {
  AddPhoneEmbeddedResult,
  DisconnectWabaResult,
  PhoneNumber,
  SyncAllWabasResult,
  WabaAccount,
  WabaAccountSummary,
} from '@/types';
import type {
  AddPhoneEmbeddedPayload,
  AddPhoneNumberPayload,
  ConnectWabaPayload,
} from '@/lib/api/company.api';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetaEmbeddedSignupButton } from '@/components/meta/MetaEmbeddedSignupButton';
import { ManualTokenForm } from '@/components/meta/ManualTokenForm';
import {
  AddPhoneDialog,
  type AddPhoneMethod,
  VerifyPhoneDialog,
  RegisterPhoneDialog,
} from '@/components/dashboard/PhoneActionDialogs';
import { WabaAccountCard } from '@/components/dashboard/WabaAccountCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ConnectMode = 'embedded' | 'manual';

// Data source for the WABA view. Both the company admin (acting on its own
// tenant) and the super admin (acting on a selected company) provide their own
// implementation, so the same UI drives both.
//
// A company can hold several WABAs; exactly one is active (sending, templates
// and media go through it).
export interface WabaViewApi {
  listWabas: () => Promise<{ data: WabaAccountSummary[] }>;
  connectWaba: (payload: ConnectWabaPayload) => Promise<{ data: WabaAccount }>;
  // Refreshes every WABA (metadata + phone numbers/statuses) from Meta.
  syncAll: () => Promise<{ data: SyncAllWabasResult }>;
  // The per-WABA actions return the refreshed WABA list.
  syncWaba: (wabaAccountId: string) => Promise<{ data: WabaAccountSummary[] }>;
  activateWaba: (wabaAccountId: string) => Promise<{ data: WabaAccountSummary[] }>;
  disconnectWaba: (wabaAccountId: string) => Promise<{ data: DisconnectWabaResult }>;
  // Adds a number to a WABA on Meta (OTP flow); returns that refreshed WABA.
  addPhoneNumber: (payload: AddPhoneNumberPayload) => Promise<{ data: WabaAccount | null }>;
  // Adds number(s) via Embedded Signup — the path for WhatsApp Business app
  // numbers (coexistence). Meta may place them on a new WABA.
  addPhoneEmbedded: (payload: AddPhoneEmbeddedPayload) => Promise<{ data: AddPhoneEmbeddedResult }>;
  setDefaultPhone: (phoneId: string) => Promise<{ data: WabaAccount | null }>;
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

const wabaName = (w: Pick<WabaAccount, 'business_name' | 'waba_id'>) =>
  w.business_name || w.waba_id;

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

  const [wabas, setWabas] = useState<WabaAccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Any account-level action in flight; blocks the other actions.
  const [busy, setBusy] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [mode, setMode] = useState<ConnectMode>('embedded');
  const [connectAnotherOpen, setConnectAnotherOpen] = useState(false);

  const [activateTarget, setActivateTarget] = useState<WabaAccountSummary | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<WabaAccountSummary | null>(null);
  const [addPhoneTarget, setAddPhoneTarget] = useState<WabaAccountSummary | null>(null);
  const [defaultTarget, setDefaultTarget] = useState<PhoneNumber | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<PhoneNumber | null>(null);
  const [registerTarget, setRegisterTarget] = useState<PhoneNumber | null>(null);

  const activeWaba = wabas.find((w) => w.is_active) ?? null;
  const locked = busy || syncingAll || !!syncingId;

  const resetMessages = () => {
    setError(null);
    setNotice(null);
  };

  const refresh = useCallback(async () => {
    const res = await apiRef.current.listWabas();
    setWabas(res.data ?? []);
  }, []);

  const load = useCallback(async () => {
    if (!ready) {
      setWabas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      await refresh();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
    // reloadKey re-fetches when the selected company changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reloadKey, refresh]);

  useEffect(() => {
    load();
  }, [load]);

  // Runs an account-level action with shared busy / error handling.
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    resetMessages();
    try {
      await action();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const connectAndReport = async (payload: ConnectWabaPayload) => {
    const res = await apiRef.current.connectWaba(payload);
    await refresh();
    setNotice(
      res.data?.is_active
        ? UI_MESSAGES.WABA_ACCOUNTS.CONNECTED_ACTIVE
        : UI_MESSAGES.WABA_ACCOUNTS.CONNECTED_INACTIVE(wabaName(res.data)),
    );
  };

  const handleEmbeddedConnect = ({ code, wabaId }: { code: string; wabaId?: string }) =>
    run(async () => {
      await connectAndReport({ code, waba_id: wabaId });
      setConnectAnotherOpen(false);
    });

  const handleManualConnect = async ({
    access_token,
    waba_id,
  }: {
    access_token: string;
    waba_id: string;
  }) => {
    setBusy(true);
    resetMessages();
    try {
      await connectAndReport({ access_token, waba_id });
    } catch (err) {
      const message = pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR);
      setError(message);
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    resetMessages();
    try {
      const res = await apiRef.current.syncAll();
      setWabas(res.data.wabas);
      if (res.data.failures.length > 0) {
        const names = res.data.failures.map((f) => f.business_name || f.waba_id).join(', ');
        setError(`${UI_MESSAGES.WABA_ACCOUNTS.SYNC_FAILURES(names)} ${res.data.failures[0].message}`);
      } else {
        setNotice(UI_MESSAGES.WABA_ACCOUNTS.SYNCED_ALL);
      }
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncOne = async (waba: WabaAccountSummary) => {
    setSyncingId(waba.id);
    resetMessages();
    try {
      const res = await apiRef.current.syncWaba(waba.id);
      setWabas(res.data);
      setNotice(UI_MESSAGES.WABA_ACCOUNTS.SYNCED_ONE(wabaName(waba)));
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setSyncingId(null);
    }
  };

  const handleActivate = () => {
    const target = activateTarget;
    if (!target) return;
    return run(async () => {
      const res = await apiRef.current.activateWaba(target.id);
      setWabas(res.data);
      setNotice(UI_MESSAGES.WABA_ACCOUNTS.ACTIVATED(wabaName(target)));
    }).finally(() => setActivateTarget(null));
  };

  const handleDisconnect = () => {
    const target = disconnectTarget;
    if (!target) return;
    return run(async () => {
      const res = await apiRef.current.disconnectWaba(target.id);
      const p = res.data.purged;
      await refresh();
      const summary = UI_MESSAGES.WABA_ACCOUNTS.DISCONNECTED(
        p.templates_count,
        p.messages_count,
        p.phone_numbers_count,
      );
      setNotice(
        res.data.new_active_waba_account_id
          ? `${summary} ${UI_MESSAGES.WABA_ACCOUNTS.PROMOTED}`
          : summary,
      );
    }).finally(() => setDisconnectTarget(null));
  };

  const handleSetDefault = () => {
    const target = defaultTarget;
    if (!target) return;
    return run(async () => {
      await apiRef.current.setDefaultPhone(target.id);
      await refresh();
      setNotice(UI_MESSAGES.PHONE.DEFAULT_UPDATED);
    }).finally(() => setDefaultTarget(null));
  };

  const handlePhoneVerified = async () => {
    await load();
    setNotice(UI_MESSAGES.PHONE.VERIFIED_SUCCESS);
  };

  const handlePhoneRegistered = async () => {
    await load();
    setNotice(UI_MESSAGES.PHONE.REGISTERED_SUCCESS);
  };

  // OTP numbers come back unverified: open the verify dialog for the new one
  // right away so onboarding continues without hunting for it in the table.
  // App (coexistence) numbers are already active, but Meta may have put them
  // on a separate WABA — say so, since it then needs activating.
  const handlePhoneAdded = async (result: unknown, method: AddPhoneMethod) => {
    resetMessages();
    if (method === 'app') {
      const { waba, new_waba } = (result as { data: AddPhoneEmbeddedResult }).data;
      await refresh();
      setNotice(
        new_waba
          ? UI_MESSAGES.PHONE.EMBEDDED_NEW_WABA(wabaName(waba))
          : UI_MESSAGES.PHONE.EMBEDDED_ADDED_SUCCESS,
      );
      return;
    }

    const previousIds = new Set((addPhoneTarget?.phoneNumbers ?? []).map((p) => p.id));
    const next = (result as { data?: WabaAccount | null })?.data ?? null;
    const added = next?.phoneNumbers?.find((p) => !previousIds.has(p.id));
    await refresh();
    setNotice(UI_MESSAGES.PHONE.ADDED_SUCCESS);
    if (
      added &&
      added.platform_type !== PHONE_PLATFORM_TYPE.CLOUD_API &&
      added.platform_type !== PHONE_PLATFORM_TYPE.ON_PREMISE &&
      added.code_verification_status !== PHONE_CODE_VERIFICATION_STATUS.VERIFIED
    ) {
      setVerifyTarget(added);
    }
  };

  const hasWabas = wabas.length > 0;

  const connectForm = (
    <div className="space-y-6">
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
    </div>
  );

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          ready && !loading && hasWabas ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetMessages();
                  setConnectAnotherOpen(true);
                }}
                disabled={locked}
              >
                <Plus className="mr-2 h-4 w-4" /> {UI_MESSAGES.WABA_ACCOUNTS.CONNECT_ANOTHER}
              </Button>
              <Button variant="outline" onClick={handleSyncAll} disabled={locked}>
                <RefreshCw className={cn('mr-2 h-4 w-4', syncingAll && 'animate-spin')} />
                {syncingAll ? UI_MESSAGES.COMPANY.WABA_SYNCING : UI_MESSAGES.WABA_ACCOUNTS.SYNC_ALL}
              </Button>
            </div>
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
          {notice ? (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
              {notice}
            </div>
          ) : null}

          {error && hasWabas ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {loading ? <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p> : null}

          {!loading && !hasWabas ? (
            <Card>
              <CardHeader>
                <CardTitle>Connect Meta WhatsApp Business Account</CardTitle>
              </CardHeader>
              <CardContent>{connectForm}</CardContent>
            </Card>
          ) : null}

          {!loading && hasWabas ? (
            <div className="space-y-6">
              {!activeWaba ? (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
                  {UI_MESSAGES.WABA_ACCOUNTS.NO_ACTIVE}
                </div>
              ) : null}
              {wabas.map((w) => (
                <WabaAccountCard
                  key={w.id}
                  waba={w}
                  disabled={locked}
                  syncing={syncingId === w.id}
                  onActivate={() => setActivateTarget(w)}
                  onSync={() => handleSyncOne(w)}
                  onDisconnect={() => setDisconnectTarget(w)}
                  onAddPhone={() => setAddPhoneTarget(w)}
                  onSetDefault={setDefaultTarget}
                  onVerify={setVerifyTarget}
                  onRegister={setRegisterTarget}
                />
              ))}
            </div>
          ) : null}
        </>
      )}

      <Dialog
        open={connectAnotherOpen}
        onOpenChange={(next) => (busy || next ? null : setConnectAnotherOpen(false))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{UI_MESSAGES.WABA_ACCOUNTS.CONNECT_ANOTHER_TITLE}</DialogTitle>
            <DialogDescription className="mt-1">
              {UI_MESSAGES.WABA_ACCOUNTS.CONNECT_ANOTHER_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          {connectForm}
        </DialogContent>
      </Dialog>

      <AddPhoneDialog
        open={!!addPhoneTarget}
        onClose={() => setAddPhoneTarget(null)}
        addPhone={(payload) =>
          apiRef.current.addPhoneNumber({ ...payload, waba_account_id: addPhoneTarget?.id })
        }
        addPhoneEmbedded={(payload) => apiRef.current.addPhoneEmbedded(payload)}
        targetWabaName={addPhoneTarget ? wabaName(addPhoneTarget) : undefined}
        defaultDisplayName={addPhoneTarget?.business_name ?? undefined}
        onAdded={handlePhoneAdded}
      />

      <ConfirmDialog
        open={!!activateTarget}
        onOpenChange={(next) => (busy || next ? null : setActivateTarget(null))}
        loading={busy}
        title={UI_MESSAGES.WABA_ACCOUNTS.ACTIVATE_TITLE}
        description={
          activateTarget ? (
            <div className="space-y-2">
              <p>
                {UI_MESSAGES.WABA_ACCOUNTS.ACTIVATE_DESCRIPTION(
                  wabaName(activateTarget),
                  activeWaba ? wabaName(activeWaba) : null,
                )}
              </p>
              <p className="text-xs">{UI_MESSAGES.WABA_ACCOUNTS.ACTIVATE_TEMPLATES_NOTE}</p>
            </div>
          ) : null
        }
        confirmLabel={UI_MESSAGES.WABA_ACCOUNTS.ACTIVATE_CONFIRM}
        cancelLabel={UI_MESSAGES.COMMON.CANCEL}
        onConfirm={handleActivate}
      />

      <ConfirmDialog
        open={!!defaultTarget}
        onOpenChange={(next) => (busy || next ? null : setDefaultTarget(null))}
        loading={busy}
        title={UI_MESSAGES.PHONE.SET_DEFAULT_TITLE}
        description={
          <div className="space-y-2">
            <p className="font-medium text-foreground">{defaultTarget?.display_phone_number}</p>
            <p>{UI_MESSAGES.PHONE.SET_DEFAULT_DESCRIPTION}</p>
            {defaultTarget && defaultTarget.platform_type !== PHONE_PLATFORM_TYPE.CLOUD_API ? (
              <p className="text-amber-700">{UI_MESSAGES.PHONE.SET_DEFAULT_NOT_READY}</p>
            ) : null}
          </div>
        }
        confirmLabel={UI_MESSAGES.PHONE.SET_DEFAULT_CONFIRM}
        cancelLabel={UI_MESSAGES.COMMON.CANCEL}
        onConfirm={handleSetDefault}
      />

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
        open={!!disconnectTarget}
        onOpenChange={(next) => (busy || next ? null : setDisconnectTarget(null))}
        destructive
        loading={busy}
        title={
          disconnectTarget
            ? UI_MESSAGES.WABA_ACCOUNTS.DISCONNECT_TITLE(wabaName(disconnectTarget))
            : ''
        }
        description={
          <div className="space-y-2">
            <p>
              This permanently removes all data associated with this WABA. Once disconnected, it will
              not appear anywhere in the UI again.
            </p>
            {disconnectTarget?.is_active ? (
              <p className="text-amber-700">{UI_MESSAGES.WABA_ACCOUNTS.DISCONNECT_ACTIVE_NOTE}</p>
            ) : null}
            <div className="rounded-md border bg-muted/50 p-3 text-xs">
              <div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
                Will be deleted
              </div>
              <ul className="space-y-0.5">
                <li>· {disconnectTarget?.templates_count ?? 0} message template(s)</li>
                <li>· {disconnectTarget?.messages_count ?? 0} message log(s)</li>
                <li>· {disconnectTarget?.phoneNumbers?.length ?? 0} phone number(s)</li>
                <li>· The WABA connection itself</li>
              </ul>
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
