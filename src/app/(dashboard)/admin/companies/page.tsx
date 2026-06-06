'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { COMPANY_STATUS, UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { formatDate, pickErrorMessage } from '@/lib/utils';
import type { Company } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminApi.listCompanies({
        status: statusFilter || undefined,
        search: search || undefined,
        page: 1,
        pageSize: 100,
      });
      setItems(res.data);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <>
      <PageHeader title={UI_MESSAGES.ADMIN.COMPANIES_TITLE} description="Review and decide on company registrations" />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Search</label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {Object.values(COMPANY_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={load}>
            {UI_MESSAGES.COMMON.SEARCH}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-sm text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {c.status === COMPANY_STATUS.PENDING ? (
                        <div className="flex justify-end gap-2">
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
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
