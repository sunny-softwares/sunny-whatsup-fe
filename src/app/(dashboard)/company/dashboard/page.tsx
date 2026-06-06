'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageSquare, Send, XCircle } from 'lucide-react';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { companyApi } from '@/lib/api/company.api';
import { pickErrorMessage } from '@/lib/utils';
import type { CompanyStats } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { MessagesChart } from '@/components/dashboard/MessagesChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompanyDashboardPage() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await companyApi.stats();
        if (mounted) setStats(res.data);
      } catch (err) {
        if (mounted) setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!stats) return <p className="text-muted-foreground">{UI_MESSAGES.COMMON.EMPTY}</p>;

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.COMPANY.DASHBOARD_TITLE}
        description="Your WhatsApp Business activity at a glance"
      />

      {!stats.waba_connected ? (
        <Card className="mb-6 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">{UI_MESSAGES.COMPANY.CONNECT_WABA}</CardTitle>
            <CardDescription className="text-yellow-800">
              {UI_MESSAGES.COMPANY.NO_WABA_YET}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={ROUTES.COMPANY.WABA}>
              <Button>Connect Meta WABA</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total messages" value={stats.messages.total} icon={MessageSquare} />
        <StatCard label="Sent" value={stats.messages.sent} icon={Send} accent="success" />
        <StatCard label="Failed" value={stats.messages.failed} icon={XCircle} accent="destructive" />
        <StatCard
          label="WABA"
          value={stats.waba_connected ? 'Connected' : 'Not connected'}
          icon={CheckCircle2}
          accent={stats.waba_connected ? 'success' : 'warning'}
        />
      </div>

      <div className="mt-6">
        <MessagesChart data={stats.messages.by_day} />
      </div>
    </>
  );
}
