'use client';

import { ROUTES } from '@/constants';
import { companyWebhookGuideApi } from '@/lib/api/webhook.api';
import { WebhookGuideView } from '@/components/webhooks/WebhookGuideView';

export default function CompanyWebhookGuidePage() {
  return <WebhookGuideView api={companyWebhookGuideApi} backHref={ROUTES.COMPANY.WEBHOOKS} />;
}
