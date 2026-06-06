'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, ROUTES } from '@/constants';
import { useAuthStore } from '@/store/auth.store';

export default function RootPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    router.replace(user.role === ROLES.SUPER_ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.COMPANY.DASHBOARD);
  }, [user, isHydrated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting…</p>
    </main>
  );
}
