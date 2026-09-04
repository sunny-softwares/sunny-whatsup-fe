import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type {
  ApiResponseSuccess,
  CompanySubscriptionView,
  Payment,
  PaginatedMeta,
  Plan,
  PlanInterest,
  RazorpayOrder,
  Subscription,
  SubscriptionPeriod,
  VerifyPaymentResult,
} from '@/types';
import type { BillingCycle } from '@/constants/subscription';

/**
 * The company's own subscription.
 *
 * Every endpoint here stays reachable while the subscription is blocking —
 * otherwise a locked-out company could never pay to get back in.
 */
export const subscriptionApi = {
  async get() {
    const { data } = await apiClient.get<ApiResponseSuccess<CompanySubscriptionView>>(
      API_ROUTES.COMPANY.SUBSCRIPTION,
    );
    return data;
  },

  async listPlans() {
    const { data } = await apiClient.get<ApiResponseSuccess<Plan[]>>(
      API_ROUTES.COMPANY.SUBSCRIPTION_PLANS,
    );
    return data;
  },

  async listPayments(params: { page?: number; pageSize?: number } = {}) {
    const { data } = await apiClient.get<ApiResponseSuccess<Payment[]> & { meta?: PaginatedMeta }>(
      API_ROUTES.COMPANY.SUBSCRIPTION_PAYMENTS,
      { params },
    );
    return data;
  },

  /** Checkout step 1 — the response carries the public Razorpay key. */
  async createOrder(payload: { plan_key: string; billing_cycle: BillingCycle }) {
    const { data } = await apiClient.post<ApiResponseSuccess<RazorpayOrder>>(
      API_ROUTES.COMPANY.SUBSCRIPTION_ORDERS,
      payload,
    );
    return data;
  },

  /**
   * Checkout step 2. A result of `applied: false, reason: "already_paid"` is a
   * SUCCESS — the webhook simply confirmed the same payment first.
   */
  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { data } = await apiClient.post<ApiResponseSuccess<VerifyPaymentResult>>(
      API_ROUTES.COMPANY.SUBSCRIPTION_VERIFY,
      payload,
    );
    return data;
  },

  /** Stops the next renewal; does not cut access before the cycle ends. */
  async cancel() {
    const { data } = await apiClient.post<ApiResponseSuccess<Subscription>>(
      API_ROUTES.COMPANY.SUBSCRIPTION_CANCEL,
    );
    return data;
  },

  async resume() {
    const { data } = await apiClient.post<ApiResponseSuccess<Subscription>>(
      API_ROUTES.COMPANY.SUBSCRIPTION_RESUME,
    );
    return data;
  },

  /** "Notify me" on a plan that is not purchasable yet. */
  async registerInterest(payload: { plan_key: string; note?: string }) {
    const { data } = await apiClient.post<ApiResponseSuccess<PlanInterest>>(
      API_ROUTES.COMPANY.SUBSCRIPTION_INTEREST,
      payload,
    );
    return data;
  },
};

export type { SubscriptionPeriod };
