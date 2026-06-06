'use client';

import { useEffect, useState } from 'react';
import { UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { formatDate, pickErrorMessage } from '@/lib/utils';
import type { MessageLog, Pagination } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusBadge = (s: string) => {
  const m: Record<string, 'success' | 'destructive' | 'warning' | 'muted'> = {
    sent: 'success',
    delivered: 'success',
    read: 'success',
    failed: 'destructive',
    queued: 'warning',
  };
  return m[s] ?? 'muted';
};

export default function AdminMessagesPage() {
  const [items, setItems] = useState<MessageLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await superAdminApi.listMessages({ page: 1, pageSize: 100 });
        setItems(res.data);
        if (res.meta?.pagination) setPagination(res.meta.pagination);
      } catch (err) {
        setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.ADMIN.MESSAGES_TITLE}
        description={pagination ? `${pagination.total} total messages across all tenants` : undefined}
      />
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
                  <TableHead>Created</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Meta ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDate(m.created_at)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.company_id}</TableCell>
                    <TableCell className="font-medium">{m.recipient_phone}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge(m.status)}>{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.meta_message_id ?? '—'}</TableCell>
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
