'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, Check, Download, Info, Loader2, RefreshCw } from 'lucide-react';
import {
  MESSAGE_STATUS,
  MESSAGE_SORT_FIELD,
  SORT_ORDER,
  DEFAULT_PAGE_SIZE,
  UI_MESSAGES,
  EXTERNAL_LINKS,
  type SortOrder,
} from '@/constants';
import { cn, formatDateTime, pickErrorMessage } from '@/lib/utils';
import { buildWhatsappWebResendUrl } from '@/lib/whatsapp';
import { hasHeaderMedia } from '@/lib/messagePayload';
import { isMobileDevice } from '@/lib/device';
import { pickBlobErrorMessage, saveBlob, type DownloadedFile } from '@/lib/download';
import type {
  MessageListParams,
  MessageLog,
  MessageRetention,
  Pagination as PaginationMeta,
} from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader, nextSort } from '@/components/ui/sortable-header';
import { MessageStatusBadge } from '@/components/dashboard/MessageStatusBadge';
import { MessageErrorDialog } from '@/components/dashboard/MessageErrorDialog';

interface MessagesResponse {
  data: MessageLog[];
  // `retention` is present only when the caller is limited to a history
  // window (company admins); super admins get nothing and see everything.
  meta?: { pagination?: PaginationMeta; retention?: MessageRetention | null };
}

interface MessagesViewProps {
  title: string;
  description?: string;
  // When true, shows a Company column + company-name filter (super admin view).
  showCompany?: boolean;
  fetchMessages: (params: MessageListParams) => Promise<MessagesResponse>;
  // Fetches a message's header attachment back from Meta for manual resending.
  downloadMessageMedia: (messageId: string) => Promise<DownloadedFile>;
  // Records (or clears) that a failed message was resent by hand.
  setMessageHandled: (messageId: string, handled: boolean) => Promise<{ data: MessageLog }>;
}

