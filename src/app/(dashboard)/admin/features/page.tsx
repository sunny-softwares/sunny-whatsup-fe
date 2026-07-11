'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  COMPANY_FEATURE_META,
  COMPANY_FEATURE_VALUES,
  ROUTES,
  UI_MESSAGES,
  type CompanyFeatureKey,
} from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { pickErrorMessage } from '@/lib/utils';
import type { Company, CompanyFeatures } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';

const COMPANY_QUERY_KEY = 'companyId';

function AdminFeaturesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get(COMPANY_QUERY_KEY) ?? '';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [features, setFeatures] = useState<CompanyFeatures | null>(null);
  const [loading, setLoading] = useState(false);
  // Feature key currently being toggled (disables just that row).
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Only active companies can be acted upon, matching the other
        // super-admin on-behalf-of pages.
        const res = await superAdminApi.listCompanies({ page: 1, pageSize: 100, is_active: true });
        setCompanies(res.data);
      } catch (err) {
        setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      }
    })();
  }, []);

  const loadFeatures = useCallback(async () => {
    if (!companyId) {
      setFeatures(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminApi.getCompanyFeatures(companyId);
      setFeatures(res.data);
    } catch (err) {
      setFeatures(null);
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const selectCompany = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set(COMPANY_QUERY_KEY, id);
    else params.delete(COMPANY_QUERY_KEY);
    router.replace(`${ROUTES.ADMIN.FEATURES}?${params.toString()}`);
  };

  const handleToggle = async (featureKey: CompanyFeatureKey, isEnabled: boolean) => {
    setBusyKey(featureKey);
    setError(null);
    try {
      const res = await superAdminApi.setCompanyFeature(companyId, featureKey, isEnabled);
      setFeatures(res.data);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.FEATURES.TITLE}
        description={UI_MESSAGES.FEATURES.SUBTITLE}
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[220px] flex-1 sm:max-w-xs">
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.ADMIN.SELECT_COMPANY_LABEL}
            </label>
            <SearchableSelect
              options={companies.map((c) => ({ value: c.id, label: c.name }))}
              value={companyId}
              onChange={selectCompany}
              placeholder={UI_MESSAGES.ADMIN.SELECT_COMPANY_PLACEHOLDER}
            />
          </div>
        </CardContent>
      </Card>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardContent className="p-0">
          {!companyId ? (
            <p className="p-6 text-muted-foreground">
              {UI_MESSAGES.FEATURES.NO_COMPANY_SELECTED}
            </p>
          ) : loading || !features ? (
            <p className="p-6 text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
          ) : (
            <ul className="divide-y">
              {COMPANY_FEATURE_VALUES.map((key) => {
                const meta = COMPANY_FEATURE_META[key];
                const enabled = !!features[key];
                return (
                  <li key={key} className="flex items-center gap-4 p-4">
                    <Checkbox
                      id={`feature-${key}`}
                      checked={enabled}
                      disabled={busyKey === key}
                      onChange={(e) => handleToggle(key, e.target.checked)}
                    />
                    <label htmlFor={`feature-${key}`} className="min-w-0 flex-1 cursor-pointer">
                      <span className="block text-sm font-medium">{meta.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {meta.description}
                      </span>
                    </label>
                    <Badge variant={enabled ? 'success' : 'secondary'}>
                      {enabled ? UI_MESSAGES.FEATURES.ENABLED : UI_MESSAGES.FEATURES.DISABLED}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminFeaturesPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>}>
      <AdminFeaturesInner />
    </Suspense>
  );
}
