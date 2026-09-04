'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Send,
  History,
  FileText,
  KeyRound,
  CreditCard,
  Receipt,
  Package,
  Link2,
  LogOut,
  SlidersHorizontal,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  COMPANY_FEATURE,
  ROLES,
  ROUTES,
  UI_MESSAGES,
  ENV,
  type CompanyFeatureKey,
} from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { useFeatureStore } from '@/store/feature.store';
import { useSubscriptionStore } from '@/store/subscription.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  // Company-side items are visible only when the super admin enabled this
  // feature for the company. Admin items carry no feature key.
  feature?: CompanyFeatureKey;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavItem[];
}

const COMPANY_NAV: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.COMPANY.DASHBOARD, icon: LayoutDashboard, feature: COMPANY_FEATURE.DASHBOARD },
  { label: 'Meta WABA', href: ROUTES.COMPANY.WABA, icon: Building2, feature: COMPANY_FEATURE.WABA },
  { label: 'Templates', href: ROUTES.COMPANY.TEMPLATES, icon: FileText, feature: COMPANY_FEATURE.TEMPLATES },
  { label: 'Send Message', href: ROUTES.COMPANY.SEND_MESSAGE, icon: Send, feature: COMPANY_FEATURE.SEND_MESSAGE },
  { label: 'Messages', href: ROUTES.COMPANY.MESSAGES, icon: History, feature: COMPANY_FEATURE.MESSAGES },
  { label: UI_MESSAGES.BILLING.NAV_LABEL, href: ROUTES.COMPANY.BILLING, icon: CreditCard, feature: COMPANY_FEATURE.BILLING },
  // No `feature` key on purpose: the subscription page must stay reachable
  // whatever the feature map says, especially when the company is locked out for
  // non-payment and this is the only page that can fix it.
  { label: UI_MESSAGES.SUBSCRIPTION.NAV_LABEL, href: ROUTES.COMPANY.SUBSCRIPTION, icon: Receipt },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: 'Companies', href: ROUTES.ADMIN.COMPANIES, icon: Building2 },
  { label: UI_MESSAGES.FEATURES.NAV_LABEL, href: ROUTES.ADMIN.FEATURES, icon: SlidersHorizontal },
  { label: 'Meta WABA', href: ROUTES.ADMIN.WABA, icon: Building2 },
  { label: 'Templates', href: ROUTES.ADMIN.TEMPLATES, icon: FileText },
  { label: 'All Messages', href: ROUTES.ADMIN.MESSAGES, icon: MessageSquare },
  { label: UI_MESSAGES.API_TOKEN.NAV_LABEL, href: ROUTES.ADMIN.API_TOKENS, icon: KeyRound },
  { label: UI_MESSAGES.BILLING.NAV_LABEL, href: ROUTES.ADMIN.BILLING, icon: CreditCard },
  { label: UI_MESSAGES.SUBSCRIPTION.ADMIN_TITLE, href: ROUTES.ADMIN.SUBSCRIPTIONS, icon: Receipt },
  { label: UI_MESSAGES.SUBSCRIPTION.PLANS_TITLE, href: ROUTES.ADMIN.PLANS, icon: Package },
  // Standalone collection tool — unrelated to subscriptions.
  { label: UI_MESSAGES.PAYMENT_LINK.NAV_LABEL, href: ROUTES.ADMIN.PAYMENT_LINKS, icon: Link2 },
];

const SETTINGS_GROUP: NavGroup = {
  label: UI_MESSAGES.SETTINGS.TITLE,
  icon: Settings,
  children: [
    { label: UI_MESSAGES.SETTINGS.SECURITY_LABEL, href: ROUTES.SETTINGS.SECURITY, icon: Shield },
  ],
};

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const features = useFeatureStore((s) => s.features);
  const clearFeatures = useFeatureStore((s) => s.clear);
  const clearSubscription = useSubscriptionStore((s) => s.clear);

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  // Company items appear only once the feature map is loaded AND the feature
  // is enabled — no flash of items that would immediately vanish.
  const nav = isSuperAdmin
    ? ADMIN_NAV
    : COMPANY_NAV.filter((item) => !item.feature || features?.[item.feature]);
  const showSettings = isSuperAdmin || !!features?.[COMPANY_FEATURE.SETTINGS];

  const isSettingsActive = pathname.startsWith(ROUTES.SETTINGS.ROOT);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [isSettingsActive]);

  const handleLogout = () => {
    clearFeatures();
    // Otherwise the next user to sign in on this device briefly sees the previous
    // company's subscription banner.
    clearSubscription();
    logout();
    router.replace(ROUTES.LOGIN);
  };

  const GroupIcon = SETTINGS_GROUP.icon;
  const Chevron = settingsOpen ? ChevronDown : ChevronRight;

  return (
    <div className="flex h-full w-64 flex-col bg-card">
      <div className="border-b px-6 py-5">
        <div className="text-lg font-bold text-primary">{ENV.APP_NAME}</div>
        <div className="truncate text-xs text-muted-foreground">
          {user?.role === ROLES.SUPER_ADMIN ? 'Super Admin' : user?.company?.name ?? 'Company'}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {showSettings ? (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSettingsOpen((prev) => !prev)}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isSettingsActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <GroupIcon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">{SETTINGS_GROUP.label}</span>
            <Chevron className="h-3.5 w-3.5 shrink-0" />
          </button>

          {settingsOpen ? (
            <div className="mt-1 space-y-1 pl-4">
              {SETTINGS_GROUP.children.map((child) => {
                const active = pathname === child.href || pathname.startsWith(`${child.href}/`);
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <ChildIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
        ) : null}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 text-sm">
          <div className="truncate font-medium">
            {user?.first_name} {user?.last_name ?? ''}
          </div>
          <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> {UI_MESSAGES.AUTH.LOGOUT}
        </Button>
      </div>
    </div>
  );
}
