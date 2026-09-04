import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type {
  AdminCompanySubscriptionView,
  ApiResponseSuccess,
  CompanyFeatureDetail,
  CompanyFeatures,
  CreatedPeriod,
  PaginatedMeta,
  Payment,
  PeriodPayload,
  Plan,
  PlanInterest,
  Subscription,
  SubscriptionListParams,
  SubscriptionNoticeConfig,
  SubscriptionPeriod,
  SubscriptionRow,
  SubscriptionStats,
  UpdatePlanPayload,
  UpdateSubscriptionPayload,
} from '@/types';
import type { BillingCycle, PeriodPaymentStatus } from '@/constants/subscription';

/**
 * Super-admin subscription, plan and notice management.
 *
 * Kept in its own module rather than bolted onto superAdmin.api.ts, which is
 * already large and entirely about companies/WABA/templates.
 */
export const adminSubscriptionApi = {
  async list(params: SubscriptionListParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<SubscriptionRow[]> & { meta?: PaginatedMeta }
    >(API_ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, { params });
    return data;
  },

  async stats() {
    const { data } = await apiClient.get<ApiResponseSuccess<SubscriptionStats>>(
      API_ROUTES.SUPER_ADMIN.SUBSCRIPTION_STATS,
    );
    return data;
  },

  async getForCompany(companyId: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<AdminCompanySubscriptionView>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_SUBSCRIPTION(companyId),
    );
    return data;
  },

  async update(companyId: string, payload: UpdateSubscriptionPayload) {
    const { data } = await apiClient.patch<ApiResponseSuccess<Subscription>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_SUBSCRIPTION(companyId),
      payload,
    );
    return data;
  },

  /**
   * Creates a billing cycle. Omitting `starts_at` appends it to the end of the
   * timeline — queued behind whatever is running, or live immediately when
   * nothing is. The response's `message` and `data.placement` say which.
   */
  async createPeriod(companyId: string, payload: PeriodPayload) {
    const { data } = await apiClient.post<ApiResponseSuccess<CreatedPeriod>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_SUBSCRIPTION_PERIODS(companyId),
      payload,
    );
    return data;
  },

  async updatePeriod(companyId: string, periodId: string, payload: PeriodPayload) {
    const { data } = await apiClient.patch<ApiResponseSuccess<SubscriptionPeriod>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_SUBSCRIPTION_PERIOD(companyId, periodId),
      payload,
    );
    return data;
  },

  async extend(companyId: string, days: number) {
    const { data } = await apiClient.post<ApiResponseSuccess<SubscriptionPeriod>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_SUBSCRIPTION_EXTEND(companyId),
      { days },
    );
    return data;
  },

  /** Records offline payment, or waives the cycle entirely. */
  async markPaid(
    companyId: string,
    payload: { payment_status?: PeriodPaymentStatus; notes?: string } = {},
  ) {
    const { data } = await apiClient.post<ApiResponseSuccess<SubscriptionPeriod>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_SUBSCRIPTION_MARK_PAID(companyId),
      payload,
    );
    return data;
  },

  async suspend(companyId: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<Subscription>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_SUBSCRIPTION_SUSPEND(companyId),
    );
    return data;
  },

  async resume(companyId: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<Subscription>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_SUBSCRIPTION_RESUME(companyId),
    );
    return data;
  },

  async listPayments(companyId: string, params: { page?: number; pageSize?: number } = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<Payment[]> & { meta?: PaginatedMeta }
    >(API_ROUTES.SUPER_ADMIN.COMPANY_PAYMENTS(companyId), { params });
    return data;
  },

  // --- Plan catalogue -------------------------------------------------------

  async listPlans() {
    const { data } = await apiClient.get<ApiResponseSuccess<Plan[]>>(API_ROUTES.SUPER_ADMIN.PLANS);
    return data;
  },

  async updatePlan(id: string, payload: UpdatePlanPayload) {
    const { data } = await apiClient.patch<ApiResponseSuccess<Plan>>(
      API_ROUTES.SUPER_ADMIN.PLAN(id),
      payload,
    );
    return data;
  },

  /** Amounts are minor units (paise). Only affects FUTURE purchases. */
  async setPlanPrices(
    id: string,
    prices: { billing_cycle: BillingCycle; amount_minor: number; currency?: string }[],
  ) {
    const { data } = await apiClient.put<ApiResponseSuccess<Plan>>(
      API_ROUTES.SUPER_ADMIN.PLAN_PRICES(id),
      { prices },
    );
    return data;
  },

  async setPlanFeatures(id: string, featureKeys: string[]) {
    const { data } = await apiClient.put<ApiResponseSuccess<Plan>>(
      API_ROUTES.SUPER_ADMIN.PLAN_FEATURES(id),
      { feature_keys: featureKeys },
    );
    return data;
  },

  async listInterests() {
    const { data } = await apiClient.get<ApiResponseSuccess<PlanInterest[]>>(
      API_ROUTES.SUPER_ADMIN.PLAN_INTERESTS,
    );
    return data;
  },

  // --- Notice catalogue -----------------------------------------------------

  async listNotices() {
    const { data } = await apiClient.get<ApiResponseSuccess<SubscriptionNoticeConfig[]>>(
      API_ROUTES.SUPER_ADMIN.SUBSCRIPTION_NOTICES,
    );
    return data;
  },

  async updateNotice(id: string, payload: Partial<SubscriptionNoticeConfig>) {
    const { data } = await apiClient.patch<ApiResponseSuccess<SubscriptionNoticeConfig>>(
      API_ROUTES.SUPER_ADMIN.SUBSCRIPTION_NOTICE(id),
      payload,
    );
    return data;
  },

  // --- Feature overrides ----------------------------------------------------

  /**
   * The GET now also returns a per-key breakdown in `meta.features`: whether
   * each flag is a manual override, a plan grant, or neither.
   */
  async getCompanyFeatures(companyId: string) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<CompanyFeatures> & { meta?: { features?: CompanyFeatureDetail[] } }
    >(API_ROUTES.SUPER_ADMIN.COMPANY_FEATURES(companyId));
    return data;
  },

  /** Removes the manual override so the flag falls back to the plan's grant. */
  async clearFeatureOverride(companyId: string, featureKey: string) {
    const { data } = await apiClient.delete<ApiResponseSuccess<CompanyFeatures>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_FEATURES(companyId),
      { data: { feature_key: featureKey } },
    );
    return data;
  },
};
