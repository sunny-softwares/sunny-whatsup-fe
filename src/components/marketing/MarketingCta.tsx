'use client';

import Link from 'next/link';
import { ROLES, ROUTES } from '@/constants';
import { useAuthStore } from '@/store/auth.store';

interface MarketingCtaProps {
  /** Optional custom label for the logged-out primary CTA. */
  primaryLabelLoggedOut?: string;
  /** Optional custom label for the logged-in CTA (when user is already authenticated). */
  primaryLabelLoggedIn?: string;
  /** Whether to render the secondary "Sign in" link next to the primary CTA. */
  showSecondary?: boolean;
  /** Tailwind alignment class for the wrapping flex container. */
  align?: 'left' | 'center';
}

/**
 * Reusable hero/section CTA that switches its target based on auth state.
 * Logged-out users see "Get started" → /register and "Sign in" → /login.
 * Logged-in users see a single "Go to your dashboard" routed by role.
 */
export function MarketingCta({
  primaryLabelLoggedOut = 'Get started for free',
  primaryLabelLoggedIn = 'Go to your dashboard',
  showSecondary = true,
  align = 'left',
}: MarketingCtaProps) {
  const { user, isHydrated } = useAuthStore();
  const dashboardHref =
    user?.role === ROLES.SUPER_ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.COMPANY.DASHBOARD;
  const showLoggedInCta = isHydrated && !!user;

  const wrapperJustify = align === 'center' ? 'justify-center' : 'justify-start';

  if (showLoggedInCta) {
    return (
      <div className={`flex flex-wrap items-center gap-4 ${wrapperJustify}`}>
        <Link
          href={dashboardHref}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          {primaryLabelLoggedIn}
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 ${wrapperJustify}`}>
      <Link
        href={ROUTES.REGISTER}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        {primaryLabelLoggedOut}
      </Link>
      {showSecondary ? (
        <Link
          href={ROUTES.LOGIN}
          className="rounded-md border border-input bg-background px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Sign in
        </Link>
      ) : null}
    </div>
  );
}
