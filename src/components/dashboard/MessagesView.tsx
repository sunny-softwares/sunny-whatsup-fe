'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  MESSAGE_STATUS,
  MESSAGE_SORT_FIELD,
  SORT_ORDER,
  DEFAULT_PAGE_SIZE,
  UI_MESSAGES,
  type SortOrder,
} from '@/constants';
import { cn, formatDateTime, pickErrorMessage } from '@/lib/utils';
import type { MessageListParams, MessageLog, Pagination as PaginationMeta } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader, nextSort } from '@/components/ui/sortable-header';
import { MessageStatusBadge } from '@/components/dashboard/MessageStatusBadge';

interface MessagesResponse {
  data: MessageLog[];
  meta?: { pagination?: PaginationMeta };
}

interface MessagesViewProps {
  title: string;
  description?: string;
  // When true, shows a Company column + company-name filter (super admin view).
  showCompany?: boolean;
  fetchMessages: (params: MessageListParams) => Promise<MessagesResponse>;
}

export function MessagesView({ title, description, showCompany = false, fetchMessages }: MessagesViewProps) {
  const [items, setItems] = useState<MessageLog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [recipient, setRecipient] = useState('');
  const [company, setCompany] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<{ by: string; order: SortOrder }>({
    by: MESSAGE_SORT_FIELD.CREATED_AT,
    order: SORT_ORDER.DESC,
  });

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetchMessages({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        status: status || undefined,
        search: recipient || undefined,
        company: showCompany ? company || undefined : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort_by: sort.by,
        sort_order: sort.order,
      });
      setItems(res.data);
      setPagination(res.meta?.pagination ?? null);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [page, status, recipient, company, dateFrom, dateTo, sort, showCompany, fetchMessages]);

  useEffect(() => {
    load();
  }, [load]);

  // Any filter change returns to the first page so results stay consistent.
  const onFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const handleSort = (field: string) => {
    setSort((prev) => nextSort(prev, field));
    setPage(1);
  };

  const clearFilters = () => {
    setStatus('');
    setRecipient('');
    setCompany('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={busy}>
            <RefreshCw className={cn('mr-2 h-4 w-4', busy && 'animate-spin')} />
            {UI_MESSAGES.COMMON.REFRESH}
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          {showCompany ? (
            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">
                {UI_MESSAGES.FILTERS.COMPANY_LABEL}
              </label>
              <Input
                value={company}
                onChange={(e) => onFilter(setCompany)(e.target.value)}
                placeholder={UI_MESSAGES.FILTERS.COMPANY_PLACEHOLDER}
              />
            </div>
          ) : null}
          <div className="min-w-[150px] flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.FILTERS.RECIPIENT_LABEL}
            </label>
            <Input
              value={recipient}
              onChange={(e) => onFilter(setRecipient)(e.target.value)}
              placeholder={UI_MESSAGES.FILTERS.RECIPIENT_PLACEHOLDER}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.FILTERS.STATUS_LABEL}
            </label>
            <select
              value={status}
              onChange={(e) => onFilter(setStatus)(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{UI_MESSAGES.FILTERS.ALL}</option>
              {Object.values(MESSAGE_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.FILTERS.FROM_DATE_LABEL}
            </label>
            <Input type="date" value={dateFrom} onChange={(e) => onFilter(setDateFrom)(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.FILTERS.TO_DATE_LABEL}
            </label>
            <Input type="date" value={dateTo} onChange={(e) => onFilter(setDateTo)(e.target.value)} />
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
            <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_CREATED}
                      field={MESSAGE_SORT_FIELD.CREATED_AT}
                      sort={sort}
                      onSort={handleSort}
                    />
                    {showCompany ? (
                      <SortableHeader
                        label={UI_MESSAGES.TABLE.COL_COMPANY}
                        field={MESSAGE_SORT_FIELD.COMPANY}
                        sort={sort}
                        onSort={handleSort}
                      />
                    ) : (
                      <TableHead>{UI_MESSAGES.TABLE.COL_FROM}</TableHead>
                    )}
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_TO}
                      field={MESSAGE_SORT_FIELD.RECIPIENT}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_TYPE}
                      field={MESSAGE_SORT_FIELD.TYPE}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_TEMPLATE}
                      field={MESSAGE_SORT_FIELD.TEMPLATE}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_STATUS}
                      field={MESSAGE_SORT_FIELD.STATUS}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <TableHead>{UI_MESSAGES.TABLE.COL_META_ID}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap">{formatDateTime(m.created_at)}</TableCell>
                      {showCompany ? (
                        <TableCell className="font-medium">{m.company?.name ?? '—'}</TableCell>
                      ) : (
                        <TableCell>{m.phoneNumber?.display_phone_number ?? '—'}</TableCell>
                      )}
                      <TableCell className="font-medium">{m.recipient_phone}</TableCell>
                      <TableCell>{m.message_type}</TableCell>
                      <TableCell>{m.template?.name ?? '—'}</TableCell>
                      <TableCell>
                        <MessageStatusBadge status={m.status} />
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {m.meta_message_id ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
  );
}
