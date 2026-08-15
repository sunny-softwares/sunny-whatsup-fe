import axios, { AxiosError, AxiosInstance } from 'axios';
import { ENV, MEDIA, ROUTES } from '@/constants';
import { tokenStore } from '@/lib/auth/token';
import { filenameFromDisposition, type DownloadedFile } from '@/lib/download';

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

/**
 * GETs an endpoint that streams a file. Errors also arrive as blobs here — use
 * pickBlobErrorMessage to read the API's message back out of them.
 */
export const downloadFile = async (url: string): Promise<DownloadedFile> => {
  const res = await apiClient.get<Blob>(url, { responseType: 'blob' });
  return {
    blob: res.data,
    filename: filenameFromDisposition(
      res.headers['content-disposition'],
      MEDIA.DEFAULT_DOWNLOAD_FILENAME,
    ),
  };
};
