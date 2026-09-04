'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Link2, Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreatePaymentLinkDialog } from '@/components/payment-links/CreatePaymentLinkDialog';
import { PaymentLinkDetailsDialog } from '@/components/payment-links/PaymentLinkDetailsDialog';
import { paymentLinkApi } from '@/lib/api/paymentLink.api';
import { formatDate, formatDateTime, pickErrorMessage } from '@/lib/utils';
import {
  PAYMENT_LINK_STATUS,
  PAYMENT_LINK_STATUS_LABEL,
  PAYMENT_LINK_STATUS_VALUES,
  PAYMENT_LINK_STATUS_VARIANT,
  RAZORPAY_MODE,
  UI_MESSAGES,
  formatAmountMinor,
  isPaymentLinkOpen,
  type PaymentLinkStatus,
} from '@/constants';
import type {
  CreatePaymentLinkPayload,
  Pagination as PaginationMeta,
  PaymentLink,
  PaymentLinkGatewayMeta,
  PaymentLinkStats,
} from '@/types';

const PAGE_SIZE = 20;
const SELECT_CLASS =
  'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function PaymentLinksInner() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [gateway, setGateway] = useState<PaymentLinkGatewayMeta | null>(null);
  const [stats, setStats] = useState<PaymentLinkStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentLinkStatus | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [details, setDetails] = useState<PaymentLink | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PaymentLink | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, statsRes] = await Promise.all([
        paymentLinkApi.list({
          search: search || undefined,
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          pageSize: PAGE_SIZE,
        }),
        paymentLinkApi.stats(),
      ]);
      setLinks(list.data);
      setPagination(list.meta?.pagination ?? null);
      setGateway(list.meta?.gateway ?? null);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, [search, status, from, to, page]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (id: string, action: () => Promise<unknown>, message?: string) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      if (message) setNotice(message);
      await load();
    } catch (err) {
      setNotice(null);
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyId(null);
    }
  };

  const handleCopy = async (link: PaymentLink) => {
    if (!link.short_url) return;
    try {
      await navigator.clipboard.writeText(link.short_url);
      setCopiedId(link.id);
      // Revert the tick so the button does not look permanently "done".
      setTimeout(() => setCopiedId((current) => (current === link.id ? null : current)), 2000);
    } catch {
      setError(UI_MESSAGES.AUTH.GENERIC_ERROR);
    }
  };

  const hasFilters = Boolean(search || status || from || to);
  const canCreate = gateway?.enabled !== false;

  return (
    <div className="space-y-6">
      <PageHeader
        title={UI_MESSAGES.PAYMENT_LINK.TITLE}
        description={UI_MESSAGES.PAYMENT_LINK.SUBTITLE}
        actions={
          <Button onClick={() => { setCreateError(null); setCreateOpen(true); }} disabled={!canCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {UI_MESSAGES.PAYMENT_LINK.NEW}
          </Button>
        }
      />

      {gateway && !gateway.enabled ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {UI_MESSAGES.PAYMENT_LINK.GATEWAY_DISABLED}
        </div>
      ) : gateway?.mode === RAZORPAY_MODE.TEST ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {UI_MESSAGES.PAYMENT_LINK.TEST_MODE}
        </div>
      ) : null}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={UI_MESSAGES.PAYMENT_LINK.STAT_TOTAL} value={stats.total} icon={Link2} />
          <StatCard
            label={UI_MESSAGES.PAYMENT_LINK.STAT_AWAITING}
            value={
              (stats.by_status[PAYMENT_LINK_STATUS.CREATED]?.count ?? 0) +
              (stats.by_status[PAYMENT_LINK_STATUS.PARTIALLY_PAID]?.count ?? 0)
            }
            accent="warning"
          />
          <StatCard
            label={UI_MESSAGES.PAYMENT_LINK.STAT_COLLECTED}
            value={formatAmountMinor(stats.collected_minor)}
            accent="success"
          />
          <StatCard
            label={UI_MESSAGES.PAYMENT_LINK.STAT_OUTSTANDING}
            value={formatAmountMinor(stats.outstanding_minor)}
            hint={UI_MESSAGES.PAYMENT_LINK.STAT_OUTSTANDING_HINT}
          />
        </div>
      ) : null}

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[200px] flex-1">
            <Input
              placeholder={UI_MESSAGES.COMMON.SEARCH}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            aria-label={UI_MESSAGES.PAYMENT_LINK.COL_STATUS}
            className={SELECT_CLASS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as PaymentLinkStatus | '');
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {PAYMENT_LINK_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {PAYMENT_LINK_STATUS_LABEL[value]}
              </option>
            ))}
          </select>
          <Input
            type="date"
            aria-label="From"
            className="w-auto"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            aria-label="To"
            className="w-auto"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
          <Button variant="outline" onClick={load} disabled={loading}>
            {UI_MESSAGES.COMMON.REFRESH}
          </Button>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="text-sm text-primary">{notice}</p> : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
          ) : !links.length ? (
            <p className="p-6 text-muted-foreground">
              {hasFilters ? UI_MESSAGES.PAYMENT_LINK.NO_MATCHES : UI_MESSAGES.PAYMENT_LINK.EMPTY}
            </p>
          ) : (
            <>
              {/* Desktop: full table. Hidden on small screens, where a table this
                  wide would either overflow or crush every column. */}
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{UI_MESSAGES.PAYMENT_LINK.COL_CUSTOMER}</TableHead>
                      <TableHead>{UI_MESSAGES.PAYMENT_LINK.COL_AMOUNT}</TableHead>
                      <TableHead>{UI_MESSAGES.PAYMENT_LINK.COL_STATUS}</TableHead>
                      <TableHead>{UI_MESSAGES.PAYMENT_LINK.COL_CREATED}</TableHead>
                      <TableHead>{UI_MESSAGES.PAYMENT_LINK.COL_EXPIRES}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="font-medium">
                            {link.customer_name || (
                              <span className="text-muted-foreground">
                                {UI_MESSAGES.PAYMENT_LINK.NO_CUSTOMER}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {link.customer_email || link.customer_contact || ''}
                          </div>
                          {link.description ? (
                            <div className="max-w-[260px] truncate text-xs text-muted-foreground">
                              {link.description}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>{formatAmountMinor(link.amount_minor, link.currency)}</div>
                          {link.amount_paid_minor > 0 &&
                          link.amount_paid_minor < link.amount_minor ? (
                            <div className="text-xs text-muted-foreground">
                              {UI_MESSAGES.PAYMENT_LINK.PAID_OF(
                                formatAmountMinor(link.amount_paid_minor, link.currency),
                                formatAmountMinor(link.amount_minor, link.currency),
                              )}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            <Badge variant={PAYMENT_LINK_STATUS_VARIANT[link.status]}>
                              {PAYMENT_LINK_STATUS_LABEL[link.status]}
                            </Badge>
                            {link.razorpay_mode === RAZORPAY_MODE.TEST ? (
                              <Badge variant="muted">test</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(link.created_at)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {link.expire_by
                            ? formatDate(link.expire_by)
                            : UI_MESSAGES.PAYMENT_LINK.NO_EXPIRY}
                        </TableCell>
                        <TableCell>
                          <RowActions
                            link={link}
                            busy={busyId === link.id}
                            copied={copiedId === link.id}
                            onCopy={() => handleCopy(link)}
                            onDetails={() => setDetails(link)}
                            onCancel={() => setCancelTarget(link)}
                            onSync={() =>
                              runAction(link.id, () => paymentLinkApi.sync(link.id))
                            }
                            onNotify={(medium) =>
                              runAction(
                                link.id,
                                () => paymentLinkApi.notify(link.id, medium),
                                UI_MESSAGES.PAYMENT_LINK.NOTIFIED,
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile / tablet: one card per link. */}
              <ul className="divide-y lg:hidden">
                {links.map((link) => (
                  <li key={link.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {link.customer_name || UI_MESSAGES.PAYMENT_LINK.NO_CUSTOMER}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {link.customer_email || link.customer_contact || ''}
                        </p>
                      </div>
                      <Badge variant={PAYMENT_LINK_STATUS_VARIANT[link.status]}>
                        {PAYMENT_LINK_STATUS_LABEL[link.status]}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-lg font-semibold">
                        {formatAmountMinor(link.amount_minor, link.currency)}
                      </span>
                      {link.amount_paid_minor > 0 &&
                      link.amount_paid_minor < link.amount_minor ? (
                        <span className="text-xs text-muted-foreground">
                          {UI_MESSAGES.PAYMENT_LINK.PAID_OF(
                            formatAmountMinor(link.amount_paid_minor, link.currency),
                            formatAmountMinor(link.amount_minor, link.currency),
                          )}
                        </span>
                      ) : null}
                    </div>

                    {link.description ? (
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    ) : null}

                    <p className="text-xs text-muted-foreground">
                      {UI_MESSAGES.PAYMENT_LINK.COL_CREATED}: {formatDateTime(link.created_at)}
                      {link.expire_by
                        ? ` · ${UI_MESSAGES.PAYMENT_LINK.COL_EXPIRES}: ${formatDate(link.expire_by)}`
                        : ''}
                    </p>

                    <RowActions
                      link={link}
                      busy={busyId === link.id}
                      copied={copiedId === link.id}
                      onCopy={() => handleCopy(link)}
                      onDetails={() => setDetails(link)}
                      onCancel={() => setCancelTarget(link)}
                      onSync={() => runAction(link.id, () => paymentLinkApi.sync(link.id))}
                      onNotify={(medium) =>
                        runAction(
                          link.id,
                          () => paymentLinkApi.notify(link.id, medium),
                          UI_MESSAGES.PAYMENT_LINK.NOTIFIED,
                        )
                      }
                    />
                  </li>
                ))}
              </ul>

              {pagination ? (
                <Pagination
                  pagination={pagination}
                  itemCount={links.length}
                  onPageChange={setPage}
                  disabled={loading}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <CreatePaymentLinkDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        loading={createBusy}
        error={createError}
        onCreate={async (payload: CreatePaymentLinkPayload) => {
          setCreateBusy(true);
          setCreateError(null);
          try {
            const res = await paymentLinkApi.create(payload);
            setCreateOpen(false);
            setNotice(res.message ?? UI_MESSAGES.PAYMENT_LINK.CREATED);
            setPage(1);
            await load();
            // Open the new link straight away — the admin's next step is almost
            // always to copy or share it.
            setDetails(res.data);
          } catch (err) {
            setCreateError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
          } finally {
            setCreateBusy(false);
          }
        }}
      />

      <PaymentLinkDetailsDialog link={details} onOpenChange={(open) => !open && setDetails(null)} />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title={UI_MESSAGES.PAYMENT_LINK.CANCEL_TITLE}
        description={UI_MESSAGES.PAYMENT_LINK.CANCEL_CONFIRM}
        confirmLabel={UI_MESSAGES.PAYMENT_LINK.CANCEL_LINK}
        destructive
        loading={busyId === cancelTarget?.id}
        onConfirm={async () => {
          if (!cancelTarget) return;
          const id = cancelTarget.id;
          setCancelTarget(null);
          await runAction(
            id,
            () => paymentLinkApi.cancel(id),
            UI_MESSAGES.PAYMENT_LINK.CANCELLED,
          );
        }}
      />
    </div>
  );
}

interface RowActionsProps {
  link: PaymentLink;
  busy: boolean;
  copied: boolean;
  onCopy: () => void;
  onDetails: () => void;
  onCancel: () => void;
  onSync: () => void;
  onNotify: (medium: 'sms' | 'email') => void;
}

/**
 * Shared by the desktop table and the mobile cards, so the two can never drift.
 * Only an OPEN link can be cancelled or resent — everything else is terminal.
 */
function RowActions({
  link,
  busy,
  copied,
  onCopy,
  onDetails,
  onCancel,
  onSync,
  onNotify,
}: RowActionsProps) {
  const open = isPaymentLinkOpen(link.status);

  return (
    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
      {link.short_url ? (
        <>
          <Button size="sm" variant="outline" onClick={onCopy} disabled={busy}>
            {copied ? (
              <>
                <Check className="mr-1 h-3.5 w-3.5" />
                {UI_MESSAGES.PAYMENT_LINK.COPIED}
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3.5 w-3.5" />
                {UI_MESSAGES.PAYMENT_LINK.COPY}
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={link.short_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              {UI_MESSAGES.PAYMENT_LINK.OPEN}
            </a>
          </Button>
        </>
      ) : null}

      {open && link.customer_contact ? (
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onNotify('sms')}>
          SMS
        </Button>
      ) : null}
      {open && link.customer_email ? (
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onNotify('email')}>
          Email
        </Button>
      ) : null}

      <Button
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={onSync}
        title={UI_MESSAGES.PAYMENT_LINK.SYNC_HINT}
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>

      <Button size="sm" variant="ghost" disabled={busy} onClick={onDetails}>
        {UI_MESSAGES.PAYMENT_LINK.VIEW}
      </Button>

      {open ? (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={onCancel}
          className="text-muted-foreground hover:text-destructive"
        >
          {UI_MESSAGES.PAYMENT_LINK.CANCEL_LINK}
        </Button>
      ) : null}
    </div>
  );
}

export default function AdminPaymentLinksPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <PaymentLinksInner />
    </Suspense>
  );
}
