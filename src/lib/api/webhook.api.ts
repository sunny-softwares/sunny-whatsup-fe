import { apiClient } from './client';
import { API_ROUTES, WEBHOOK_API_PATHS } from '@/constants';
import type {
  ApiResponseSuccess,
  Pagination,
  WebhookDelivery,
  WebhookDeliveryListParams,
  WebhookDeliverySummary,
  WebhookEndpoint,
  WebhookOverview,
  WebhookRotateResult,
  WebhookSaveResult,
  WebhookSecretResult,
} from '@/types';

/**
 * Outbound webhook API. The company admin (/company/webhook) and the super
 * admin acting for a company (/super-admin/companies/:id/webhook) expose the
 * exact same operations under different roots, so one builder serves both and
 * the shared WebhooksView never knows which one it is talking to.
 */
export interface WebhookApi {
  getOverview: () => Promise<ApiResponseSuccess<WebhookOverview>>;
  saveUrl: (url: string) => Promise<ApiResponseSuccess<WebhookSaveResult>>;
  verify: () => Promise<ApiResponseSuccess<WebhookSaveResult>>;
  setField: (field: string, subscribed: boolean) => Promise<ApiResponseSuccess<WebhookEndpoint>>;
  enable: () => Promise<ApiResponseSuccess<WebhookEndpoint>>;
  disable: () => Promise<ApiResponseSuccess<WebhookEndpoint>>;
  remove: () => Promise<ApiResponseSuccess<{ deleted: boolean }>>;
  revealSecret: () => Promise<ApiResponseSuccess<WebhookSecretResult>>;
  rotateSecret: () => Promise<ApiResponseSuccess<WebhookRotateResult>>;
  sendTest: () => Promise<ApiResponseSuccess<WebhookDelivery>>;
  listDeliveries: (
    params?: WebhookDeliveryListParams,
  ) => Promise<ApiResponseSuccess<WebhookDeliverySummary[]> & { meta?: { pagination: Pagination } }>;
  getDelivery: (id: string) => Promise<ApiResponseSuccess<WebhookDelivery>>;
  redeliver: (id: string) => Promise<ApiResponseSuccess<WebhookDelivery>>;
}

const buildWebhookApi = (root: string): WebhookApi => ({
  async getOverview() {
    const { data } = await apiClient.get<ApiResponseSuccess<WebhookOverview>>(root);
    return data;
  },
  async saveUrl(url) {
    const { data } = await apiClient.put<ApiResponseSuccess<WebhookSaveResult>>(root, { url });
    return data;
  },
  async verify() {
    const { data } = await apiClient.post<ApiResponseSuccess<WebhookSaveResult>>(
      `${root}${WEBHOOK_API_PATHS.VERIFY}`,
    );
    return data;
  },
  async setField(field, subscribed) {
    const { data } = await apiClient.patch<ApiResponseSuccess<WebhookEndpoint>>(
      `${root}${WEBHOOK_API_PATHS.FIELDS}`,
      { field, subscribed },
    );
    return data;
  },
  async enable() {
    const { data } = await apiClient.post<ApiResponseSuccess<WebhookEndpoint>>(
      `${root}${WEBHOOK_API_PATHS.ENABLE}`,
    );
    return data;
  },
  async disable() {
    const { data } = await apiClient.post<ApiResponseSuccess<WebhookEndpoint>>(
      `${root}${WEBHOOK_API_PATHS.DISABLE}`,
    );
    return data;
  },
  async remove() {
    const { data } = await apiClient.delete<ApiResponseSuccess<{ deleted: boolean }>>(root);
    return data;
  },
  async revealSecret() {
    const { data } = await apiClient.post<ApiResponseSuccess<WebhookSecretResult>>(
      `${root}${WEBHOOK_API_PATHS.SECRET_REVEAL}`,
    );
    return data;
  },
  async rotateSecret() {
    const { data } = await apiClient.post<ApiResponseSuccess<WebhookRotateResult>>(
      `${root}${WEBHOOK_API_PATHS.SECRET_ROTATE}`,
    );
    return data;
  },
  async sendTest() {
    const { data } = await apiClient.post<ApiResponseSuccess<WebhookDelivery>>(
      `${root}${WEBHOOK_API_PATHS.TEST}`,
    );
    return data;
  },
  async listDeliveries(params = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<WebhookDeliverySummary[]> & { meta?: { pagination: Pagination } }
    >(`${root}${WEBHOOK_API_PATHS.DELIVERIES}`, { params });
    return data;
  },
  async getDelivery(id) {
    const { data } = await apiClient.get<ApiResponseSuccess<WebhookDelivery>>(
      `${root}${WEBHOOK_API_PATHS.DELIVERY(id)}`,
    );
    return data;
  },
  async redeliver(id) {
    const { data } = await apiClient.post<ApiResponseSuccess<WebhookDelivery>>(
      `${root}${WEBHOOK_API_PATHS.DELIVERY_REDELIVER(id)}`,
    );
    return data;
  },
});

// The signed-in company admin's own webhook.
export const companyWebhookApi = buildWebhookApi(API_ROUTES.COMPANY.WEBHOOK);

// A company's webhook, managed by the super admin on its behalf.
export const superAdminWebhookApi = (companyId: string) =>
  buildWebhookApi(API_ROUTES.SUPER_ADMIN.COMPANY_WEBHOOK(companyId));
