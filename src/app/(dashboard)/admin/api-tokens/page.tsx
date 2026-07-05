'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Copy, KeyRound, RefreshCw, Trash2 } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { formatDate, pickErrorMessage } from '@/lib/utils';
import type { ApiTokenCompanyRow, Company, Pagination as PaginationMeta } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RevealedToken {
  title: string;
  token: string;
  companyName: string;
}

export default function AdminApiTokensPage() {
  const [rows, setRows] = useState<ApiTokenCompanyRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyCompanyId, setBusyCompanyId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [companyFilter, setCompanyFilter] = useState('');

  // Plaintext token shown after create/rotate.
  const [revealed, setRevealed] = useState<RevealedToken | null>(null);
  const [copied, setCopied] = useState(false);
  // Row whose token was just copied via the inline copy icon.
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  const [rotateTarget, setRotateTarget] = useState<ApiTokenCompanyRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiTokenCompanyRow | null>(null);

  // Company options for the searchable filter dropdown.
  useEffect(() => {
    (async () => {
      try {
        const res = await superAdminApi.listCompanies({ page: 1, pageSize: 100, is_active: true });
        setCompanies(res.data);
      } catch {
        // The filter simply stays empty; the table itself reports errors.
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await superAdminApi.listApiTokens({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        company_id: companyFilter || undefined,
      });
      setRows(res.data);
      setPagination(res.meta?.pagination ?? null);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [page, companyFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: c.id, label: c.name })),
    [companies],
  );

  const selectCompanyFilter = (id: string) => {
    setCompanyFilter(id);
    setPage(1);
  };

  const handleCreate = async (row: ApiTokenCompanyRow) => {
    setBusyCompanyId(row.id);
    setError(null);
    try {
      const res = await superAdminApi.createCompanyApiToken(row.id);
      setCopied(false);
      setRevealed({
        title: UI_MESSAGES.API_TOKEN.CREATED_TITLE,
        token: res.data.token,
        companyName: row.name,
      });
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyCompanyId(null);
    }
  };

  const handleRotate = async () => {
    if (!rotateTarget) return;
    setBusyCompanyId(rotateTarget.id);
    setError(null);
    try {
      const res = await superAdminApi.rotateCompanyApiToken(rotateTarget.id);
      setCopied(false);
      setRevealed({
        title: UI_MESSAGES.API_TOKEN.ROTATED_TITLE,
        token: res.data.token,
        companyName: rotateTarget.name,
      });
      setRotateTarget(null);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyCompanyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyCompanyId(deleteTarget.id);
    setError(null);
    try {
      await superAdminApi.deleteCompanyApiToken(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyCompanyId(null);
    }
  };

  // Copies the token plaintext for an existing row via the reveal endpoint.
  const handleCopyToken = async (row: ApiTokenCompanyRow) => {
    setBusyCompanyId(row.id);
    setError(null);
    try {
      const res = await superAdminApi.revealCompanyApiToken(row.id);
      if (!res.data.token) {
        setError(UI_MESSAGES.API_TOKEN.NOT_REVEALABLE);
        return;
      }
      await navigator.clipboard.writeText(res.data.token);
      setCopiedRowId(row.id);
      setTimeout(() => setCopiedRowId((prev) => (prev === row.id ? null : prev)), 2000);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyCompanyId(null);
    }
  };

  const handleCopyRevealed = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.token);
      setCopied(true);
    } catch {
      // Clipboard unavailable — the token stays visible for manual copying.
    }
  };

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.API_TOKEN.TITLE}
        description={UI_MESSAGES.API_TOKEN.SUBTITLE}
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[220px] flex-1 sm:max-w-xs">
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.ADMIN.SELECT_COMPANY_LABEL}
            </label>
            <SearchableSelect
              options={companyOptions}
              value={companyFilter}
              onChange={selectCompanyFilter}
              placeholder={UI_MESSAGES.ADMIN.SELECT_COMPANY_PLACEHOLDER}
            />
          </div>
        </CardContent>
      </Card>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{UI_MESSAGES.TABLE.COL_COMPANY}</TableHead>
                    <TableHead>{UI_MESSAGES.API_TOKEN.COL_TOKEN}</TableHead>
                    <TableHead>{UI_MESSAGES.API_TOKEN.COL_SCOPES}</TableHead>
                    <TableHead>{UI_MESSAGES.TABLE.COL_CREATED}</TableHead>
                    <TableHead>{UI_MESSAGES.API_TOKEN.COL_LAST_USED}</TableHead>
                    <TableHead className="text-right">{UI_MESSAGES.TABLE.COL_ACTIONS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const token = row.apiToken;
                    const rowBusy = busyCompanyId === row.id;
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>
                          {token ? (
                            <span className="inline-flex items-center gap-1.5">
                              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                {token.token_hint}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopyToken(row)}
                                disabled={rowBusy}
                                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                                title={UI_MESSAGES.API_TOKEN.COPY_TOKEN}
                                aria-label={UI_MESSAGES.API_TOKEN.COPY_TOKEN}
                              >
                                {copiedRowId === row.id ? (
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {UI_MESSAGES.API_TOKEN.NO_TOKEN}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {token ? (
                            <div className="flex flex-wrap gap-1">
                              {token.scopes.map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {token ? formatDate(token.created_at) : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {token
                            ? token.last_used_at
                              ? formatDate(token.last_used_at)
                              : UI_MESSAGES.API_TOKEN.NEVER_USED
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {token ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRotateTarget(row)}
                                disabled={rowBusy}
                              >
                                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                {UI_MESSAGES.API_TOKEN.ROTATE}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteTarget(row)}
                                disabled={rowBusy}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => handleCreate(row)} disabled={rowBusy}>
                              <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                              {UI_MESSAGES.API_TOKEN.CREATE}
                            </Button>
                          )}
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
                  disabled={busy}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* Plaintext reveal after create/rotate. */}
      <Dialog open={!!revealed} onOpenChange={(next) => (next ? null : setRevealed(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{revealed?.title}</DialogTitle>
            <DialogDescription className="mt-1">
              {revealed?.companyName} — {UI_MESSAGES.API_TOKEN.REVEAL_HINT}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md border bg-muted p-3 text-xs">
              {revealed?.token}
            </code>
            <Button variant="outline" size="sm" className="shrink-0" onClick={handleCopyRevealed}>
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" /> {UI_MESSAGES.API_TOKEN.COPIED}
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> {UI_MESSAGES.API_TOKEN.COPY}
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealed(null)}>{UI_MESSAGES.API_TOKEN.DONE}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!rotateTarget}
        onOpenChange={(next) => (next ? null : setRotateTarget(null))}
        title={UI_MESSAGES.API_TOKEN.ROTATE_CONFIRM_TITLE}
        description={UI_MESSAGES.API_TOKEN.ROTATE_CONFIRM}
        confirmLabel={UI_MESSAGES.API_TOKEN.ROTATE}
        cancelLabel={UI_MESSAGES.COMMON.CANCEL}
        loading={!!rotateTarget && busyCompanyId === rotateTarget.id}
        onConfirm={handleRotate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(next) => (next ? null : setDeleteTarget(null))}
        destructive
        title={UI_MESSAGES.API_TOKEN.DELETE_CONFIRM_TITLE}
        description={UI_MESSAGES.API_TOKEN.DELETE_CONFIRM}
        confirmLabel={UI_MESSAGES.API_TOKEN.DELETE}
        cancelLabel={UI_MESSAGES.COMMON.CANCEL}
        loading={!!deleteTarget && busyCompanyId === deleteTarget.id}
        onConfirm={handleDelete}
      />
    </>
  );
}
