import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type { PaymentLinkNotifyMedium } from '@/constants/paymentLink';
import type {
  ApiResponseSuccess,
  CreatePaymentLinkPayload,
  PaymentLink,
  PaymentLinkListMeta,
  PaymentLinkListParams,
  PaymentLinkStats,
} from '@/types';

/**
 * Razorpay Payment Links — super-admin only.
 *
 * Standalone: unrelated to subscriptions, billing cycles or entitlements.
 */
export const paymentLinkApi = {
  async list(params: PaymentLinkListParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<PaymentLink[]> & { meta?: PaymentLinkListMeta }
    >(API_ROUTES.SUPER_ADMIN.PAYMENT_LINKS, { params });
    return data;
  },

  async stats() {
    const { data } = await apiClient.get<ApiResponseSuccess<PaymentLinkStats>>(
      API_ROUTES.SUPER_ADMIN.PAYMENT_LINK_STATS,
    );
    return data;
  },

  async get(id: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<PaymentLink>>(
      API_ROUTES.SUPER_ADMIN.PAYMENT_LINK(id),
    );
    return data;
  },

  async create(payload: CreatePaymentLinkPayload) {
    const { data } = await apiClient.post<ApiResponseSuccess<PaymentLink>>(
      API_ROUTES.SUPER_ADMIN.PAYMENT_LINKS,
      payload,
    );
    return data;
  },

  /** Only an open link can be cancelled. */
  async cancel(id: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<PaymentLink>>(
      API_ROUTES.SUPER_ADMIN.PAYMENT_LINK_CANCEL(id),
    );
    return data;
  },

  /** Re-sends an open link over SMS or email. */
  async notify(id: string, medium: PaymentLinkNotifyMedium) {
    const { data } = await apiClient.post<ApiResponseSuccess<PaymentLink>>(
      API_ROUTES.SUPER_ADMIN.PAYMENT_LINK_NOTIFY(id),
      { medium },
    );
    return data;
  },

  /** Manual refresh for a missed webhook, or a link edited in Razorpay. */
  async sync(id: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<PaymentLink>>(
      API_ROUTES.SUPER_ADMIN.PAYMENT_LINK_SYNC(id),
    );
    return data;
  },
};
