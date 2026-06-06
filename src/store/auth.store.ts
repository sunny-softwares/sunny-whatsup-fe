'use client';

import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import { tokenStore } from '@/lib/auth/token';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  hydrate: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,
  setAuth: (token, user) => {
    tokenStore.set(token, user.role);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    }
    set({ token, user, isHydrated: true });
  },
  setUser: (user) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    }
    set({ user });
  },
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = tokenStore.get();
    const rawUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    let user: AuthUser | null = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser) as AuthUser;
      } catch {
        user = null;
      }
    }
    set({ token, user, isHydrated: true });
  },
  logout: () => {
    tokenStore.clear();
    set({ token: null, user: null });
  },
}));
