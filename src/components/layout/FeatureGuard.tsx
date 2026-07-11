'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROLES, UI_MESSAGES, featureForPath, firstEnabledRoute } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { useFeatureStore } from '@/store/feature.store';

/**
 * Client-side feature gate for company admins. Blocks direct navigation to
 * pages whose feature the super admin has disabled: the user is redirected to
 * their first enabled feature, or shown a notice when nothing is enabled.
 * Super admins (and unmapped paths) pass through untouched. The backend
 * enforces the same rules on every API, so this guard is UX, not security.
 */
export function FeatureGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { features, load } = useFeatureStore();

  const isCompanyAdmin = user?.role === ROLES.COMPANY_ADMIN;

  // (Re)load whenever the signed-in user changes, so a re-login never sees a
  // previous session's flags.
  useEffect(() => {
    if (isCompanyAdmin) load();
  }, [isCompanyAdmin, user?.id, load]);

  const feature = featureForPath(pathname);
  const blocked = isCompanyAdmin && features !== null && feature !== null && !features[feature];

  useEffect(() => {
    if (!blocked || !features) return;
    const fallback = firstEnabledRoute(features);
    if (fallback) router.replace(fallback);
  }, [blocked, features, router]);

  if (!isCompanyAdmin) return <>{children}</>;

  if (features === null) {
    return <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>;
  }

  if (blocked) {
    const fallback = firstEnabledRoute(features);
    // With a fallback the redirect effect is in flight; without one there is
    // nothing to navigate to, so explain instead.
    return (
      <p className="text-muted-foreground">
        {fallback ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.FEATURES.NONE_ENABLED}
      </p>
    );
  }

  return <>{children}</>;
}
