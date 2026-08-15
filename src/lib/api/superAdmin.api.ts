import { apiClient, downloadFile } from './client';
import { API_ROUTES } from '@/constants';
import type {
  ApiResponseSuccess,
  ApiTokenCompanyRow,
  ApiTokenListParams,
  ApiTokenRevealResult,
  ApiTokenSecretResult,
  Company,
  CompanyFeatures,
  CompanyListParams,
  CreateTemplateInput,
  MessageListParams,
  MessageLog,
  MessageTemplate,
  Pagination,
  PhoneNumber,
  SuperAdminStats,
  TemplateListParams,
  WabaAccount,
} from '@/types';
import type { ConnectWabaPayload, RequestPhoneCodePayload } from './company.api';

export const superAdminApi = {
  async stats() {
    const { data } = await apiClient.get<ApiResponseSuccess<SuperAdminStats>>(
      API_ROUTES.SUPER_ADMIN.STATS,
    );
    return data;
  },
  async listCompanies(params: CompanyListParams = {}) {
    const { data } = await apiClient.get<ApiResponseSuccess<Company[]> & { meta?: { pagination: Pagination } }>(
      API_ROUTES.SUPER_ADMIN.COMPANIES,
      { params },
    );
    return data;
  },
  async getCompany(id: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<Company>>(API_ROUTES.SUPER_ADMIN.COMPANY(id));
    return data;
  },
  async approveCompany(id: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<Company>>(API_ROUTES.SUPER_ADMIN.APPROVE(id));
    return data;
  },
  async rejectCompany(id: string, reason?: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<Company>>(
      API_ROUTES.SUPER_ADMIN.REJECT(id),
      { reason },
    );
    return data;
  },
  async setCompanyActive(id: string, isActive: boolean) {
    const { data } = await apiClient.patch<ApiResponseSuccess<Company>>(
      API_ROUTES.SUPER_ADMIN.SET_ACTIVE(id),
      { is_active: isActive },
    );
    return data;
  },
  async listMessages(params: MessageListParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<MessageLog[]> & { meta?: { pagination: Pagination } }
    >(API_ROUTES.SUPER_ADMIN.MESSAGES, { params });
    return data;
  },
  // Fetches back the image/document attached to a sent message's header, so it
  // can be re-attached by hand (e.g. when resending on WhatsApp Web).
  downloadMessageMedia(messageId: string) {
    return downloadFile(API_ROUTES.SUPER_ADMIN.MESSAGE_MEDIA(messageId));
  },
  // Records (or clears) that a failed message was resent by hand.
  async setMessageHandled(messageId: string, handled: boolean) {
    const { data } = await apiClient.patch<ApiResponseSuccess<MessageLog>>(
      API_ROUTES.SUPER_ADMIN.MESSAGE_HANDLED(messageId),
      { handled },
    );
    return data;
  },
  async listCompanyMessages(companyId: string, params: MessageListParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<MessageLog[]> & { meta?: { pagination: Pagination } }
    >(API_ROUTES.SUPER_ADMIN.COMPANY_MESSAGES(companyId), { params });
    return data;
  },

  // WABA managed on behalf of a selected company.
  async getCompanyWaba(companyId: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<WabaAccount | null>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_WABA(companyId),
    );
    return data;
  },
  async connectCompanyWaba(companyId: string, payload: ConnectWabaPayload) {
    const { data } = await apiClient.post<ApiResponseSuccess<WabaAccount>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_WABA_CONNECT(companyId),
      payload,
    );
    return data;
  },
  async disconnectCompanyWaba(companyId: string) {
    const { data } = await apiClient.post<
      ApiResponseSuccess<{
        archived: boolean;
        meta_waba_id: string;
        purged: {
          phone_numbers_count: number;
          templates_count: number;
          messages_count: number;
          messages_sampled: number;
        };
      }>
    >(API_ROUTES.SUPER_ADMIN.COMPANY_WABA_DISCONNECT(companyId));
    return data;
  },
  async syncCompanyWaba(companyId: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<WabaAccount>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_WABA_SYNC(companyId),
    );
    return data;
  },
  async requestCompanyPhoneCode(
    companyId: string,
    phoneId: string,
    payload: RequestPhoneCodePayload = {},
  ) {
    const { data } = await apiClient.post<
      ApiResponseSuccess<{ requested: boolean; code_method: string }>
    >(API_ROUTES.SUPER_ADMIN.COMPANY_WABA_PHONE_REQUEST_CODE(companyId, phoneId), payload);
    return data;
  },
  async verifyCompanyPhoneCode(companyId: string, phoneId: string, code: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<PhoneNumber>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_WABA_PHONE_VERIFY_CODE(companyId, phoneId),
      { code },
    );
    return data;
  },
  async registerCompanyPhone(companyId: string, phoneId: string, pin: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<PhoneNumber>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_WABA_PHONE_REGISTER(companyId, phoneId),
      { pin },
    );
    return data;
  },

  // Per-company feature flags.
  async getCompanyFeatures(companyId: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<CompanyFeatures>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_FEATURES(companyId),
    );
    return data;
  },
  async setCompanyFeature(companyId: string, featureKey: string, isEnabled: boolean) {
    const { data } = await apiClient.patch<ApiResponseSuccess<CompanyFeatures>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_FEATURES(companyId),
      { feature_key: featureKey, is_enabled: isEnabled },
    );
    return data;
  },

  // Company API tokens — one per company. The paginated listing is
  // company-centric so companies without a token also appear.
  async listApiTokens(params: ApiTokenListParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<ApiTokenCompanyRow[]> & { meta?: { pagination: Pagination } }
    >(API_ROUTES.SUPER_ADMIN.API_TOKENS, { params });
    return data;
  },
  async revealCompanyApiToken(companyId: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<ApiTokenRevealResult>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_API_TOKEN(companyId),
    );
    return data;
  },
  async createCompanyApiToken(companyId: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<ApiTokenSecretResult>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_API_TOKEN(companyId),
    );
    return data;
  },
  async rotateCompanyApiToken(companyId: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<ApiTokenSecretResult>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_API_TOKEN_ROTATE(companyId),
    );
    return data;
  },
  async deleteCompanyApiToken(companyId: string) {
    const { data } = await apiClient.delete<ApiResponseSuccess<{ deleted: boolean }>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_API_TOKEN(companyId),
    );
    return data;
  },

  // Templates managed on behalf of a selected company.
  async listCompanyTemplates(companyId: string, params: TemplateListParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<MessageTemplate[]> & { meta?: { pagination: Pagination } }
    >(API_ROUTES.SUPER_ADMIN.COMPANY_TEMPLATES(companyId), { params });
    return data;
  },
  async getCompanyTemplate(companyId: string, id: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<MessageTemplate>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_TEMPLATE(companyId, id),
    );
    return data;
  },
  async createCompanyTemplate(companyId: string, payload: CreateTemplateInput) {
    const { data } = await apiClient.post<ApiResponseSuccess<MessageTemplate>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_TEMPLATES(companyId),
      payload,
    );
    return data;
  },
  async syncCompanyTemplates(companyId: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<{ synced: number }>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_TEMPLATES_SYNC(companyId),
    );
    return data;
  },
  async removeCompanyTemplate(companyId: string, id: string) {
    const { data } = await apiClient.delete<ApiResponseSuccess<MessageTemplate>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_TEMPLATE(companyId, id),
    );
    return data;
  },
};
