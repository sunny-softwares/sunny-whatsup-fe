'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Power, X } from 'lucide-react';
import {
  COMPANY_STATUS,
  COMPANY_SORT_FIELD,
  SORT_ORDER,
  DEFAULT_PAGE_SIZE,
  UI_MESSAGES,
  type SortOrder,
} from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { formatDate, pickErrorMessage } from '@/lib/utils';
import type { Company, Pagination as PaginationMeta } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader, nextSort } from '@/components/ui/sortable-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusBadge = (s: string): 'success' | 'warning' | 'destructive' | 'muted' => {
  if (s === COMPANY_STATUS.APPROVED) return 'success';
  if (s === COMPANY_STATUS.PENDING) return 'warning';
  if (s === COMPANY_STATUS.REJECTED) return 'destructive';
  return 'muted';
};

export default function AdminCompaniesPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ by: string; order: SortOrder }>({
    by: COMPANY_SORT_FIELD.CREATED_AT,
    order: SORT_ORDER.DESC,
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await superAdminApi.listCompanies({
        status: statusFilter || undefined,
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
  }, [statusFilter, search, page, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (field: string) => {
    setSort((prev) => nextSort(prev, field));
    setPage(1);
  };

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await superAdminApi.approveCompany(id);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection (optional):') || undefined;
    setBusyId(id);
    try {
      await superAdminApi.rejectCompany(id, reason);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    if (isActive && !window.confirm(UI_MESSAGES.ADMIN.DEACTIVATE_CONFIRM)) return;
    setBusyId(id);
    try {
      await superAdminApi.setCompanyActive(id, !isActive);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title={UI_MESSAGES.ADMIN.COMPANIES_TITLE} description="Review and decide on company registrations" />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">{UI_MESSAGES.COMMON.SEARCH}</label>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Name or email"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.FILTERS.STATUS_LABEL}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{UI_MESSAGES.FILTERS.ALL}</option>
              {Object.values(COMPANY_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
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
                      label={UI_MESSAGES.TABLE.COL_COMPANY}
                      field={COMPANY_SORT_FIELD.NAME}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <TableHead>{UI_MESSAGES.TABLE.COL_CONTACT}</TableHead>
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_STATUS}
                      field={COMPANY_SORT_FIELD.STATUS}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={UI_MESSAGES.TABLE.COL_REGISTERED}
                      field={COMPANY_SORT_FIELD.CREATED_AT}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <TableHead>{UI_MESSAGES.TABLE.COL_ACTIVE}</TableHead>
                    <TableHead className="text-right">{UI_MESSAGES.TABLE.COL_ACTIONS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium">{c.name}</div>
                        {c.legal_name ? <div className="text-xs text-muted-foreground">{c.legal_name}</div> : null}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.contact_email}</div>
                        <div className="text-xs text-muted-foreground">{c.contact_phone ?? '—'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge(c.status)}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(c.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.is_active ? 'success' : 'muted'}>
                          {c.is_active ? UI_MESSAGES.ADMIN.ACTIVE : UI_MESSAGES.ADMIN.INACTIVE}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {c.status === COMPANY_STATUS.PENDING ? (
                            <>
                              <Button size="sm" onClick={() => handleApprove(c.id)} disabled={busyId === c.id}>
                                <Check className="mr-1 h-4 w-4" /> {UI_MESSAGES.ADMIN.APPROVE}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(c.id)}
                                disabled={busyId === c.id}
                              >
                                <X className="mr-1 h-4 w-4" /> {UI_MESSAGES.ADMIN.REJECT}
                              </Button>
                            </>
                          ) : null}
                          <Button
                            size="sm"
                            variant={c.is_active ? 'outline' : 'default'}
                            onClick={() => handleToggleActive(c.id, c.is_active)}
                            disabled={busyId === c.id}
                          >
                            <Power className="mr-1 h-4 w-4" />
                            {c.is_active ? UI_MESSAGES.ADMIN.DEACTIVATE : UI_MESSAGES.ADMIN.ACTIVATE}
                          </Button>
                        </div>
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
