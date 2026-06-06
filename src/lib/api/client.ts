import axios, { AxiosError, AxiosInstance } from 'axios';
import { ENV, ROUTES } from '@/constants';
import { tokenStore } from '@/lib/auth/token';

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      tokenStore.clear();
      // Avoid loops on the auth pages.
      const path = window.location.pathname;
      if (!path.startsWith(ROUTES.LOGIN) && !path.startsWith(ROUTES.REGISTER)) {
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  },
);
