import axios, { AxiosError, AxiosInstance } from 'axios';
import { ENV, HTTP_STATUS, MEDIA, ROUTES } from '@/constants';
import { tokenStore } from '@/lib/auth/token';
import { filenameFromDisposition, type DownloadedFile } from '@/lib/download';
import {
  captureSubscriptionNotice,
  isSubscriptionPageReachable,
} from '@/lib/subscriptionNotice';

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (config.headers) {
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Lets the server render dates it bakes into text (subscription notices) in
    // the same zone the browser renders everything else, so one screen never
    // shows two different days for the same instant.
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) config.headers['X-Timezone'] = timezone;
    } catch {
      // Ancient browser without a resolvable zone: the server falls back.
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    // Every company response carries meta.subscription. Harvesting it here keeps
    // the banner current off traffic the app is making anyway — no polling, and
    // no page needing to know the notice exists.
    captureSubscriptionNotice(res.data);
    return res;
  },
  (error: AxiosError) => {
    captureSubscriptionNotice(error.response?.data);

    if (typeof window !== 'undefined' && error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      tokenStore.clear();
      // Avoid loops on the auth pages.
      const path = window.location.pathname;
      if (!path.startsWith(ROUTES.LOGIN) && !path.startsWith(ROUTES.REGISTER)) {
        window.location.href = ROUTES.LOGIN;
      }
    }

    // 402 is a billing problem, not a permission problem: the subscription is
    // blocking. Send the user to the page they can actually fix it from —
    // except when they are already there, or the request WAS a payment call.
    if (typeof window !== 'undefined' && error.response?.status === HTTP_STATUS.PAYMENT_REQUIRED) {
      const path = window.location.pathname;
      // Skip the redirect when the super admin has switched the subscription
      // page off — sending someone to a page they cannot open is a dead end.
      if (!path.startsWith(ROUTES.COMPANY.SUBSCRIPTION) && isSubscriptionPageReachable()) {
        window.location.href = ROUTES.COMPANY.SUBSCRIPTION;
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
