'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { pickErrorMessage } from '@/lib/utils';
import type { Company } from '@/types';
import { WabaView, type WabaViewApi } from '@/components/dashboard/WabaView';
import { SearchableSelect } from '@/components/ui/searchable-select';

const COMPANY_QUERY_KEY = 'companyId';

function AdminWabaInner() {
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
    router.replace(`${ROUTES.ADMIN.WABA}?${params.toString()}`);
  };

  const api: WabaViewApi = useMemo(
    () => ({
      getWaba: () => superAdminApi.getCompanyWaba(companyId),
      connectWaba: (payload) => superAdminApi.connectCompanyWaba(companyId, payload),
      disconnectWaba: () => superAdminApi.disconnectCompanyWaba(companyId),
      syncWaba: () => superAdminApi.syncCompanyWaba(companyId),
      listTemplates: (params) => superAdminApi.listCompanyTemplates(companyId, params),
      listMessages: (params) => superAdminApi.listCompanyMessages(companyId, params),
      requestPhoneCode: (phoneId, codeMethod) =>
        superAdminApi.requestCompanyPhoneCode(companyId, phoneId, { code_method: codeMethod }),
      verifyPhoneCode: (phoneId, code) =>
        superAdminApi.verifyCompanyPhoneCode(companyId, phoneId, code),
      registerPhone: (phoneId, pin) => superAdminApi.registerCompanyPhone(companyId, phoneId, pin),
    }),
    [companyId],
  );

  const companySelector = (
    <div className="min-w-[220px] flex-1">
      <label className="mb-1 block text-xs text-muted-foreground">
        {UI_MESSAGES.ADMIN.SELECT_COMPANY_LABEL}
      </label>
      <SearchableSelect
        options={companies.map((c) => ({ value: c.id, label: c.name }))}
        value={companyId}
        onChange={selectCompany}
        placeholder={UI_MESSAGES.ADMIN.SELECT_COMPANY_PLACEHOLDER}
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );

  return (
    <WabaView
      title={UI_MESSAGES.ADMIN.WABA_TITLE}
      description={UI_MESSAGES.ADMIN.WABA_SUBTITLE}
      api={api}
      ready={!!companyId}
      notReadyMessage={UI_MESSAGES.ADMIN.NO_COMPANY_SELECTED_WABA}
      reloadKey={companyId}
      toolbarStart={companySelector}
    />
  );
}

export default function AdminWabaPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <AdminWabaInner />
    </Suspense>
  );
}
