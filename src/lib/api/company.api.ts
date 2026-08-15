import { apiClient, downloadFile } from './client';
import { API_ROUTES } from '@/constants';
import type {
  ApiResponseSuccess,
  Company,
  CompanyFeatures,
  CompanyStats,
  MessageHeaderVariable,
  MessageListParams,
  MessageLog,
  MessageRetention,
  Pagination,
  PhoneNumber,
  WabaAccount,
} from '@/types';

export interface ConnectWabaPayload {
  code?: string;
  access_token?: string;
  waba_id?: string;
  redirect_uri?: string;
}

export interface RequestPhoneCodePayload {
  code_method?: string;
  language?: string;
}

export interface SendMessagePayload {
  recipient_phone: string;
  template_id: string;
  phone_number_id?: string;
  variables?: {
    header?: MessageHeaderVariable[];
    body?: string[];
    buttons?: string[];
  };
}

export const companyApi = {
  async me() {
    const { data } = await apiClient.get<ApiResponseSuccess<Company>>(API_ROUTES.COMPANY.ME);
    return data;
  },
  async getFeatures() {
    const { data } = await apiClient.get<ApiResponseSuccess<CompanyFeatures>>(
      API_ROUTES.COMPANY.FEATURES,
    );
    return data;
  },
  async stats() {
    const { data } = await apiClient.get<ApiResponseSuccess<CompanyStats>>(API_ROUTES.COMPANY.STATS);
    return data;
  },
  async getWaba() {
    const { data } = await apiClient.get<ApiResponseSuccess<WabaAccount | null>>(API_ROUTES.COMPANY.WABA);
    return data;
  },
  async connectWaba(payload: ConnectWabaPayload) {
    const { data } = await apiClient.post<ApiResponseSuccess<WabaAccount>>(
      API_ROUTES.COMPANY.WABA_CONNECT,
      payload,
    );
    return data;
  },
  async disconnectWaba() {
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
    >(API_ROUTES.COMPANY.WABA_DISCONNECT);
    return data;
  },
  async syncWaba() {
    const { data } = await apiClient.post<ApiResponseSuccess<WabaAccount>>(
      API_ROUTES.COMPANY.WABA_SYNC,
    );
    return data;
  },
  async requestPhoneCode(phoneId: string, payload: RequestPhoneCodePayload = {}) {
    const { data } = await apiClient.post<
      ApiResponseSuccess<{ requested: boolean; code_method: string }>
    >(API_ROUTES.COMPANY.WABA_PHONE_REQUEST_CODE(phoneId), payload);
    return data;
  },
  async verifyPhoneCode(phoneId: string, code: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<PhoneNumber>>(
      API_ROUTES.COMPANY.WABA_PHONE_VERIFY_CODE(phoneId),
      { code },
    );
    return data;
  },
  async registerPhone(phoneId: string, pin: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<PhoneNumber>>(
      API_ROUTES.COMPANY.WABA_PHONE_REGISTER(phoneId),
      { pin },
    );
    return data;
  },
  async sendMessage(payload: SendMessagePayload) {
    const { data } = await apiClient.post<ApiResponseSuccess<MessageLog>>(
      API_ROUTES.COMPANY.MESSAGES,
      payload,
    );
    return data;
  },
  async listMessages(params: MessageListParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<MessageLog[]> & {
        // `retention` reports the history window this listing was limited to.
        meta?: { pagination: Pagination; retention?: MessageRetention | null };
      }
    >(API_ROUTES.COMPANY.MESSAGES, { params });
    return data;
  },
  // Fetches back the image/document attached to a sent message's header, so it
  // can be re-attached by hand (e.g. when resending on WhatsApp Web).
  downloadMessageMedia(messageId: string) {
    return downloadFile(API_ROUTES.COMPANY.MESSAGE_MEDIA(messageId));
  },
  // Records (or clears) that a failed message was resent by hand.
  async setMessageHandled(messageId: string, handled: boolean) {
    const { data } = await apiClient.patch<ApiResponseSuccess<MessageLog>>(
      API_ROUTES.COMPANY.MESSAGE_HANDLED(messageId),
      { handled },
    );
    return data;
  },
  async deleteAccount() {
    const { data } = await apiClient.delete<
      ApiResponseSuccess<{
        deleted: boolean;
        company_id: string;
        purged: {
          users: number;
          waba_accounts: number;
          phone_numbers: number;
          templates: number;
          messages: number;
          audit_logs: number;
          archive_events: number;
        };
      }>
    >(API_ROUTES.COMPANY.ACCOUNT);
    return data;
  },
};
