'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { FeatureGuard } from '@/components/layout/FeatureGuard';
import { SubscriptionGuard } from '@/components/layout/SubscriptionGuard';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, isHydrated, router]);

  // Auto-close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock background scroll while the drawer is open on mobile.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (sidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [sidebarOpen]);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar:
          - Mobile: fixed, slides in via translate-x when open
          - md+: inline flex member, always visible */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-card shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileTopBar onOpenMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:py-8">
            {/* Outside FeatureGuard: when a subscription blocks, the feature map
                collapses to the always-allowed keys, so the subscription guard
                has to decide where the user goes before the feature guard does. */}
            <SubscriptionGuard>
              <SubscriptionBanner />
              <FeatureGuard>{children}</FeatureGuard>
            </SubscriptionGuard>
          </div>
        </main>
      </div>
    </div>
  );
}
