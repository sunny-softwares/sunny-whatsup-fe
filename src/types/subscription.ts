import type {
  BillingCycle,
  EntitlementState,
  NoticeSeverity,
  PaymentStatus,
  PeriodPaymentStatus,
  PeriodSource,
  RazorpayMode,
  SubscriptionStatus,
} from '@/constants/subscription';
import type { CompanyFeatures, Pagination } from './index';

/**
 * The `meta.subscription` block attached to every company and External API
 * response, success or error.
 *
 * Every field is driven by the backend's `subscription_notices` table, so the
 * copy, severity, thresholds and even `is_blocking` can change without a
 * frontend release. Branch on `code`, never on `message` text.
 */
export interface SubscriptionNotice {
  code: string;
  state: EntitlementState;
  severity: NoticeSeverity;
  title: string;
  message: string;
  action_label: string | null;
  action_url: string | null;
  /** Whether this state currently denies access. False while enforcement is off. */
  is_blocking: boolean;
  http_status: number;
  plan_key: string | null;
  plan_name: string | null;
  billing_cycle: BillingCycle | null;
  period_ends_at: string | null;
  grace_ends_at: string | null;
  days_remaining: number | null;
  is_trial: boolean;
  cancel_at_period_end: boolean;
  enforcement_enabled: boolean;
}

export interface PlanPrice {
  billing_cycle: BillingCycle;
  currency: string;
  /** Minor units (paise). ₹1,000 is 100000. */
  amount_minor: number;
}

export interface Plan {
  id: string;
  key: string;
  name: string;
  description: string | null;
  highlights: string[];
  is_purchasable: boolean;
  is_coming_soon: boolean;
  trial_days: number;
  grace_days: number;
  sort_order: number;
  prices: PlanPrice[];
  feature_keys: string[];
}

export interface SubscriptionPeriod {
  id: string;
  subscription_id: string;
  plan_id: string;
  billing_cycle: BillingCycle;
  starts_at: string;
  ends_at: string;
  grace_days: number | null;
  amount_minor: number;
  currency: string;
  payment_status: PeriodPaymentStatus;
  paid_at: string | null;
  is_trial: boolean;
  source: PeriodSource;
  notes: string | null;
  /**
   * Set when an admin voided this cycle by making another one active. A
   * superseded cycle grants no access and counts toward no coverage, but stays
   * in the ledger because it may have a real payment attached.
   */
  superseded_at: string | null;
  created_at: string;
  updated_at: string;
  plan?: Pick<Plan, 'id' | 'key' | 'name'>;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  billing_cycle: BillingCycle;
  /** Administrative status, not the access state. */
  status: SubscriptionStatus;
  grace_days: number | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  auto_renew: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  plan?: Plan;
  company?: { id: string; name: string; contact_email: string; status: string; is_active: boolean };
}

export interface Payment {
  id: string;
  company_id: string;
  subscription_period_id: string | null;
  plan_id: string;
  billing_cycle: BillingCycle;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_mode: RazorpayMode;
  amount_minor: number;
  currency: string;
  status: PaymentStatus;
  method: string | null;
  error_code: string | null;
  error_description: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  amount_refunded_minor: number;
  created_at: string;
  plan?: Pick<Plan, 'id' | 'key' | 'name'>;
  company?: { id: string; name: string };
}

/** Everything the company subscription page needs, in one response. */
export interface CompanySubscriptionView {
  subscription: Subscription | null;
  current_period: SubscriptionPeriod | null;
  periods: SubscriptionPeriod[];
  state: EntitlementState | null;
  days_remaining: number | null;
  grace_ends_at: string | null;
  /**
   * End of ALL paid coverage, which is later than `current_period.ends_at` when
   * the company renewed early. The honest answer to "until when am I paid up".
   */
  coverage_ends_at: string | null;
  /** Cycles already bought that have not started yet. */
  upcoming_periods: SubscriptionPeriod[];
  features: CompanyFeatures;
  plans: Plan[];
  payment: {
    /** False when Razorpay is unconfigured — hide the pay button rather than fail on click. */
    enabled: boolean;
    mode: RazorpayMode;
  };
}

