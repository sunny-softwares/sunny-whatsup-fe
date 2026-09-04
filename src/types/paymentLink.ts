import type { PaymentLinkStatus } from '@/constants/paymentLink';
import type { RazorpayMode } from '@/constants/subscription';
import type { Pagination } from './index';

/**
 * A Razorpay payment link. Standalone — unrelated to subscriptions, billing
 * cycles or entitlements.
 */
export interface PaymentLink {
  id: string;
  razorpay_payment_link_id: string;
  short_url: string | null;
  reference_id: string | null;
  status: PaymentLinkStatus;
  /** Minor units (paise). */
  amount_minor: number;
  amount_paid_minor: number;
  currency: string;
  accept_partial: boolean;
  first_min_partial_amount_minor: number | null;
  description: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_contact: string | null;
  notify_sms: boolean;
  notify_email: boolean;
  reminder_enable: boolean;
  expire_by: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  callback_url: string | null;
  notes: Record<string, string> | null;
  razorpay_mode: RazorpayMode;
  created_at: string;
  updated_at: string;
  createdBy?: {
    id: string;
    first_name: string;
    last_name: string | null;
    email: string;
  } | null;
}

export interface PaymentLinkStats {
  total: number;
  by_status: Record<string, { count: number; amount_minor: number }>;
  /** Money actually received across every link. */
  collected_minor: number;
  /** Money still reachable — the unpaid remainder of links that are still open. */
  outstanding_minor: number;
}

export interface PaymentLinkListParams {
  search?: string;
  status?: PaymentLinkStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface CreatePaymentLinkPayload {
  amount_minor: number;
  currency?: string;
  description?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_contact?: string | null;
  notify_sms?: boolean;
  notify_email?: boolean;
  reminder_enable?: boolean;
  accept_partial?: boolean;
  first_min_partial_amount_minor?: number;
  expire_by?: string;
  reference_id?: string | null;
  callback_url?: string | null;
  notes?: Record<string, string>;
}

/** Whether the gateway can be used at all, and in which mode. */
export interface PaymentLinkGatewayMeta {
  enabled: boolean;
  mode: RazorpayMode;
}

export type PaymentLinkListMeta = {
  pagination: Pagination;
  gateway?: PaymentLinkGatewayMeta;
};
