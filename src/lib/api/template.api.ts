import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type {
  ApiResponseSuccess,
  CreateTemplateInput,
  MessageTemplate,
  Pagination,
  TemplatesByCategory,
} from '@/types';

export const templateApi = {
  async listGrouped(status?: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<TemplatesByCategory>>(
      API_ROUTES.COMPANY.TEMPLATES,
      { params: { grouped: true, ...(status ? { status } : {}) } },
    );
    return data;
  },
  async list(params: { category?: string; status?: string; search?: string; page?: number; pageSize?: number } = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<MessageTemplate[]> & { meta?: { pagination: Pagination } }
    >(API_ROUTES.COMPANY.TEMPLATES, { params });
    return data;
  },
  async get(id: string) {
    const { data } = await apiClient.get<ApiResponseSuccess<MessageTemplate>>(
      API_ROUTES.COMPANY.TEMPLATE(id),
    );
    return data;
  },
  async create(payload: CreateTemplateInput) {
    const { data } = await apiClient.post<ApiResponseSuccess<MessageTemplate>>(
      API_ROUTES.COMPANY.TEMPLATES,
      payload,
    );
    return data;
  },
  async sync() {
    const { data } = await apiClient.post<ApiResponseSuccess<{ synced: number }>>(
      API_ROUTES.COMPANY.TEMPLATES_SYNC,
    );
    return data;
  },
  async remove(id: string) {
    const { data } = await apiClient.delete<ApiResponseSuccess<MessageTemplate>>(
      API_ROUTES.COMPANY.TEMPLATE(id),
    );
    return data;
  },
};
