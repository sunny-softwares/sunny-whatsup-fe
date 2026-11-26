'use client';

import { Suspense, useMemo } from 'react';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { superAdminWebhookApi } from '@/lib/api/webhook.api';
import { WebhookDeliveriesView } from '@/components/webhooks/WebhookDeliveriesView';
import { AdminCompanySelector } from '@/components/webhooks/AdminCompanySelector';
import { useAdminCompanySelection } from '@/hooks/useAdminCompanySelection';

function AdminWebhookDeliveriesInner() {
  const { companyId, companies, error, selectCompany, withCompany } = useAdminCompanySelection(
    ROUTES.ADMIN.WEBHOOK_DELIVERIES,
  );
  const api = useMemo(() => superAdminWebhookApi(companyId), [companyId]);

  return (
    <WebhookDeliveriesView
      api={api}
      backHref={withCompany(ROUTES.ADMIN.WEBHOOKS)}
      ready={!!companyId}
      notReadyMessage={UI_MESSAGES.WEBHOOKS.NO_COMPANY_SELECTED}
      reloadKey={companyId}
      toolbarStart={
        <AdminCompanySelector companies={companies} value={companyId} onChange={selectCompany} error={error} />
      }
    />
  );
}

export default function AdminWebhookDeliveriesPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <AdminWebhookDeliveriesInner />
    </Suspense>
  );
}
