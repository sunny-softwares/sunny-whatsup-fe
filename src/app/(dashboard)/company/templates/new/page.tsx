'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { templateApi } from '@/lib/api/template.api';
import type { CreateTemplateInput } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { TemplateForm } from '@/components/dashboard/TemplateForm';

export default function NewTemplatePage() {
  const router = useRouter();

  const handleSubmit = async (payload: CreateTemplateInput) => {
    await templateApi.create(payload);
    router.push(ROUTES.COMPANY.TEMPLATES);
  };

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.COMPANY.NEW_TEMPLATE_TITLE}
        description="Submit a new message template to Meta for review."
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <TemplateForm onSubmit={handleSubmit} onCancel={() => router.back()} />
    </>
  );
}
