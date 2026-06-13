'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { pickErrorMessage } from '@/lib/utils';
import type { Company } from '@/types';
import { TemplatesView, type TemplatesApi } from '@/components/dashboard/TemplatesView';

const COMPANY_QUERY_KEY = 'companyId';

function AdminTemplatesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get(COMPANY_QUERY_KEY) ?? '';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Only active companies can be acted upon, so deactivated ones are
        // excluded from the selector entirely.
        const res = await superAdminApi.listCompanies({ page: 1, pageSize: 100, is_active: true });
        setCompanies(res.data);
      } catch (err) {
        setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      }
    })();
  }, []);

  const selectCompany = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set(COMPANY_QUERY_KEY, id);
    else params.delete(COMPANY_QUERY_KEY);
    router.replace(`${ROUTES.ADMIN.TEMPLATES}?${params.toString()}`);
  };

  const api: TemplatesApi = useMemo(
    () => ({
      list: (params) => superAdminApi.listCompanyTemplates(companyId, params),
      sync: () => superAdminApi.syncCompanyTemplates(companyId),
      remove: (id) => superAdminApi.removeCompanyTemplate(companyId, id),
    }),
    [companyId],
  );

  const companySelector = (
    <div className="min-w-[220px] flex-1">
      <label className="mb-1 block text-xs text-muted-foreground">
        {UI_MESSAGES.ADMIN.SELECT_COMPANY_LABEL}
      </label>
      <select
        value={companyId}
        onChange={(e) => selectCompany(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">{UI_MESSAGES.ADMIN.SELECT_COMPANY_PLACEHOLDER}</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );

  return (
    <TemplatesView
      title={UI_MESSAGES.ADMIN.TEMPLATES_TITLE}
      description={UI_MESSAGES.ADMIN.TEMPLATES_SUBTITLE}
      createHref={`${ROUTES.ADMIN.TEMPLATES_NEW}?${COMPANY_QUERY_KEY}=${companyId}`}
      api={api}
      ready={!!companyId}
      notReadyMessage={UI_MESSAGES.ADMIN.NO_COMPANY_SELECTED}
      reloadKey={companyId}
      toolbarStart={companySelector}
    />
  );
}

export default function AdminTemplatesPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <AdminTemplatesInner />
    </Suspense>
  );
}
