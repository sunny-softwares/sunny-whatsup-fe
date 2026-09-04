'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
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
import { BillingCyclesTable } from '@/components/subscription/BillingCyclesTable';
import { NewPeriodDialog } from '@/components/subscription/NewPeriodDialog';
import { PaymentHistoryTable } from '@/components/subscription/PaymentHistoryTable';
import { SubscriptionEditDialog } from '@/components/subscription/SubscriptionEditDialog';
import { adminSubscriptionApi } from '@/lib/api/adminSubscription.api';
import { formatDate, pickErrorMessage } from '@/lib/utils';
import {
  BILLING_CYCLE_LABEL,
  ENTITLEMENT_STATE_LABEL,
  ENTITLEMENT_STATE_VALUES,
  ENTITLEMENT_STATE_VARIANT,
  PERIOD_PAYMENT_STATUS,
  PERIOD_PAYMENT_STATUS_LABEL,
  SUBSCRIPTION_STATUS,
  UI_MESSAGES,
  formatAmountMinor,
  type EntitlementState,
} from '@/constants';
import type {
  AdminCompanySubscriptionView,
  Pagination as PaginationMeta,
  Payment,
  PeriodPayload,
  Plan,
  SubscriptionRow,
  UpdateSubscriptionPayload,
} from '@/types';

const PAGE_SIZE = 20;

/** True when the company has paid for time beyond the cycle it is consuming. */
const hasBankedCoverage = (row: SubscriptionRow) =>
  !!row.coverage_ends_at &&
  !!row.current_period &&
  new Date(row.coverage_ends_at).getTime() > new Date(row.current_period.ends_at).getTime();

