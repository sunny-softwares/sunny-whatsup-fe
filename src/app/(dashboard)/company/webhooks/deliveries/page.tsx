'use client';

import { ROUTES } from '@/constants';
import { companyWebhookApi } from '@/lib/api/webhook.api';
import { WebhookDeliveriesView } from '@/components/webhooks/WebhookDeliveriesView';

export default function CompanyWebhookDeliveriesPage() {
  return <WebhookDeliveriesView api={companyWebhookApi} backHref={ROUTES.COMPANY.WEBHOOKS} />;
}
