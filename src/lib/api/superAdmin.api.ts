import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type {
  ApiResponseSuccess,
  Company,
  MessageLog,
  Pagination,
  SuperAdminStats,
} from '@/types';

export const superAdminApi = {
  async stats() {
    const { data } = await apiClient.get<ApiResponseSuccess<SuperAdminStats>>(
      API_ROUTES.SUPER_ADMIN.STATS,
    );
    return data;
  },
  async listCompanies(params: { status?: string; search?: string; page?: number; pageSize?: number } = {}) {
    const { data } = await apiClient.get<ApiResponseSuccess<Company[]> & { meta?: { pagination: Pagination } }>(
      API_ROUTES.SUPER_ADMIN.COMPANIES,
      { params },
    );
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
  async listMessages(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<MessageLog[]> & { meta?: { pagination: Pagination } }
    >(API_ROUTES.SUPER_ADMIN.MESSAGES, { params });
    return data;
  },
};