/** Everything Razorpay Checkout needs. `key_id` comes from the server. */
export interface RazorpayOrder {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  mode: RazorpayMode;
  billing_cycle: BillingCycle;
  plan: { key: string; name: string };
  prefill: { name: string; email: string; contact: string };
}

export interface VerifyPaymentResult {
  applied: boolean;
  /** "already_paid" means the webhook confirmed first — still a success. */
  reason: string | null;
  state: EntitlementState | null;
  current_period: SubscriptionPeriod | null;
}

/** One row of the super-admin subscription listing. */
export interface SubscriptionRow extends Subscription {
  current_period: SubscriptionPeriod | null;
  state: EntitlementState;
  days_remaining: number | null;
  grace_ends_at: string | null;
  /** End of all paid coverage — later than the current cycle after an early renewal. */
  coverage_ends_at: string | null;
  notice: SubscriptionNotice | null;
}

export interface AdminCompanySubscriptionView {
  subscription: Subscription | null;
  current_period: SubscriptionPeriod | null;
  periods: SubscriptionPeriod[];
  state: EntitlementState | null;
  days_remaining: number | null;
  grace_ends_at: string | null;
  coverage_ends_at: string | null;
  upcoming_periods: SubscriptionPeriod[];
  notice: SubscriptionNotice | null;
}

export interface SubscriptionStats {
  total: number;
  by_state: Record<string, number>;
}

export interface PlanInterest {
  id: string;
  company_id: string;
  plan_id: string;
  user_id: string | null;
  note: string | null;
  created_at: string;
  plan?: Pick<Plan, 'id' | 'key' | 'name'>;
  company?: { id: string; name: string; contact_email: string };
}

/** The editable notice row behind every `SubscriptionNotice` sent to clients. */
export interface SubscriptionNoticeConfig {
  id: string;
  code: string;
  state: EntitlementState;
  severity: NoticeSeverity;
  title: string;
  message: string;
  action_label: string | null;
  action_url: string | null;
  threshold_days: number | null;
  is_blocking: boolean;
  http_status: number;
  is_active: boolean;
  sort_order: number;
}

/** Per-key breakdown of why a feature is on. */
export interface CompanyFeatureDetail {
  feature_key: string;
  enabled: boolean;
  is_override: boolean;
  override_value: boolean | null;
  plan_grants: boolean;
  source: 'override' | 'plan' | 'default';
}

export interface SubscriptionListParams {
  search?: string;
  state?: EntitlementState;
  plan_key?: string;
  payment_status?: PeriodPaymentStatus;
  page?: number;
  pageSize?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface UpdateSubscriptionPayload {
  plan_key?: string;
  billing_cycle?: BillingCycle;
  status?: SubscriptionStatus;
  grace_days?: number | null;
  cancel_at_period_end?: boolean;
  auto_renew?: boolean;
  notes?: string | null;
}

/** A created cycle, plus whether it went live immediately or was queued. */
export interface CreatedPeriod extends SubscriptionPeriod {
  placement: 'current' | 'queued';
  /** How many existing cycles were voided to make this one active. */
  superseded_count: number;
}

export interface PeriodPayload {
  plan_key?: string;
  billing_cycle?: BillingCycle;
  starts_at?: string;
  ends_at?: string;
  grace_days?: number | null;
  amount_minor?: number;
  currency?: string;
  payment_status?: PeriodPaymentStatus;
  is_trial?: boolean;
  notes?: string | null;
  /** Voids every cycle still in play and starts this one now. */
  make_active?: boolean;
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string | null;
  highlights?: string[];
  is_purchasable?: boolean;
  is_coming_soon?: boolean;
  trial_days?: number;
  grace_days?: number;
  sort_order?: number;
  is_active?: boolean;
}

export type PaginatedMeta = { pagination: Pagination };
