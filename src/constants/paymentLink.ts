// Razorpay Payment Links — a standalone super-admin collection tool for one-off
// payments. Unrelated to subscriptions: a link is not a billing cycle, grants no
// access, and never touches a company's entitlement.
//
// Statuses mirror Razorpay's own vocabulary, so this screen and the Razorpay
// dashboard can never disagree.

export const PAYMENT_LINK_STATUS = {
  CREATED: 'created',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export type PaymentLinkStatus =
  (typeof PAYMENT_LINK_STATUS)[keyof typeof PAYMENT_LINK_STATUS];

export const PAYMENT_LINK_STATUS_VALUES = Object.values(PAYMENT_LINK_STATUS);

export const PAYMENT_LINK_STATUS_LABEL: Record<PaymentLinkStatus, string> = {
  [PAYMENT_LINK_STATUS.CREATED]: 'Awaiting payment',
  [PAYMENT_LINK_STATUS.PARTIALLY_PAID]: 'Partially paid',
  [PAYMENT_LINK_STATUS.PAID]: 'Paid',
  [PAYMENT_LINK_STATUS.CANCELLED]: 'Cancelled',
  [PAYMENT_LINK_STATUS.EXPIRED]: 'Expired',
};

export const PAYMENT_LINK_STATUS_VARIANT: Record<
  PaymentLinkStatus,
  'success' | 'warning' | 'destructive' | 'muted' | 'secondary'
> = {
  [PAYMENT_LINK_STATUS.CREATED]: 'warning',
  [PAYMENT_LINK_STATUS.PARTIALLY_PAID]: 'secondary',
  [PAYMENT_LINK_STATUS.PAID]: 'success',
  [PAYMENT_LINK_STATUS.CANCELLED]: 'destructive',
  [PAYMENT_LINK_STATUS.EXPIRED]: 'muted',
};

/** Statuses that can still receive money — the only ones worth acting on. */
export const PAYMENT_LINK_OPEN_STATUSES: PaymentLinkStatus[] = [
  PAYMENT_LINK_STATUS.CREATED,
  PAYMENT_LINK_STATUS.PARTIALLY_PAID,
];

export const isPaymentLinkOpen = (status: PaymentLinkStatus) =>
  PAYMENT_LINK_OPEN_STATUSES.includes(status);

export const PAYMENT_LINK_NOTIFY_MEDIUM = {
  SMS: 'sms',
  EMAIL: 'email',
} as const;

export type PaymentLinkNotifyMedium =
  (typeof PAYMENT_LINK_NOTIFY_MEDIUM)[keyof typeof PAYMENT_LINK_NOTIFY_MEDIUM];

export const PAYMENT_LINK_SORT_FIELD = {
  CREATED_AT: 'created_at',
  AMOUNT: 'amount_minor',
  STATUS: 'status',
  EXPIRE_BY: 'expire_by',
} as const;

/** Razorpay's own floor is ₹1; below that the gateway rejects the call. */
export const PAYMENT_LINK_MIN_AMOUNT_MINOR = 100;
