'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { pickErrorMessage } from '@/lib/utils';
import type { CreateTemplateInput } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { TemplateForm } from '@/components/dashboard/TemplateForm';

const COMPANY_QUERY_KEY = 'companyId';

function NewAdminTemplateInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get(COMPANY_QUERY_KEY) ?? '';

  const [companyName, setCompanyName] = useState('');
  const backHref = `${ROUTES.ADMIN.TEMPLATES}?${COMPANY_QUERY_KEY}=${companyId}`;

  useEffect(() => {
    if (!companyId) return;
    superAdminApi
      .getCompany(companyId)
      .then((res) => setCompanyName(res.data.name))
      .catch(() => setCompanyName(''));
  }, [companyId]);

  const handleSubmit = async (payload: CreateTemplateInput) => {
    await superAdminApi.createCompanyTemplate(companyId, payload);
    router.push(backHref);
  };

  if (!companyId) {
    return (
      <>
        <PageHeader title={UI_MESSAGES.COMPANY.NEW_TEMPLATE_TITLE} />
        <p className="text-muted-foreground">{UI_MESSAGES.ADMIN.NO_COMPANY_SELECTED}</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.COMPANY.NEW_TEMPLATE_TITLE}
        description={
          companyName
            ? `Submitting on behalf of ${companyName}.`
            : 'Submit a new message template to Meta for review.'
        }
        actions={
          <Button variant="ghost" onClick={() => router.push(backHref)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <TemplateForm onSubmit={handleSubmit} onCancel={() => router.push(backHref)} />
    </>
  );
}

export default function NewAdminTemplatePage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <NewAdminTemplateInner />
    </Suspense>
  );
}
