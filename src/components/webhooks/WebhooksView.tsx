'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Eye,
  Info,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCw,
  Trash2,
} from 'lucide-react';
import {
  UI_MESSAGES,
  WEBHOOK_DELIVERY_STATUS,
  WEBHOOK_DISABLED_REASON,
  WEBHOOK_ENDPOINT_STATUS,
  WEBHOOK_ENDPOINT_STATUS_LABEL,
  WEBHOOK_ENDPOINT_STATUS_VARIANT,
} from '@/constants';
import { cn, formatDateTime, pickErrorMessage } from '@/lib/utils';
import type { WebhookApi } from '@/lib/api/webhook.api';
import type {
  WebhookDelivery,
  WebhookDeliverySummary,
  WebhookEndpoint,
  WebhookOverview,
} from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WebhookDeliveriesTable } from '@/components/webhooks/WebhookDeliveriesTable';
import { WebhookDeliveryDialog } from '@/components/webhooks/WebhookDeliveryDialog';
import { WebhookSecretDialog } from '@/components/webhooks/WebhookSecretDialog';

const M = UI_MESSAGES.WEBHOOKS;
// How many deliveries the "Recent deliveries" card shows.
const RECENT_DELIVERIES_COUNT = 5;
const SECONDS_PER_MINUTE = 60;

interface WebhooksViewProps {
  title: string;
  description?: string;
  api: WebhookApi;
  // Where the full delivery log lives for this audience.
  deliveriesHref: string;
  // When false nothing is fetched and notReadyMessage shows (super admin with
  // no company chosen). Defaults to true.
  ready?: boolean;
  notReadyMessage?: string;
  // Changing it re-fetches (e.g. the selected companyId).
  reloadKey?: string;
  // Extra control above the content (e.g. the company selector).
  toolbarStart?: React.ReactNode;
  // Shown when the company's `webhooks` feature is off (super admin only — a
  // company admin cannot reach this page then).
  featureOffNotice?: React.ReactNode;
}

type SecretDialog = { secret: string; title: string } | null;

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

const pausedBody = (endpoint: WebhookEndpoint, overview: WebhookOverview) => {
  const date = formatDateTime(endpoint.disabled_at);
  if (endpoint.disabled_reason === WEBHOOK_DISABLED_REASON.GONE) return M.PAUSED_BODY_GONE(date);
  if (endpoint.disabled_reason === WEBHOOK_DISABLED_REASON.FAILURE_THRESHOLD) {
    return M.PAUSED_BODY_FAILURES(
      date,
      overview.delivery.disable_after_hours,
      overview.delivery.disable_after_failures,
    );
  }
  return M.PAUSED_BODY_MANUAL(date);
};