export function MessagesView({
  title,
  description,
  showCompany = false,
  fetchMessages,
  downloadMessageMedia,
  setMessageHandled,
}: MessagesViewProps) {
  const [items, setItems] = useState<MessageLog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  // The history window the API limited this listing to, or null when the
  // caller is unrestricted. Drives the notice and the date filter bounds.
  const [retention, setRetention] = useState<MessageRetention | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Failed message whose error details are open in the dialog.
  const [errorLog, setErrorLog] = useState<MessageLog | null>(null);
  // Per-row actions in flight, and the reason the last one failed — for a
  // download, most often Meta having dropped the media after its retention
  // window.
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [handlingId, setHandlingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Decides whether a recipient link hands off to the WhatsApp app or the web
  // client. Resolved after mount, since the server cannot know the device.
  const [onMobile, setOnMobile] = useState(false);

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
      setRetention(res.meta?.retention ?? null);
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

  useEffect(() => {
    setOnMobile(isMobileDevice());
  }, []);

  // Any filter change returns to the first page so results stay consistent.
  const onFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  // A date typed past the start of the history window is pulled back to it —
  // the inputs' `min` covers the picker, this covers keyboard entry. The API
  // clamps too, so this only keeps the field honest about what was applied.
  const onDateFilter = (setter: (v: string) => void) => (value: string) => {
    const floor = retention?.from_date;
    onFilter(setter)(floor && value && value < floor ? floor : value);
  };

  const handleDownloadMedia = async (message: MessageLog) => {
    setDownloadingId(message.id);
    setActionError(null);
    try {
      saveBlob(await downloadMessageMedia(message.id));
    } catch (err) {
      setActionError(await pickBlobErrorMessage(err, UI_MESSAGES.MESSAGE_ERROR.DOWNLOAD_FAILED));
    } finally {
      setDownloadingId(null);
    }
  };

  // Flips the manual-handling mark, then swaps the updated row into place so
  // the change shows without refetching the page.
  const handleToggleHandled = async (message: MessageLog) => {
    setHandlingId(message.id);
    setActionError(null);
    try {
      const res = await setMessageHandled(message.id, !message.manually_handled_at);
      setItems((prev) => prev.map((m) => (m.id === res.data.id ? res.data : m)));
    } catch (err) {
      setActionError(pickErrorMessage(err, UI_MESSAGES.MESSAGE_ACTIONS.HANDLED_FAILED));
    } finally {
      setHandlingId(null);
    }
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

      {/* Only shown to callers the API actually limits — super admins see the
          full history and get no notice. */}
      {retention ? (
        <div className="mb-4 flex items-start gap-2 rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{UI_MESSAGES.MESSAGE_RETENTION.NOTICE(retention.days)}</p>
        </div>
      ) : null}

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
            <Input
              type="date"
              value={dateFrom}
              min={retention?.from_date}
              onChange={(e) => onDateFilter(setDateFrom)(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.FILTERS.TO_DATE_LABEL}
            </label>
            <Input
              type="date"
              value={dateTo}
              min={retention?.from_date}
              onChange={(e) => onDateFilter(setDateTo)(e.target.value)}
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
            <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</p>
          ) : (
            <>
              {actionError ? (
                <div className="flex items-start gap-2 border-b bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="flex-1">{actionError}</p>
                  <button
                    type="button"
                    onClick={() => setActionError(null)}
                    className="shrink-0 underline underline-offset-2"
                  >
                    {UI_MESSAGES.COMMON.DISMISS}
                  </button>
                </div>
              ) : null}
              {items.some((m) => m.status === MESSAGE_STATUS.FAILED) ? (
                <div className="flex items-start gap-2 border-b bg-muted/50 p-3 text-sm text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {UI_MESSAGES.MESSAGE_ERROR.DOCS_HINT_PREFIX}{' '}
                    <a
                      href={EXTERNAL_LINKS.META_ERROR_CODES_DOCS}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      {UI_MESSAGES.MESSAGE_ERROR.DOCS_LINK_LABEL}
                    </a>
                    .
                  </p>
                </div>
              ) : null}
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
                    <TableHead>{UI_MESSAGES.TABLE.COL_HANDLED}</TableHead>
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
                      <TableCell className="font-medium">
                        {EXTERNAL_LINKS.isDialable(m.recipient_phone) ? (
                          <a
                            href={EXTERNAL_LINKS.whatsappChat(m.recipient_phone, onMobile)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={UI_MESSAGES.MESSAGE_ACTIONS.OPEN_CHAT}
                            className="underline-offset-2 hover:underline"
                          >
                            {m.recipient_phone}
                          </a>
                        ) : (
                          m.recipient_phone
                        )}
                      </TableCell>
                      <TableCell>{m.message_type}</TableCell>
                      <TableCell>{m.template?.name ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <MessageStatusBadge status={m.status} />
                          {m.status === MESSAGE_STATUS.FAILED && m.error_payload ? (
                            <button
                              type="button"
                              onClick={() => setErrorLog(m)}
                              title={UI_MESSAGES.MESSAGE_ERROR.VIEW_REASON}
                              className="text-destructive opacity-70 transition-opacity hover:opacity-100"
                            >
                              <AlertCircle className="h-4 w-4" />
                              <span className="sr-only">{UI_MESSAGES.MESSAGE_ERROR.VIEW_REASON}</span>
                            </button>
                          ) : null}
                          {m.status === MESSAGE_STATUS.FAILED ? (
                            <a
                              href={buildWhatsappWebResendUrl(m)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={UI_MESSAGES.MESSAGE_ERROR.SEND_WHATSAPP_WEB}
                              className="text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                              <span className="sr-only">{UI_MESSAGES.MESSAGE_ERROR.SEND_WHATSAPP_WEB}</span>
                            </a>
                          ) : null}
                          {/* Only messages that actually carried an attachment
                              have something to download. */}
                          {m.status === MESSAGE_STATUS.FAILED && hasHeaderMedia(m) ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadMedia(m)}
                              disabled={downloadingId === m.id}
                              title={
                                downloadingId === m.id
                                  ? UI_MESSAGES.MESSAGE_ERROR.DOWNLOADING_MEDIA
                                  : UI_MESSAGES.MESSAGE_ERROR.DOWNLOAD_MEDIA
                              }
                              className="text-muted-foreground opacity-70 transition-opacity hover:opacity-100 disabled:opacity-40"
                            >
                              {downloadingId === m.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              <span className="sr-only">{UI_MESSAGES.MESSAGE_ERROR.DOWNLOAD_MEDIA}</span>
                            </button>
                          ) : null}
                        </div>
                      </TableCell>
                      {/* Only a failure is something an admin has to chase up
                          outside the platform, so only failures are markable. */}
                      <TableCell className="whitespace-nowrap">
                        {m.status !== MESSAGE_STATUS.FAILED ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <Button
                            variant={m.manually_handled_at ? 'ghost' : 'outline'}
                            size="sm"
                            disabled={handlingId === m.id}
                            onClick={() => handleToggleHandled(m)}
                            title={
                              m.manually_handled_at
                                ? UI_MESSAGES.MESSAGE_ACTIONS.UNMARK_HANDLED_HINT(
                                    formatDateTime(m.manually_handled_at),
                                  )
                                : UI_MESSAGES.MESSAGE_ACTIONS.MARK_HANDLED_HINT
                            }
                            className="h-7 px-2 text-xs font-normal"
                          >
                            {handlingId === m.id ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : m.manually_handled_at ? (
                              <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                            ) : null}
                            {m.manually_handled_at
                              ? formatDateTime(m.manually_handled_at)
                              : UI_MESSAGES.MESSAGE_ACTIONS.MARK_HANDLED}
                          </Button>
                        )}
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

      <MessageErrorDialog log={errorLog} onClose={() => setErrorLog(null)} />
    </>
  );
}
