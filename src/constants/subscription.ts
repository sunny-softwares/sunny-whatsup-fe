// Subscription enums, mirroring the backend's src/constants/subscription.js.
//
// These are the DB's enum value sets, NOT configuration. Everything that is
// configuration — prices, trial and grace lengths, plan copy, which features a
// plan grants, and the entire notice catalogue (codes, wording, thresholds,
// blocking rules) — comes from the API at runtime and is never duplicated here.

export const BILLING_CYCLE = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export type BillingCycle = (typeof BILLING_CYCLE)[keyof typeof BILLING_CYCLE];

export const BILLING_CYCLE_VALUES = Object.values(BILLING_CYCLE);

export const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  [BILLING_CYCLE.MONTHLY]: 'Monthly',
  [BILLING_CYCLE.YEARLY]: 'Yearly',
};

// Suffix shown next to a price, e.g. "₹1,000 /month".
export const BILLING_CYCLE_SUFFIX: Record<BillingCycle, string> = {
  [BILLING_CYCLE.MONTHLY]: '/month',
  [BILLING_CYCLE.YEARLY]: '/year',
};

/** Administrative status, not the access state. */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export const SUBSCRIPTION_STATUS_VALUES = Object.values(SUBSCRIPTION_STATUS);

export const PERIOD_PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  // "Treat as paid without money changing hands" — distinct from PAID so
  // revenue reporting can exclude it.
  WAIVED: 'waived',
  REFUNDED: 'refunded',
} as const;

export type PeriodPaymentStatus =
  (typeof PERIOD_PAYMENT_STATUS)[keyof typeof PERIOD_PAYMENT_STATUS];

export const PERIOD_PAYMENT_STATUS_VALUES = Object.values(PERIOD_PAYMENT_STATUS);

export const PERIOD_PAYMENT_STATUS_LABEL: Record<PeriodPaymentStatus, string> = {
  [PERIOD_PAYMENT_STATUS.UNPAID]: 'Unpaid',
  [PERIOD_PAYMENT_STATUS.PAID]: 'Paid',
  [PERIOD_PAYMENT_STATUS.WAIVED]: 'Waived',
  [PERIOD_PAYMENT_STATUS.REFUNDED]: 'Refunded',
};

/** Computed access state, derived server-side on every read. */
export const ENTITLEMENT_STATE = {
  NONE: 'none',
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PENDING: 'pending',
  GRACE: 'grace',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
} as const;

export type EntitlementState = (typeof ENTITLEMENT_STATE)[keyof typeof ENTITLEMENT_STATE];

export const ENTITLEMENT_STATE_VALUES = Object.values(ENTITLEMENT_STATE);

export const ENTITLEMENT_STATE_LABEL: Record<EntitlementState, string> = {
  [ENTITLEMENT_STATE.NONE]: 'No subscription',
  [ENTITLEMENT_STATE.TRIALING]: 'Trial',
  [ENTITLEMENT_STATE.ACTIVE]: 'Active',
  [ENTITLEMENT_STATE.PENDING]: 'Awaiting payment',
  [ENTITLEMENT_STATE.GRACE]: 'Grace period',
  [ENTITLEMENT_STATE.EXPIRED]: 'Expired',
  [ENTITLEMENT_STATE.SUSPENDED]: 'Suspended',
};

// Maps a state onto the existing Badge variants (see components/ui/badge.tsx).
export const ENTITLEMENT_STATE_VARIANT: Record<
  EntitlementState,
  'success' | 'warning' | 'destructive' | 'muted' | 'secondary'
> = {
  [ENTITLEMENT_STATE.NONE]: 'destructive',
  [ENTITLEMENT_STATE.TRIALING]: 'secondary',
  [ENTITLEMENT_STATE.ACTIVE]: 'success',
  [ENTITLEMENT_STATE.PENDING]: 'warning',
  [ENTITLEMENT_STATE.GRACE]: 'warning',
  [ENTITLEMENT_STATE.EXPIRED]: 'destructive',
  [ENTITLEMENT_STATE.SUSPENDED]: 'destructive',
};

export const NOTICE_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

export type NoticeSeverity = (typeof NOTICE_SEVERITY)[keyof typeof NOTICE_SEVERITY];

export const PAYMENT_STATUS = {
  CREATED: 'created',
  ATTEMPTED: 'attempted',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.CREATED]: 'Started',
  [PAYMENT_STATUS.ATTEMPTED]: 'Attempted',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
};

export const PAYMENT_STATUS_VARIANT: Record<
  PaymentStatus,
  'success' | 'warning' | 'destructive' | 'muted' | 'secondary'
> = {
  [PAYMENT_STATUS.CREATED]: 'muted',
  [PAYMENT_STATUS.ATTEMPTED]: 'warning',
  [PAYMENT_STATUS.PAID]: 'success',
  [PAYMENT_STATUS.FAILED]: 'destructive',
  [PAYMENT_STATUS.REFUNDED]: 'secondary',
};

export const PERIOD_SOURCE = {
  RAZORPAY: 'razorpay',
  MANUAL: 'manual',
  TRIAL: 'trial',
  BACKFILL: 'backfill',
} as const;

export type PeriodSource = (typeof PERIOD_SOURCE)[keyof typeof PERIOD_SOURCE];

export const PERIOD_SOURCE_LABEL: Record<PeriodSource, string> = {
  [PERIOD_SOURCE.RAZORPAY]: 'Razorpay',
  [PERIOD_SOURCE.MANUAL]: 'Manual',
  [PERIOD_SOURCE.TRIAL]: 'Trial',
  [PERIOD_SOURCE.BACKFILL]: 'Migrated',
};

export const RAZORPAY_MODE = {
  TEST: 'test',
  LIVE: 'live',
  UNCONFIGURED: 'unconfigured',
} as const;

export type RazorpayMode = (typeof RAZORPAY_MODE)[keyof typeof RAZORPAY_MODE];

// URL of the Razorpay Checkout script. Loaded on demand by
// RazorpayCheckoutButton; the same URL serves both test and live mode, since
// the mode comes from the key the server hands us.
export const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
export const RAZORPAY_CHECKOUT_SCRIPT_ID = 'razorpay-checkout-js';

/**
 * Formats a minor-unit amount (paise) for display.
 *
 * Money crosses the wire as an integer minor unit and is only ever divided here,
 * at the very edge — nothing upstream does float arithmetic on it.
 */
export const formatAmountMinor = (amountMinor: number, currency = 'INR'): string => {
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: major % 1 === 0 ? 0 : 2,
    }).format(major);
  } catch {
    // Unknown currency code from an admin edit — degrade rather than throw.
    return `${currency} ${major.toLocaleString('en-IN')}`;
  }
};

/**
 * Yearly saving versus paying monthly for twelve months, as a whole percent.
 * Returns null when there is nothing to compare or no saving to advertise.
 */
export const yearlySavingPercent = (
  monthlyMinor?: number | null,
  yearlyMinor?: number | null,
): number | null => {
  if (!monthlyMinor || !yearlyMinor) return null;
  const fullPrice = monthlyMinor * 12;
  if (yearlyMinor >= fullPrice) return null;
  return Math.round(((fullPrice - yearlyMinor) / fullPrice) * 100);
};
