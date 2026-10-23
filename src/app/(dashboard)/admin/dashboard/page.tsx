'use client';

import { useEffect, useState } from 'react';
import { Building2, MessageSquare, Send, Users, XCircle } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { pickErrorMessage } from '@/lib/utils';
import type { SuperAdminStats } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

/**
 * The super admin's home screen.
 *
 * Two layers, deliberately separate. The cards at the top are the unfiltered
 * platform snapshot — approvals waiting, companies connected, messages ever
 * sent — and they must render immediately and never move, because they are what
 * the page is opened for. Everything below them is the analytics workspace: a
 * date window, filters, and panels that each fetch only while their tab is
 * open.
 *
 * Keeping them apart means a slow aggregate query over the message log can
 * never delay the number that says four companies are waiting for approval.
 */
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

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.ADMIN.DASHBOARD_TITLE}
        description="Platform-wide activity and approvals"
      />

      {loading ? <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p> : null}
      {error ? <p className="text-destructive">{error}</p> : null}

      {stats ? (
        <>
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
            <StatCard
              label="Connected WABAs"
              value={stats.waba_accounts}
              icon={Building2}
              accent="success"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard label="Messages (total)" value={stats.messages.total} icon={MessageSquare} />
            <StatCard
              label="Messages sent"
              value={stats.messages.sent}
              icon={Send}
              accent="success"
            />
            <StatCard
              label="Failed"
              value={stats.messages.failed}
              icon={XCircle}
              accent="destructive"
            />
          </div>
        </>
      ) : null}

      {/* The 7-day chart that used to sit here is now the Trends tab, where it
          answers the same question over any window and any set of filters. */}
      <div className="mt-8 border-t pt-8">
        <AnalyticsDashboard />
      </div>
    </>
  );
}
