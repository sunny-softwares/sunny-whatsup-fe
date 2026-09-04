'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSubscriptionStore } from '@/store/subscription.store';
import { NOTICE_SEVERITY, ROLES, ROUTES, UI_MESSAGES } from '@/constants';
import { cn } from '@/lib/utils';

/**
 * The in-app subscription notice.
 *
 * Every field it renders — wording, severity, CTA label and target — comes from
 * the API's `meta.subscription`, which the axios interceptor harvests off
 * ordinary traffic. Nothing here is hardcoded, so the super admin can reword any
 * of it without a frontend release.
 */
const SEVERITY_STYLES: Record<string, string> = {
  [NOTICE_SEVERITY.INFO]: 'border-border bg-muted/50 text-foreground',
  [NOTICE_SEVERITY.WARNING]: 'border-amber-300 bg-amber-50 text-amber-900',
  [NOTICE_SEVERITY.CRITICAL]: 'border-destructive/40 bg-destructive/10 text-destructive',
};

export function SubscriptionBanner() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const notice = useSubscriptionStore((s) => s.notice);
  const dismissed = useSubscriptionStore((s) => s.dismissed);
  const dismiss = useSubscriptionStore((s) => s.dismiss);

  // Super admins have no subscription of their own.
  if (user?.role !== ROLES.COMPANY_ADMIN) return null;
  if (!notice) return null;

  // `info` is the steady state ("your plan is active until…") — showing a banner
  // for it every day would train people to ignore the ones that matter.
  if (notice.severity === NOTICE_SEVERITY.INFO) return null;
  if (dismissed.includes(notice.code)) return null;

  const Icon = notice.severity === NOTICE_SEVERITY.CRITICAL ? AlertTriangle : Info;
  // On the subscription page the CTA would point at the page you are already on.
  const showAction =
    notice.action_url && notice.action_label && !pathname.startsWith(ROUTES.COMPANY.SUBSCRIPTION);
  // A blocking notice is not dismissible: it is the only explanation for why the
  // rest of the app is unreachable.
  const dismissible = !notice.is_blocking;

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-md border px-4 py-3 text-sm',
        SEVERITY_STYLES[notice.severity] ?? SEVERITY_STYLES[NOTICE_SEVERITY.INFO],
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />

      <div className="flex-1 space-y-1">
        {notice.title ? <p className="font-medium">{notice.title}</p> : null}
        {notice.message ? <p className="opacity-90">{notice.message}</p> : null}
        {showAction ? (
          <Link
            href={notice.action_url as string}
            className="inline-block pt-1 font-medium underline underline-offset-2"
          >
            {notice.action_label}
          </Link>
        ) : null}
      </div>

      {dismissible ? (
        <button
          type="button"
          onClick={() => dismiss(notice.code)}
          aria-label={UI_MESSAGES.COMMON.DISMISS}
          className="shrink-0 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
