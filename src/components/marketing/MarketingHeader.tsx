'use client';

import Link from 'next/link';
import { ENV, ROLES, ROUTES } from '@/constants';
import { useAuthStore } from '@/store/auth.store';

/**
 * Top navigation for the public marketing pages.
 *
 * Auth-aware: until the auth store hydrates (SSR / first paint) we render the
 * logged-out CTAs to avoid layout shift. Once hydrated, logged-in users see a
 * single "Go to dashboard" link routed to the dashboard appropriate for their
 * role — they are never redirected away from the marketing site itself.
 */
export function MarketingHeader() {
  const { user, isHydrated } = useAuthStore();

  const dashboardHref =
    user?.role === ROLES.SUPER_ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.COMPANY.DASHBOARD;
  const showLoggedInCta = isHydrated && !!user;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <span className="rounded-lg bg-primary px-2.5 py-1 text-sm font-bold text-primary-foreground">
            {ENV.APP_NAME}
          </span>
        </Link>

        {/* In-page anchor nav (desktop only) */}
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#security" className="transition-colors hover:text-foreground">
            Security
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3 text-sm">
          {showLoggedInCta ? (
            <Link
              href={dashboardHref}
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.LOGIN}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
