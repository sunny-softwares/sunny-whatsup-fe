'use client';

import { ROUTES, UI_MESSAGES } from '@/constants';
import { companyWebhookApi } from '@/lib/api/webhook.api';
import { WebhooksView } from '@/components/webhooks/WebhooksView';

export default function CompanyWebhooksPage() {
  return (
    <WebhooksView
      title={UI_MESSAGES.WEBHOOKS.TITLE}
      description={UI_MESSAGES.WEBHOOKS.SUBTITLE}
      api={companyWebhookApi}
      deliveriesHref={ROUTES.COMPANY.WEBHOOK_DELIVERIES}
    />
  );
}
