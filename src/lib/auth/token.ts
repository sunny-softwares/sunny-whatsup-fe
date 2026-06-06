import { STORAGE_KEYS, COOKIE_KEYS } from '@/constants';

const isBrowser = () => typeof window !== 'undefined';

const setCookie = (key: string, value: string, days = 1) => {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const clearCookie = (key: string) => {
  if (!isBrowser()) return;
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export const tokenStore = {
  get(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  set(token: string, role: string) {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    // Mirror to cookies so Next middleware (server-side) can read them.
    setCookie(COOKIE_KEYS.AUTH_TOKEN, token);
    setCookie(COOKIE_KEYS.AUTH_ROLE, role);
  },
  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    clearCookie(COOKIE_KEYS.AUTH_TOKEN);
    clearCookie(COOKIE_KEYS.AUTH_ROLE);
  },
};
