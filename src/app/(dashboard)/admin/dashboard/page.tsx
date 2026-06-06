'use client';

import { useEffect, useState } from 'react';
import { Building2, MessageSquare, Send, Users, XCircle } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { pickErrorMessage } from '@/lib/utils';
import type { SuperAdminStats } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { MessagesChart } from '@/components/dashboard/MessagesChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await superAdminApi.stats();
        setStats(res.data);
      } catch (err) {
        setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!stats) return <p className="text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</p>;

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.ADMIN.DASHBOARD_TITLE}
        description="Platform-wide activity and approvals"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Companies (total)"
          value={stats.companies.total}
          hint={`${stats.companies.approved} approved`}
          icon={Building2}
        />
        <StatCard
          label="Pending approvals"
          value={stats.companies.pending}
          icon={Building2}
          accent={stats.companies.pending > 0 ? 'warning' : 'default'}
        />
        <StatCard label="Users" value={stats.users} icon={Users} />
        <StatCard label="Connected WABAs" value={stats.waba_accounts} icon={Building2} accent="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Messages (total)" value={stats.messages.total} icon={MessageSquare} />
        <StatCard label="Messages sent" value={stats.messages.sent} icon={Send} accent="success" />
        <StatCard label="Failed" value={stats.messages.failed} icon={XCircle} accent="destructive" />
      </div>

      <div className="mt-6">
        <MessagesChart data={stats.messages.by_day} />
      </div>
    </>
  );
}
