import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type { ApiResponseSuccess, AuthResponse, AuthUser } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  company_name: string;
  legal_name?: string;
  contact_phone?: string;
  website?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export const authApi = {
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiResponseSuccess<{ user: AuthUser; company: unknown }>>(
      API_ROUTES.AUTH.REGISTER,
      payload,
    );
    return data;
  },
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<ApiResponseSuccess<AuthResponse>>(
      API_ROUTES.AUTH.LOGIN,
      payload,
    );
    return data;
  },
  async me() {
    const { data } = await apiClient.get<ApiResponseSuccess<AuthUser>>(API_ROUTES.AUTH.ME);
    return data;
  },
  async changePassword(payload: ChangePasswordPayload) {
    const { data } = await apiClient.patch<ApiResponseSuccess<null>>(
      API_ROUTES.AUTH.CHANGE_PASSWORD,
      payload,
    );
    return data;
  },
};
