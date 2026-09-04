'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { COMPANY_FEATURE, ROLES, ROUTES } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { useFeatureStore } from '@/store/feature.store';
import { useSubscriptionStore } from '@/store/subscription.store';

/**
 * Redirects a company admin to the subscription page when their subscription is
 * blocking access.
 *
 * Sits OUTSIDE FeatureGuard and runs first, because a blocked subscription
 * collapses the feature map down to the always-allowed keys — without this, a
 * locked company would be bounced around by the feature guard's fallback logic
 * instead of landing somewhere it can act.
 *
 * Purely UX. The backend returns 402 on every gated endpoint regardless, and the
 * axios interceptor catches anything this misses.
 */
export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const notice = useSubscriptionStore((s) => s.notice);
  const features = useFeatureStore((s) => s.features);

  const isCompanyAdmin = user?.role === ROLES.COMPANY_ADMIN;
  // If the super admin has switched the subscription page off, there is nowhere
  // to send a blocked company — redirecting would just bounce against
  // FeatureGuard. Leave the routing alone and let the 402 explain itself.
  const canReachSubscription = features?.[COMPANY_FEATURE.SUBSCRIPTION] === true;
  const onSubscriptionPage = pathname.startsWith(ROUTES.COMPANY.SUBSCRIPTION);
  // Settings stays reachable so a locked-out user can still change their
  // password or close the account — mirrors the backend's allow-list.
  const onSettings = pathname.startsWith(ROUTES.SETTINGS.ROOT);

  const blocked = isCompanyAdmin && notice?.is_blocking === true;

  useEffect(() => {
    if (blocked && canReachSubscription && !onSubscriptionPage && !onSettings) {
      router.replace(ROUTES.COMPANY.SUBSCRIPTION);
    }
  }, [blocked, canReachSubscription, onSubscriptionPage, onSettings, router]);

  return <>{children}</>;
}
