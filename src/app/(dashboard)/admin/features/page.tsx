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
import { adminSubscriptionApi } from '@/lib/api/adminSubscription.api';
import { pickErrorMessage } from '@/lib/utils';
import type { Company, CompanyFeatureDetail, CompanyFeatures } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  // Per-key breakdown of WHY each feature is on: a manual override, the
  // company's plan, or neither. Without it a deliberate toggle is
  // indistinguishable from an inherited plan grant.
  const [detail, setDetail] = useState<CompanyFeatureDetail[]>([]);
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
      setDetail([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await adminSubscriptionApi.getCompanyFeatures(companyId);
      setFeatures(res.data);
      setDetail(res.meta?.features ?? []);
    } catch (err) {
      setFeatures(null);
      setDetail([]);
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
      await superAdminApi.setCompanyFeature(companyId, featureKey, isEnabled);
      // Reload rather than trusting the toggle response: the source breakdown
      // changes too (this key is now an override), and only the GET returns it.
      await loadFeatures();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyKey(null);
    }
  };

  /**
   * Drops the manual override so the feature falls back to the company's plan
   * grant — the way to undo a toggle without pinning the opposite value forever.
   */
  const handleClearOverride = async (featureKey: CompanyFeatureKey) => {
    setBusyKey(featureKey);
    setError(null);
    try {
      await adminSubscriptionApi.clearFeatureOverride(companyId, featureKey);
      await loadFeatures();
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
                const info = detail.find((d) => d.feature_key === key);

                return (
                  <li key={key} className="flex flex-wrap items-center gap-4 p-4">
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

                    {/* Where this value came from. A manual override beats the
                        plan; the plan beats default-deny. */}
                    {info?.is_override ? (
                      <Badge variant="outline">{UI_MESSAGES.FEATURES.SOURCE_OVERRIDE}</Badge>
                    ) : info?.plan_grants ? (
                      <Badge variant="muted">{UI_MESSAGES.FEATURES.SOURCE_PLAN}</Badge>
                    ) : null}

                    {info?.is_override ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyKey === key}
                        onClick={() => handleClearOverride(key)}
                      >
                        {UI_MESSAGES.FEATURES.RESET_TO_PLAN}
                      </Button>
                    ) : null}

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
