'use client';

import { useMemo } from 'react';
import { UI_MESSAGES } from '@/constants';
import { companyApi } from '@/lib/api/company.api';
import { BillingView, type BillingViewApi } from '@/components/billing/BillingView';

export default function CompanyBillingPage() {
  // GET /company/waba is not behind the `waba` feature flag, so this read works
  // even for companies that only have Billing enabled.
  const api: BillingViewApi = useMemo(() => ({ getWaba: () => companyApi.getWaba() }), []);

  return (
    <BillingView
      title={UI_MESSAGES.BILLING.TITLE}
      description={UI_MESSAGES.BILLING.SUBTITLE}
      api={api}
    />
  );
}