export function WebhooksView({
  title,
  description,
  api,
  deliveriesHref,
  ready = true,
  notReadyMessage,
  reloadKey,
  toolbarStart,
  featureOffNotice,
}: WebhooksViewProps) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const [overview, setOverview] = useState<WebhookOverview | null>(null);
  const [recent, setRecent] = useState<WebhookDeliverySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [url, setUrl] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  // Any other action in flight; disables the controls it could conflict with.
  const [busy, setBusy] = useState<string | null>(null);

  const [secretDialog, setSecretDialog] = useState<SecretDialog>(null);
  const [confirm, setConfirm] = useState<'rotate' | 'pause' | 'remove' | null>(null);
  const [testResult, setTestResult] = useState<WebhookDelivery | null>(null);
  const [openDeliveryId, setOpenDeliveryId] = useState<string | null>(null);

  const endpoint = overview?.endpoint ?? null;
  const verified = !!endpoint?.verified_at;
  const active = endpoint?.status === WEBHOOK_ENDPOINT_STATUS.ACTIVE;
  const paused = endpoint?.status === WEBHOOK_ENDPOINT_STATUS.DISABLED;
  const featureOn = overview?.feature_enabled ?? false;

  const loadRecent = useCallback(async (hasEndpoint: boolean) => {
    if (!hasEndpoint) {
      setRecent([]);
      return;
    }
    const res = await apiRef.current.listDeliveries({ page: 1, pageSize: RECENT_DELIVERIES_COUNT });
    setRecent(res.data ?? []);
  }, []);

  const refresh = useCallback(async () => {
    const res = await apiRef.current.getOverview();
    setOverview(res.data);
    setUrl(res.data.endpoint?.url ?? '');
    await loadRecent(!!res.data.endpoint);
    return res.data;
  }, [loadRecent]);

  const load = useCallback(async () => {
    setError(null);
    setNotice(null);
    setUrlError(null);
    if (!ready) {
      setOverview(null);
      setRecent([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await refresh();
    } catch (err) {
      setOverview(null);
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, [ready, refresh]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  // Runs an action, then refreshes the page state. Errors land in the banner.
  const run = async (key: string, action: () => Promise<unknown>, success?: string) => {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      await action();
      await refresh();
      if (success) setNotice(success);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      await refresh().catch(() => undefined);
    } finally {
      setBusy(null);
    }
  };

  const urlChanged = !endpoint || url.trim() !== endpoint.url;

  const handleSaveOrVerify = async () => {
    setVerifying(true);
    setUrlError(null);
    setError(null);
    setNotice(null);
    try {
      const res = urlChanged ? await api.saveUrl(url.trim()) : await api.verify();
      if (res.data.secret) {
        setSecretDialog({ secret: res.data.secret, title: M.SECRET_DIALOG_NEW_TITLE });
      }
      await refresh();
    } catch (err) {
      setUrlError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      // A first URL is kept (unverified) even when the check fails, so reload
      // to show it — but keep what the user typed in the box.
      const typed = url;
      await refresh().catch(() => undefined);
      setUrl(typed);
    } finally {
      setVerifying(false);
    }
  };

  const handleReveal = () =>
    run('reveal', async () => {
      const res = await api.revealSecret();
      setSecretDialog({ secret: res.data.secret, title: M.SECRET_DIALOG_TITLE });
    });

  const handleRotate = async () => {
    setConfirm(null);
    await run('rotate', async () => {
      const res = await api.rotateSecret();
      setSecretDialog({ secret: res.data.secret, title: M.SECRET_DIALOG_ROTATED_TITLE });
    });
  };

  const handleTest = () =>
    run('test', async () => {
      const res = await api.sendTest();
      setTestResult(res.data);
    });

  const handleToggleField = (field: string, subscribed: boolean) =>
    run(`field:${field}`, () => api.setField(field, subscribed));

  const handleResume = () => run('resume', () => api.enable(), M.RESUMED);

  const handlePause = async () => {
    setConfirm(null);
    await run('pause', () => api.disable());
  };

  const handleRemove = async () => {
    setConfirm(null);
    await run('remove', () => api.remove());
  };

  const testSucceeded = testResult?.status === WEBHOOK_DELIVERY_STATUS.SUCCEEDED;

  const header = (
    <PageHeader
      title={title}
      description={description}
      actions={
        ready && endpoint ? (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={deliveriesHref}>{M.LOG_TITLE}</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading || !!busy}>
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
              {UI_MESSAGES.COMMON.REFRESH}
            </Button>
          </>
        ) : null
      }
    />
  );

  if (!ready) {
    return (
      <>
        {header}
        {toolbarStart ? <div className="flex flex-wrap items-end gap-3">{toolbarStart}</div> : null}
        <Card>
          <CardContent className="p-6 text-muted-foreground">{notReadyMessage}</CardContent>
        </Card>
      </>
    );
  }

  const signing = overview?.signing;
  const toleranceMinutes = signing ? Math.round(signing.tolerance_seconds / SECONDS_PER_MINUTE) : 0;
  const firstField = overview?.fields[0]?.key ?? '';

  return (
    <>
      {header}
      {toolbarStart ? <div className="flex flex-wrap items-end gap-3">{toolbarStart}</div> : null}

      {loading && !overview ? (
        <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}

      {overview && !featureOn ? featureOffNotice : null}

      {overview && endpoint && paused ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">{M.PAUSED_TITLE}</p>
            <p className="opacity-90">{pausedBody(endpoint, overview)}</p>
          </div>
        </div>
      ) : null}

      {overview ? (
        <>
          {/* Callback URL */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {M.URL_TITLE}
                    {endpoint ? (
                      <Badge variant={WEBHOOK_ENDPOINT_STATUS_VARIANT[endpoint.status]}>
                        {WEBHOOK_ENDPOINT_STATUS_LABEL[endpoint.status]}
                      </Badge>
                    ) : (
                      <Badge variant="muted">{M.STATUS_NOT_SET_UP}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {endpoint ? M.URL_DESCRIPTION : M.URL_DESCRIPTION_EMPTY}
                  </CardDescription>
                </div>
                {endpoint ? (
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    {paused ? (
                      <Button size="sm" onClick={handleResume} disabled={!!busy || !featureOn}>
                        <Play className="mr-2 h-4 w-4" /> {M.RESUME}
                      </Button>
                    ) : null}
                    {active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirm('pause')}
                        disabled={!!busy}
                      >
                        <Pause className="mr-2 h-4 w-4" /> {M.PAUSE}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirm('remove')}
                      disabled={!!busy}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> {M.REMOVE}
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="webhook-url">{M.URL_LABEL}</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    inputMode="url"
                    value={url}
                    placeholder={M.URL_PLACEHOLDER}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setUrlError(null);
                    }}
                    disabled={verifying || !featureOn}
                    aria-invalid={!!urlError}
                    className={cn(urlError && 'border-destructive')}
                  />
                </div>
                <Button
                  onClick={handleSaveOrVerify}
                  disabled={verifying || !featureOn || !url.trim() || !!busy}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {M.VERIFYING}
                    </>
                  ) : urlChanged ? (
                    M.SAVE_AND_VERIFY
                  ) : (
                    M.VERIFY_AGAIN
                  )}
                </Button>
              </div>

              {verifying ? (
                <p className="text-sm text-muted-foreground">
                  {M.VERIFYING_HINT(overview.verification.timeout_seconds)}
                </p>
              ) : urlError ? (
                <p className="text-sm text-destructive">
                  {urlError}
                  {verified && urlChanged ? ` ${M.URL_KEPT_HINT}` : null}
                </p>
              ) : endpoint && !verified && endpoint.last_verification_error ? (
                <p className="text-sm text-destructive">{endpoint.last_verification_error}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{M.URL_HINT}</p>
              )}

              {endpoint && verified ? (
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label={M.STAT_VERIFIED} value={formatDateTime(endpoint.verified_at)} />
                  <Stat
                    label={M.STAT_LAST_SUCCESS}
                    value={endpoint.last_success_at ? formatDateTime(endpoint.last_success_at) : M.NEVER}
                  />
                  <Stat
                    label={M.STAT_LAST_24H}
                    value={M.STAT_LAST_24H_VALUE(
                      endpoint.stats?.succeeded_24h ?? 0,
                      endpoint.stats?.failed_24h ?? 0,
                    )}
                  />
                  {paused ? (
                    <Stat label={M.STAT_WAITING} value={endpoint.stats?.pending ?? 0} />
                  ) : (
                    <Stat label={M.STAT_FAILURES} value={endpoint.consecutive_failures} />
                  )}
                </dl>
              ) : null}

              {paused ? (
                <p className="text-sm text-muted-foreground">
                  {M.PAUSED_RESUME_HINT(overview.delivery.resume_window_hours)}
                </p>
              ) : null}

              {!endpoint ? (
                <div className="border-t pt-5">
                  <p className="mb-3 text-sm font-medium">{M.HOW_IT_STARTS_TITLE}</p>
                  <ol className="grid gap-4 sm:grid-cols-3">
                    {[
                      [
                        M.STEP_VERIFY_TITLE,
                        M.STEP_VERIFY_BODY(
                          overview.verification.challenge_param,
                          overview.verification.timeout_seconds,
                        ),
                      ],
                      [M.STEP_SECRET_TITLE, M.STEP_SECRET_BODY],
                      [M.STEP_FIELDS_TITLE, M.STEP_FIELDS_BODY(firstField)],
                    ].map(([stepTitle, body], index) => (
                      <li key={stepTitle} className="rounded-lg border p-4">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <p className="mt-3 text-sm font-medium">{stepTitle}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {verified && endpoint && signing ? (
            <>
              {/* Signing secret */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{M.SECRET_TITLE}</CardTitle>
                  <CardDescription>{M.SECRET_DESCRIPTION}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-md border bg-muted px-3 py-2.5 text-xs">
                      {endpoint.secret_hint}
                    </code>
                    <Button variant="outline" size="sm" onClick={handleReveal} disabled={!!busy}>
                      <Eye className="mr-2 h-4 w-4" /> {M.REVEAL}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirm('rotate')}
                      disabled={!!busy || !featureOn}
                    >
                      <RotateCw className="mr-2 h-4 w-4" /> {M.ROTATE}
                    </Button>
                  </div>
                  {endpoint.previous_secret_expires_at ? (
                    <p className="text-xs text-muted-foreground">
                      {M.SECRET_ROTATION_ACTIVE(formatDateTime(endpoint.previous_secret_expires_at))}
                    </p>
                  ) : endpoint.secret_rotated_at ? (
                    <p className="text-xs text-muted-foreground">
                      {M.SECRET_ROTATED_AT(formatDateTime(endpoint.secret_rotated_at))}
                    </p>
                  ) : null}
                  <div className="rounded-md border bg-muted/40 p-4">
                    <p className="mb-2 text-sm font-medium">{M.VERIFY_STEPS_TITLE}</p>
                    <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                      <li>{M.VERIFY_STEP_TIMESTAMP(signing.headers.TIMESTAMP, toleranceMinutes)}</li>
                      <li>{M.VERIFY_STEP_SIGN(signing.algorithm, signing.payload_separator)}</li>
                      <li>{M.VERIFY_STEP_COMPARE(signing.headers.SIGNATURE, signing.prefix)}</li>
                      <li>{M.VERIFY_STEP_DEDUPE(signing.headers.EVENT_ID)}</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Fields */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{M.FIELDS_TITLE}</CardTitle>
                  <CardDescription>{M.FIELDS_DESCRIPTION}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">{M.COL_FIELD}</TableHead>
                        <TableHead>{M.COL_WHAT}</TableHead>
                        <TableHead>{M.COL_TEST}</TableHead>
                        <TableHead className="pr-6">{M.COL_SUBSCRIPTION}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.fields.map((field) => {
                        const subscribed = endpoint.subscribed_fields.includes(field.key);
                        return (
                          <TableRow key={field.key}>
                            <TableCell className="pl-6">
                              <code className="text-xs font-semibold">{field.key}</code>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{field.description}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleTest}
                                disabled={!!busy || !featureOn}
                              >
                                {busy === 'test' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {M.TEST}
                              </Button>
                            </TableCell>
                            <TableCell className="pr-6">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={subscribed}
                                  onCheckedChange={(next) => handleToggleField(field.key, next)}
                                  disabled={!!busy || !featureOn}
                                  aria-label={M.SUBSCRIBE_ARIA(field.key)}
                                />
                                <span className="text-sm">
                                  {subscribed ? M.SUBSCRIBED : M.UNSUBSCRIBED}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {endpoint.subscribed_fields.length === 0 ? (
                    <p className="flex items-start gap-2 border-t px-6 py-3 text-sm text-muted-foreground">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                      {M.UNSUBSCRIBED_HINT}
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              {/* Recent deliveries */}
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div className="space-y-1.5">
                    <CardTitle className="text-base">{M.RECENT_TITLE}</CardTitle>
                    <CardDescription>{M.RECENT_DESCRIPTION(RECENT_DELIVERIES_COUNT)}</CardDescription>
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <Link href={deliveriesHref}>{M.VIEW_ALL}</Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {recent.length === 0 ? (
                    <p className="px-6 pb-6 text-sm text-muted-foreground">{M.NO_DELIVERIES}</p>
                  ) : (
                    <WebhookDeliveriesTable
                      items={recent}
                      onView={(d) => setOpenDeliveryId(d.id)}
                      endpointPaused={paused}
                    />
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="opacity-60">
              <CardHeader>
                <CardTitle className="text-base">{M.LOCKED_TITLE}</CardTitle>
                <CardDescription>{M.LOCKED_BODY}</CardDescription>
              </CardHeader>
            </Card>
          )}
        </>
      ) : null}

      <WebhookSecretDialog
        secret={secretDialog?.secret ?? null}
        title={secretDialog?.title ?? M.SECRET_DIALOG_TITLE}
        onClose={() => setSecretDialog(null)}
      />

      <ConfirmDialog
        open={confirm === 'rotate'}
        onOpenChange={(next) => (next ? null : setConfirm(null))}
        title={M.ROTATE_CONFIRM_TITLE}
        description={M.ROTATE_CONFIRM(overview?.delivery.secret_rotation_grace_hours ?? 0)}
        confirmLabel={M.ROTATE_CONFIRM_ACTION}
        cancelLabel={UI_MESSAGES.COMMON.CANCEL}
        loading={busy === 'rotate'}
        onConfirm={handleRotate}
      />
      <ConfirmDialog
        open={confirm === 'pause'}
        onOpenChange={(next) => (next ? null : setConfirm(null))}
        title={M.PAUSE_CONFIRM_TITLE}
        description={M.PAUSE_CONFIRM}
        confirmLabel={M.PAUSE}
        cancelLabel={UI_MESSAGES.COMMON.CANCEL}
        loading={busy === 'pause'}
        onConfirm={handlePause}
      />
      <ConfirmDialog
        open={confirm === 'remove'}
        onOpenChange={(next) => (next ? null : setConfirm(null))}
        destructive
        title={M.REMOVE_CONFIRM_TITLE}
        description={M.REMOVE_CONFIRM}
        confirmLabel={M.REMOVE}
        cancelLabel={UI_MESSAGES.COMMON.CANCEL}
        loading={busy === 'remove'}
        onConfirm={handleRemove}
      />

      {/* Result of "Test" */}
      <Dialog open={!!testResult} onOpenChange={(next) => (next ? null : setTestResult(null))}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  testSucceeded ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive',
                )}
              >
                {testSucceeded ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <DialogTitle>
                  {testSucceeded ? M.TEST_SENT_TITLE : M.TEST_FAILED_TITLE}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {testSucceeded
                    ? M.TEST_SENT_BODY(testResult.last_http_status, testResult.last_duration_ms)
                    : M.TEST_FAILED_BODY(
                        testResult?.last_http_status !== null && testResult?.last_http_status !== undefined
                          ? `HTTP ${testResult.last_http_status}`
                          : testResult?.last_error ?? '—',
                      )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                const id = testResult?.id ?? null;
                setTestResult(null);
                setOpenDeliveryId(id);
              }}
            >
              {M.VIEW_DETAILS}
            </Button>
            <Button onClick={() => setTestResult(null)}>{M.DONE}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WebhookDeliveryDialog
        api={api}
        deliveryId={openDeliveryId}
        canRedeliver={active && featureOn}
        endpointPaused={paused}
        onClose={() => setOpenDeliveryId(null)}
        onChanged={() => loadRecent(!!endpoint).catch(() => undefined)}
      />
    </>
  );
}
