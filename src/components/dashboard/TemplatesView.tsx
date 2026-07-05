'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Terminal, Trash2 } from 'lucide-react';
import {
  TEMPLATE_CATEGORY_LABEL,
  TEMPLATE_CATEGORY_VALUES,
  TEMPLATE_STATUS,
  TEMPLATE_SORT_FIELD,
  SORT_ORDER,
  DEFAULT_PAGE_SIZE,
  UI_MESSAGES,
  type SortOrder,
} from '@/constants';
import { cn, formatDate, pickErrorMessage } from '@/lib/utils';
import type { MessageTemplate, Pagination as PaginationMeta, TemplateListParams } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader, nextSort } from '@/components/ui/sortable-header';
import { TemplateStatusBadge } from '@/components/dashboard/TemplateStatusBadge';
import { TemplateDetailsDialog } from '@/components/dashboard/TemplateDetailsDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface TemplatesApi {
  list: (
    params: TemplateListParams,
  ) => Promise<{ data: MessageTemplate[]; meta?: { pagination?: PaginationMeta } }>;
  sync: () => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
}

interface TemplatesViewProps {
  title: string;
  description?: string;
  createHref: string;
  api: TemplatesApi;
  // When false, fetching is skipped and notReadyMessage is shown (e.g. super
  // admin before a company is chosen). Defaults to true.
  ready?: boolean;
  notReadyMessage?: string;
  // Changing this re-fetches and returns to the first page (e.g. the companyId).
  reloadKey?: string;
  // Extra control rendered at the start of the filter bar (e.g. company selector).
  toolbarStart?: React.ReactNode;
  // When provided, each row gets a "Copy curl" action (super admin: generates
  // the external send-message API snippet for the template).
  onCopyCurl?: (template: MessageTemplate) => void;
}

export function TemplatesView({
  title,
  description,
  createHref,
  api,
  ready = true,
  notReadyMessage,
  reloadKey,
  toolbarStart,
  onCopyCurl,
}: TemplatesViewProps) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const [items, setItems] = useState<MessageTemplate[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<MessageTemplate | null>(null);

  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ by: string; order: SortOrder }>({
    by: TEMPLATE_SORT_FIELD.NAME,
    order: SORT_ORDER.ASC,
  });

  // Switching context (company) starts fresh on page 1.
  useEffect(() => {
    setPage(1);
  }, [reloadKey]);

  const load = useCallback(async () => {
    if (!ready) {
      setItems([]);
      setPagination(null);
      setLoading(false);
      return;
    }
    setBusy(true);
    setLoading(true);
    setError(null);
    try {
      const res = await apiRef.current.list({
        category: category || undefined,
        status: status || undefined,
        search: search || undefined,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
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
  }, [ready, reloadKey, category, status, search, page, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (field: string) => {
    setSort((prev) => nextSort(prev, field));
    setPage(1);
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await apiRef.current.sync();
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(UI_MESSAGES.TEMPLATE.DELETE_CONFIRM)) return;
    setBusyId(id);
    try {
      await apiRef.current.remove(id);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          ready ? (
            <>
              <Button variant="outline" onClick={handleSync} disabled={syncing || busy}>
                <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
                {syncing ? UI_MESSAGES.TEMPLATE.SYNCING : UI_MESSAGES.TEMPLATE.SYNC}
              </Button>
              <Link href={createHref}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> {UI_MESSAGES.TEMPLATE.CREATE}
                </Button>
              </Link>
            </>
          ) : null
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          {toolbarStart}
          {ready ? (
            <>
              <div className="min-w-[150px] flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">{UI_MESSAGES.COMMON.SEARCH}</label>
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Template name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {UI_MESSAGES.FILTERS.CATEGORY_LABEL}
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{UI_MESSAGES.FILTERS.ALL}</option>
                  {TEMPLATE_CATEGORY_VALUES.map((c) => (
                    <option key={c} value={c}>
                      {TEMPLATE_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {UI_MESSAGES.FILTERS.STATUS_LABEL}
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{UI_MESSAGES.FILTERS.ALL}</option>
                  {Object.values(TEMPLATE_STATUS).map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {!ready ? (
            <p className="p-6 text-muted-foreground">{notReadyMessage ?? UI_MESSAGES.COMMON.EMPTY}</p>
          ) : loading ? (
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
                      label={UI_MESSAGES.TABLE.COL_NAME}
                      field={TEMPLATE_SORT_FIELD.NAME}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_CATEGORY}
                      field={TEMPLATE_SORT_FIELD.CATEGORY}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <TableHead>{UI_MESSAGES.TABLE.COL_LANGUAGE}</TableHead>
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_STATUS}
                      field={TEMPLATE_SORT_FIELD.STATUS}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_CREATED}
                      field={TEMPLATE_SORT_FIELD.CREATED_AT}
                      sort={sort}
                      onSort={handleSort}
                    />
                    {onCopyCurl ? <TableHead>{UI_MESSAGES.CURL.COL_API}</TableHead> : null}
                    <TableHead className="text-right">{UI_MESSAGES.TABLE.COL_ACTIONS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => setSelected(t)}
                          className="font-medium text-primary hover:underline"
                        >
                          {t.name}
                        </button>
                      </TableCell>
                      <TableCell>{TEMPLATE_CATEGORY_LABEL[t.category] ?? t.category}</TableCell>
                      <TableCell className="text-muted-foreground">{t.language}</TableCell>
                      <TableCell>
                        <TemplateStatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(t.created_at)}
                      </TableCell>
                      {onCopyCurl ? (
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => onCopyCurl(t)}>
                            <Terminal className="mr-1.5 h-3.5 w-3.5" />
                            {UI_MESSAGES.CURL.COPY_CURL}
                          </Button>
                        </TableCell>
                      ) : null}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(t.id)}
                          disabled={busyId === t.id || t.status === TEMPLATE_STATUS.DELETED}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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

      <TemplateDetailsDialog template={selected} onClose={() => setSelected(null)} />
    </>
  );
}
