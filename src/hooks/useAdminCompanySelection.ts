'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { pickErrorMessage } from '@/lib/utils';
import type { Company } from '@/types';

export const COMPANY_QUERY_KEY = 'companyId';

/**
 * The company a super-admin webhook page acts on, kept in `?companyId=` so the
 * settings page and the delivery log can link to each other for the same
 * company (the same convention as the other on-behalf-of pages).
 */
export function useAdminCompanySelection(basePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get(COMPANY_QUERY_KEY) ?? '';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Only active companies can be acted upon.
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
    router.replace(`${basePath}?${params.toString()}`);
  };

  const withCompany = (path: string) =>
    companyId ? `${path}?${new URLSearchParams({ [COMPANY_QUERY_KEY]: companyId })}` : path;

  return {
    companyId,
    company: companies.find((c) => c.id === companyId) ?? null,
    companies,
    error,
    selectCompany,
    withCompany,
  };
}
