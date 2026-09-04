import { ROUTES } from './routes';

// Per-company feature flags controlled by the super admin. Keys mirror the
// backend's COMPANY_FEATURE constants; a feature missing from the map is
// treated as disabled (default-deny). Adding a future feature means adding a
// key here (+ label, + route mapping) and on the backend — nothing else.
//
// A feature can now also be granted by the company's PLAN. Resolution happens
// entirely on the backend and arrives here as a flat map, so nothing on this
// side needs to know the precedence rules (override → plan → deny, with a
// locked subscription overriding all of it).
export const COMPANY_FEATURE = {
  DASHBOARD: 'dashboard',
  WABA: 'waba',
  TEMPLATES: 'templates',
  SEND_MESSAGE: 'send_message',
  MESSAGES: 'messages',
  // Meta's own Billing Hub link-out. Unrelated to SUBSCRIPTION below, which is
  // our Razorpay-backed plan management.
  BILLING: 'billing',
  SETTINGS: 'settings',
  // Our subscription page. Stays reachable even when the subscription is
  // blocking — otherwise a locked-out company could never pay to get back in.
  SUBSCRIPTION: 'subscription',
  // Granted by the Pro plan. No routes yet — declared so the plan can grant them
  // and default-deny keeps them invisible until the features ship.
  BULK_MESSAGING: 'bulk_messaging',
  CAMPAIGNS: 'campaigns',
} as const;

export type CompanyFeatureKey = (typeof COMPANY_FEATURE)[keyof typeof COMPANY_FEATURE];

export const COMPANY_FEATURE_VALUES = Object.values(COMPANY_FEATURE);

// Labels + descriptions for the super admin management screen.
export const COMPANY_FEATURE_META: Record<
  CompanyFeatureKey,
  { label: string; description: string }
> = {
  [COMPANY_FEATURE.DASHBOARD]: {
    label: 'Dashboard',
    description: 'Company dashboard with message statistics.',
  },
  [COMPANY_FEATURE.WABA]: {
    label: 'Meta WABA',
    description: 'Connect and manage the Meta WhatsApp Business Account and phone numbers.',
  },
  [COMPANY_FEATURE.TEMPLATES]: {
    label: 'Templates',
    description: 'Create, sync, and manage message templates.',
  },
  [COMPANY_FEATURE.SEND_MESSAGE]: {
    label: 'Send Message',
    description: 'Send template messages (including document attachments).',
  },
  [COMPANY_FEATURE.MESSAGES]: {
    label: 'Messages',
    description: 'View message history and delivery statuses.',
  },
  [COMPANY_FEATURE.BILLING]: {
    label: 'Billing',
    description: 'Link out to Meta’s Billing Hub to manage the WABA payment method and balance.',
  },
  [COMPANY_FEATURE.SETTINGS]: {
    label: 'Settings',
    description: 'Account settings: change password, delete account.',
  },
  [COMPANY_FEATURE.SUBSCRIPTION]: {
    label: 'Subscription',
    description: 'View the plan, pay with Razorpay, and see payment history.',
  },
  [COMPANY_FEATURE.BULK_MESSAGING]: {
    label: 'Bulk marketing messages',
    description: 'Send marketing messages to many recipients at once. Coming soon (Pro plan).',
  },
  [COMPANY_FEATURE.CAMPAIGNS]: {
    label: 'Campaigns',
    description: 'Build, schedule and report on messaging campaigns. Coming soon (Pro plan).',
  },
};

// Route prefix → feature, used by the client-side guard for company admins.
// A path matches when it equals the prefix or sits underneath it.
//
// NOTE: /company/subscription is deliberately absent. It must stay reachable
// whatever the feature map says — a company locked out for non-payment has to be
// able to reach the page it pays from. The backend allow-lists it for the same
// reason.
export const COMPANY_FEATURE_ROUTES: Record<string, CompanyFeatureKey> = {
  [ROUTES.COMPANY.DASHBOARD]: COMPANY_FEATURE.DASHBOARD,
  [ROUTES.COMPANY.WABA]: COMPANY_FEATURE.WABA,
  [ROUTES.COMPANY.TEMPLATES]: COMPANY_FEATURE.TEMPLATES,
  [ROUTES.COMPANY.SEND_MESSAGE]: COMPANY_FEATURE.SEND_MESSAGE,
  [ROUTES.COMPANY.MESSAGES]: COMPANY_FEATURE.MESSAGES,
  [ROUTES.COMPANY.BILLING]: COMPANY_FEATURE.BILLING,
  [ROUTES.SETTINGS.ROOT]: COMPANY_FEATURE.SETTINGS,
};

export const featureForPath = (pathname: string): CompanyFeatureKey | null => {
  for (const [prefix, feature] of Object.entries(COMPANY_FEATURE_ROUTES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return feature;
  }
  return null;
};

// Sidebar/redirect order: the first enabled feature's route is where a company
// admin lands when their current page is disabled.
export const COMPANY_FEATURE_HOME_ROUTES: [CompanyFeatureKey, string][] = [
  [COMPANY_FEATURE.DASHBOARD, ROUTES.COMPANY.DASHBOARD],
  [COMPANY_FEATURE.WABA, ROUTES.COMPANY.WABA],
  [COMPANY_FEATURE.TEMPLATES, ROUTES.COMPANY.TEMPLATES],
  [COMPANY_FEATURE.SEND_MESSAGE, ROUTES.COMPANY.SEND_MESSAGE],
  [COMPANY_FEATURE.MESSAGES, ROUTES.COMPANY.MESSAGES],
  [COMPANY_FEATURE.BILLING, ROUTES.COMPANY.BILLING],
  // Ahead of Settings on purpose: when a subscription is blocking, these are the
  // only two features left enabled, and the subscription page is where the user
  // actually needs to land.
  [COMPANY_FEATURE.SUBSCRIPTION, ROUTES.COMPANY.SUBSCRIPTION],
  [COMPANY_FEATURE.SETTINGS, ROUTES.SETTINGS.SECURITY],
];

export const firstEnabledRoute = (features: Record<string, boolean>): string | null => {
  const hit = COMPANY_FEATURE_HOME_ROUTES.find(([key]) => features[key]);
  return hit ? hit[1] : null;
};
