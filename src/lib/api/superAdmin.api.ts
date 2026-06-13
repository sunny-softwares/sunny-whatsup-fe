import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type {
  ApiResponseSuccess,
  Company,
  CompanyListParams,
  CreateTemplateInput,
  MessageListParams,
  MessageLog,
  MessageTemplate,
  Pagination,
  SuperAdminStats,
  TemplateListParams,
} from '@/types';

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
