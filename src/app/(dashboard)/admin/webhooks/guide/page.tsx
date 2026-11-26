'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { superAdminWebhookGuideApi } from '@/lib/api/webhook.api';
import { WebhookGuideView } from '@/components/webhooks/WebhookGuideView';
import { COMPANY_QUERY_KEY, withCompanyQuery } from '@/hooks/useAdminCompanySelection';

// The guide is the same for every company; the selected company only travels
// along so "back" returns to the same company's webhook page.
function AdminWebhookGuideInner() {
  const companyId = useSearchParams().get(COMPANY_QUERY_KEY) ?? '';
  return (
    <WebhookGuideView
      api={superAdminWebhookGuideApi}
      backHref={withCompanyQuery(ROUTES.ADMIN.WEBHOOKS, companyId)}
    />
  );
}

export default function AdminWebhookGuidePage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <AdminWebhookGuideInner />
    </Suspense>
  );
}