function AdminSubscriptionsInner() {
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<EntitlementState | ''>('');
  const [page, setPage] = useState(1);

  const [busyCompanyId, setBusyCompanyId] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editView, setEditView] = useState<AdminCompanySubscriptionView | null>(null);
  const [editCompanyId, setEditCompanyId] = useState<string | null>(null);

  // The combined billing-history panel: cycles AND payments for one company.
  // Cycles are what reveal banked coverage; payments alone never showed it.
  const [historyFor, setHistoryFor] = useState<{ id: string; name: string } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [history, setHistory] = useState<AdminCompanySubscriptionView | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [extendFor, setExtendFor] = useState<SubscriptionRow | null>(null);
  const [extendDays, setExtendDays] = useState('7');

  const [newPeriodOpen, setNewPeriodOpen] = useState(false);
  const [newPeriodBusy, setNewPeriodBusy] = useState(false);
  const [newPeriodError, setNewPeriodError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Enforcement state is reported by the backend on every notice, so the banner
  // reflects reality rather than a frontend guess.
  const enforcementOff = rows.some((row) => row.notice?.enforcement_enabled === false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminSubscriptionApi.list({
        search: search || undefined,
        state: stateFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(res.data);
      setPagination(res.meta?.pagination ?? null);
      setError(null);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, [search, stateFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    adminSubscriptionApi
      .listPlans()
      .then((res) => setPlans(res.data))
      .catch(() => setPlans([]));
  }, []);

  const openEdit = async (row: SubscriptionRow) => {
    setEditCompanyId(row.company_id);
    setDialogError(null);
    setEditOpen(true);
    try {
      const res = await adminSubscriptionApi.getForCompany(row.company_id);
      setEditView(res.data);
    } catch (err) {
      setDialogError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    }
  };

  const handleSave = async (
    subscription: UpdateSubscriptionPayload,
    period: PeriodPayload | null,
    periodId: string | null,
  ) => {
    if (!editCompanyId) return;
    setDialogBusy(true);
    setDialogError(null);
    try {
      // Two calls because they are two resources — a subscription-only change
      // must not require a billing cycle to exist.
      await adminSubscriptionApi.update(editCompanyId, subscription);
      if (period && periodId) {
        await adminSubscriptionApi.updatePeriod(editCompanyId, periodId, period);
      }
      setEditOpen(false);
      await load();
    } catch (err) {
      setDialogError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setDialogBusy(false);
    }
  };

  const runAction = async (companyId: string, action: () => Promise<unknown>) => {
    setBusyCompanyId(companyId);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyCompanyId(null);
    }
  };

  const refreshHistory = useCallback(async (targetCompanyId: string) => {
    setHistoryLoading(true);
    try {
      // Cycles and payments together — the cycles are the half that reveals
      // coverage bought beyond the cycle currently running.
      const [detail, pay] = await Promise.all([
        adminSubscriptionApi.getForCompany(targetCompanyId),
        adminSubscriptionApi.listPayments(targetCompanyId, { pageSize: 50 }),
      ]);
      setHistory(detail.data);
      setPayments(pay.data);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const openHistory = async (row: SubscriptionRow) => {
    setHistoryFor({ id: row.company_id, name: row.company?.name ?? '' });
    setPayments([]);
    setHistory(null);
    setBanner(null);
    await refreshHistory(row.company_id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={UI_MESSAGES.SUBSCRIPTION.ADMIN_TITLE}
        description={UI_MESSAGES.SUBSCRIPTION.ADMIN_SUBTITLE}
      />

      {enforcementOff ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {UI_MESSAGES.SUBSCRIPTION.ENFORCEMENT_OFF}
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
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value as EntitlementState | '');
              setPage(1);
            }}
          >
            <option value="">All states</option>
            {ENTITLEMENT_STATE_VALUES.map((value) => (
              <option key={value} value={value}>
                {ENTITLEMENT_STATE_LABEL[value]}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={load} disabled={loading}>
            {UI_MESSAGES.COMMON.REFRESH}
          </Button>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {banner ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          {banner}
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
          ) : !rows.length ? (
            <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>{UI_MESSAGES.SUBSCRIPTION.PLAN_LABEL}</TableHead>
                    <TableHead>{UI_MESSAGES.SUBSCRIPTION.CYCLE_LABEL}</TableHead>
                    <TableHead>{UI_MESSAGES.SUBSCRIPTION.ENDS_AT_LABEL}</TableHead>
                    <TableHead>{UI_MESSAGES.SUBSCRIPTION.PAYMENT_STATUS_LABEL}</TableHead>
                    <TableHead>{UI_MESSAGES.SUBSCRIPTION.STATE_LABEL}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const busy = busyCompanyId === row.company_id;
                    const period = row.current_period;
                    const suspended = row.status === SUBSCRIPTION_STATUS.SUSPENDED;

                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">{row.company?.name ?? '—'}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.company?.contact_email ?? ''}
                          </div>
                        </TableCell>
                        <TableCell>{row.plan?.name ?? '—'}</TableCell>
                        <TableCell>
                          {period ? BILLING_CYCLE_LABEL[period.billing_cycle] : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>{period ? formatDate(period.ends_at) : '—'}</div>
                          {typeof row.days_remaining === 'number' ? (
                            <div className="text-xs text-muted-foreground">
                              {UI_MESSAGES.SUBSCRIPTION.DAYS_REMAINING(row.days_remaining)}
                            </div>
                          ) : null}
                          {/* Coverage past the current cycle means an early
                              renewal is banked. Without this the row looks
                              identical to a company that has not renewed. */}
                          {hasBankedCoverage(row) ? (
                            <div className="mt-1 text-xs font-medium text-primary">
                              {UI_MESSAGES.SUBSCRIPTION.PAID_THROUGH(
                                formatDate(row.coverage_ends_at as string),
                              )}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div>
                            {period ? PERIOD_PAYMENT_STATUS_LABEL[period.payment_status] : '—'}
                          </div>
                          {period ? (
                            <div className="text-xs text-muted-foreground">
                              {formatAmountMinor(period.amount_minor, period.currency)}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ENTITLEMENT_STATE_VARIANT[row.state]}>
                            {ENTITLEMENT_STATE_LABEL[row.state]}
                          </Badge>
                          {row.cancel_at_period_end ? (
                            <div className="mt-1 text-xs text-muted-foreground">Not renewing</div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => openEdit(row)}
                            >
                              {UI_MESSAGES.COMMON.EDIT}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => {
                                setExtendFor(row);
                                setExtendDays('7');
                              }}
                            >
                              {UI_MESSAGES.SUBSCRIPTION.EXTEND}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy || period?.payment_status === PERIOD_PAYMENT_STATUS.PAID}
                              onClick={() =>
                                runAction(row.company_id, () =>
                                  adminSubscriptionApi.markPaid(row.company_id, {
                                    payment_status: PERIOD_PAYMENT_STATUS.PAID,
                                  }),
                                )
                              }
                            >
                              {UI_MESSAGES.SUBSCRIPTION.MARK_PAID}
                            </Button>
                            <Button
                              size="sm"
                              variant={suspended ? 'outline' : 'ghost'}
                              disabled={busy}
                              onClick={() =>
                                runAction(row.company_id, () =>
                                  suspended
                                    ? adminSubscriptionApi.resume(row.company_id)
                                    : adminSubscriptionApi.suspend(row.company_id),
                                )
                              }
                            >
                              {suspended
                                ? UI_MESSAGES.SUBSCRIPTION.RESUME
                                : UI_MESSAGES.SUBSCRIPTION.SUSPEND}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => openHistory(row)}
                            >
                              {UI_MESSAGES.SUBSCRIPTION.VIEW_HISTORY}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {pagination ? (
                <Pagination
                  pagination={pagination}
                  itemCount={rows.length}
                  onPageChange={setPage}
                  disabled={loading}
                />
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {historyFor ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-medium">
                {UI_MESSAGES.SUBSCRIPTION.HISTORY_TITLE} — {historyFor.name}
              </p>
              <Button size="sm" variant="ghost" onClick={() => setHistoryFor(null)}>
                {UI_MESSAGES.COMMON.DISMISS}
              </Button>
            </div>

            {historyLoading ? (
              <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
            ) : (
              <>
                {history &&
                history.coverage_ends_at &&
                history.current_period &&
                new Date(history.coverage_ends_at).getTime() >
                  new Date(history.current_period.ends_at).getTime() ? (
                  <p className="border-b bg-primary/5 px-4 py-3 text-sm text-primary">
                    {UI_MESSAGES.SUBSCRIPTION.BANKED_COVERAGE_HINT(
                      formatDate(history.coverage_ends_at),
                    )}
                  </p>
                ) : null}

                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                  <p className="text-sm font-semibold">{UI_MESSAGES.SUBSCRIPTION.CYCLES_TITLE}</p>
                  {/* Lives here rather than in the row actions: adding a cycle
                      is something you do while looking at the existing ones. */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewPeriodError(null);
                      setNewPeriodOpen(true);
                    }}
                  >
                    {UI_MESSAGES.SUBSCRIPTION.NEW_CYCLE_BUTTON}
                  </Button>
                </div>
                <BillingCyclesTable
                  periods={history?.periods ?? []}
                  currentPeriodId={history?.current_period?.id ?? null}
                />

                <div className="border-b border-t bg-muted/30 px-4 py-3">
                  <p className="text-sm font-semibold">
                    {UI_MESSAGES.SUBSCRIPTION.PAYMENT_HISTORY_TITLE}
                  </p>
                </div>
                <PaymentHistoryTable payments={payments} showGatewayIds />
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      <NewPeriodDialog
        open={newPeriodOpen}
        onOpenChange={setNewPeriodOpen}
        companyName={historyFor?.name ?? ''}
        view={history}
        plans={plans}
        loading={newPeriodBusy}
        error={newPeriodError}
        onCreate={async (payload) => {
          if (!historyFor) return;
          setNewPeriodBusy(true);
          setNewPeriodError(null);
          try {
            const res = await adminSubscriptionApi.createPeriod(historyFor.id, payload);
            setNewPeriodOpen(false);
            // The server says whether the cycle went live or was queued — echo
            // that rather than making the admin re-read the table to find out.
            setBanner(res.message ?? null);
            await Promise.all([load(), refreshHistory(historyFor.id)]);
          } catch (err) {
            setNewPeriodError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
          } finally {
            setNewPeriodBusy(false);
          }
        }}
      />

      <SubscriptionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        view={editView}
        plans={plans}
        loading={dialogBusy}
        error={dialogError}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!extendFor}
        onOpenChange={(open) => !open && setExtendFor(null)}
        title={`${UI_MESSAGES.SUBSCRIPTION.EXTEND} — ${extendFor?.company?.name ?? ''}`}
        description={
          <span className="block space-y-2">
            <span className="block">{UI_MESSAGES.SUBSCRIPTION.EXTEND_DAYS_LABEL}</span>
            <Input
              type="number"
              min={1}
              max={3650}
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
            />
          </span>
        }
        confirmLabel={UI_MESSAGES.SUBSCRIPTION.EXTEND}
        loading={busyCompanyId === extendFor?.company_id}
        onConfirm={async () => {
          if (!extendFor) return;
          const companyId = extendFor.company_id;
          setExtendFor(null);
          await runAction(companyId, () =>
            adminSubscriptionApi.extend(companyId, Number(extendDays) || 1),
          );
        }}
      />
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <AdminSubscriptionsInner />
    </Suspense>
  );
}
