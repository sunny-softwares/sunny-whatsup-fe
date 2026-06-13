import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type {
  ApiResponseSuccess,
  Company,
  CompanyStats,
  MessageHeaderVariable,
  MessageListParams,
  MessageLog,
  Pagination,
  WabaAccount,
} from '@/types';

export interface ConnectWabaPayload {
  code?: string;
  access_token?: string;
  waba_id?: string;
  redirect_uri?: string;
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
  async sendMessage(payload: SendMessagePayload) {
    const { data } = await apiClient.post<ApiResponseSuccess<MessageLog>>(
      API_ROUTES.COMPANY.MESSAGES,
      payload,
    );
    return data;
  },
  async listMessages(params: MessageListParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<MessageLog[]> & { meta?: { pagination: Pagination } }
    >(API_ROUTES.COMPANY.MESSAGES, { params });
    return data;
  },
};
