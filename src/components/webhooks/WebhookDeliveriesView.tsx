'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import {
  DEFAULT_PAGE_SIZE,
  UI_MESSAGES,
  WEBHOOK_DELIVERY_STATUS_LABEL,
  WEBHOOK_ENDPOINT_STATUS,
  WEBHOOK_EVENT_TYPE_VALUES,
} from '@/constants';
import { cn, pickErrorMessage } from '@/lib/utils';
import type { WebhookApi } from '@/lib/api/webhook.api';
import type { Pagination as PaginationMeta, WebhookDeliverySummary, WebhookOverview } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { WebhookDeliveriesTable } from '@/components/webhooks/WebhookDeliveriesTable';
import { WebhookDeliveryDialog } from '@/components/webhooks/WebhookDeliveryDialog';

const M = UI_MESSAGES.WEBHOOKS;

interface WebhookDeliveriesViewProps {
  api: WebhookApi;
  // The webhook settings page for this audience.
  backHref: string;
  ready?: boolean;
  notReadyMessage?: string;
  reloadKey?: string;
  toolbarStart?: React.ReactNode;
}

const selectClass = 'flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm';

export function WebhookDeliveriesView({
  api,
  backHref,
  ready = true,
  notReadyMessage,
  reloadKey,
  toolbarStart,
}: WebhookDeliveriesViewProps) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const [overview, setOverview] = useState<WebhookOverview | null>(null);
  const [items, setItems] = useState<WebhookDeliverySummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDeliveryId, setOpenDeliveryId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [eventType, setEventType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // The endpoint's state decides whether redelivery is offered, and the
  // contract supplies how long history is kept.
  useEffect(() => {
    if (!ready) {
      setOverview(null);
      return;
    }
    apiRef.current
      .getOverview()
      .then((res) => setOverview(res.data))
      .catch(() => setOverview(null));
  }, [ready, reloadKey]);

  const load = useCallback(async () => {
    if (!ready) {
      setItems([]);
      setPagination(null);
      setLoading(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await apiRef.current.listDeliveries({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        search: search.trim() || undefined,
        status: status || undefined,
        event_type: eventType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setItems(res.data ?? []);
      setPagination(res.meta?.pagination ?? null);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [ready, page, search, status, eventType, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  // Any filter change returns to the first page.
  const onFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setEventType('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const endpointPaused = overview?.endpoint?.status === WEBHOOK_ENDPOINT_STATUS.DISABLED;
  const canRedeliver =
    overview?.feature_enabled === true &&
    overview.endpoint?.status === WEBHOOK_ENDPOINT_STATUS.ACTIVE;

  return (
    <>
      <div>
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {M.BACK_TO_WEBHOOKS}
        </Link>
        <PageHeader
          title={M.LOG_TITLE}
          description={overview ? M.LOG_SUBTITLE(overview.delivery.retention_days) : undefined}
          actions={
            ready ? (
              <Button variant="outline" size="sm" onClick={load} disabled={busy}>
                <RefreshCw className={cn('mr-2 h-4 w-4', busy && 'animate-spin')} />
                {UI_MESSAGES.COMMON.REFRESH}
              </Button>
            ) : null
          }
        />
      </div>

      {toolbarStart ? <div className="flex flex-wrap items-end gap-3">{toolbarStart}</div> : null}

      {!ready ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">{notReadyMessage}</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-end gap-3 p-4">
              <div className="min-w-[220px] flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">{M.SEARCH_LABEL}</label>
                <Input
                  value={search}
                  onChange={(e) => onFilter(setSearch)(e.target.value)}
                  placeholder={M.SEARCH_PLACEHOLDER}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {UI_MESSAGES.FILTERS.STATUS_LABEL}
                </label>
                <select
                  value={status}
                  onChange={(e) => onFilter(setStatus)(e.target.value)}
                  className={selectClass}
                >
                  <option value="">{UI_MESSAGES.FILTERS.ALL}</option>
                  {Object.entries(WEBHOOK_DELIVERY_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{M.EVENT_LABEL}</label>
                <select
                  value={eventType}
                  onChange={(e) => onFilter(setEventType)(e.target.value)}
                  className={selectClass}
                >
                  <option value="">{UI_MESSAGES.FILTERS.ALL}</option>
                  {WEBHOOK_EVENT_TYPE_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {UI_MESSAGES.FILTERS.FROM_DATE_LABEL}
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onFilter(setDateFrom)(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {UI_MESSAGES.FILTERS.TO_DATE_LABEL}
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => onFilter(setDateTo)(e.target.value)}
                />
              </div>
              <Button variant="ghost" onClick={clearFilters} disabled={busy}>
                {UI_MESSAGES.FILTERS.CLEAR}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
              ) : error ? (
                <p className="p-6 text-destructive">{error}</p>
              ) : items.length === 0 ? (
                <p className="p-6 text-muted-foreground">{M.NO_DELIVERIES}</p>
              ) : (
                <>
                  <WebhookDeliveriesTable
                    items={items}
                    onView={(d) => setOpenDeliveryId(d.id)}
                    endpointPaused={endpointPaused}
                  />
                  {pagination ? (
                    <Pagination
                      pagination={pagination}
                      itemCount={items.length}
                      onPageChange={setPage}
                      disabled={busy}
                    />
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <WebhookDeliveryDialog
        api={api}
        deliveryId={openDeliveryId}
        canRedeliver={canRedeliver}
        endpointPaused={endpointPaused}
        onClose={() => setOpenDeliveryId(null)}
        onChanged={load}
      />
    </>
  );
}
