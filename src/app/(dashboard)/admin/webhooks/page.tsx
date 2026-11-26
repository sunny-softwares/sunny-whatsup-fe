'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { Info } from 'lucide-react';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { superAdminWebhookApi } from '@/lib/api/webhook.api';
import { WebhooksView } from '@/components/webhooks/WebhooksView';
import { AdminCompanySelector } from '@/components/webhooks/AdminCompanySelector';
import { useAdminCompanySelection } from '@/hooks/useAdminCompanySelection';

const M = UI_MESSAGES.WEBHOOKS;

function AdminWebhooksInner() {
  const { companyId, company, companies, error, selectCompany, withCompany } = useAdminCompanySelection(
    ROUTES.ADMIN.WEBHOOKS,
  );
  const api = useMemo(() => superAdminWebhookApi(companyId), [companyId]);

  const featureOffNotice = (
    <div role="status" className="flex items-start gap-3 rounded-md border bg-muted/50 px-4 py-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">
          {company ? M.FEATURE_OFF_TITLE(company.name) : M.FEATURE_OFF_TITLE_GENERIC}
        </p>
        <p className="text-muted-foreground">
          {M.FEATURE_OFF_BODY}{' '}
          <Link href={withCompany(ROUTES.ADMIN.FEATURES)} className="font-medium text-primary underline-offset-4 hover:underline">
            {M.FEATURE_OFF_LINK}
          </Link>
        </p>
      </div>
    </div>
  );

  return (
    <WebhooksView
      title={M.ADMIN_TITLE}
      description={M.ADMIN_SUBTITLE}
      api={api}
      deliveriesHref={withCompany(ROUTES.ADMIN.WEBHOOK_DELIVERIES)}
      ready={!!companyId}
      notReadyMessage={M.NO_COMPANY_SELECTED}
      reloadKey={companyId}
      toolbarStart={
        <AdminCompanySelector companies={companies} value={companyId} onChange={selectCompany} error={error} />
      }
      featureOffNotice={featureOffNotice}
    />
  );
}

export default function AdminWebhooksPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <AdminWebhooksInner />
    </Suspense>
  );
}
