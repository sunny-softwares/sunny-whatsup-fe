'use client';

import { create } from 'zustand';
import { subscriptionApi } from '@/lib/api/subscription.api';
import { registerSubscriptionNoticeSink } from '@/lib/subscriptionNotice';
import type { CompanySubscriptionView, SubscriptionNotice } from '@/types';

interface SubscriptionState {
  /** The full subscription view. Loaded on demand by the subscription page. */
  view: CompanySubscriptionView | null;
  /**
   * The latest notice seen on ANY company API response. Kept separate from
   * `view` because it updates constantly off ordinary traffic, whereas `view`
   * is only fetched when the subscription page needs it.
   */
  notice: SubscriptionNotice | null;
  loading: boolean;
  /** Notices the user has dismissed this session, by code. */
  dismissed: string[];
  load: () => Promise<void>;
  setNotice: (notice: SubscriptionNotice) => void;
  dismiss: (code: string) => void;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  view: null,
  notice: null,
  loading: false,
  dismissed: [],

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await subscriptionApi.get();
      set({ view: res.data });
    } catch {
      // Leave the view null — the page shows its own error state, and the
      // interceptor has already captured any notice that came back.
    } finally {
      set({ loading: false });
    }
  },

  setNotice: (notice) => {
    const current = get().notice;
    // Skip the write when nothing meaningful moved. Without this, every API call
    // would set state and re-render every banner subscriber.
    if (
      current?.code === notice.code &&
      current?.days_remaining === notice.days_remaining &&
      current?.is_blocking === notice.is_blocking
    ) {
      return;
    }
    // A changed code is a genuinely new situation, so an earlier dismissal of a
    // different notice should not suppress it.
    set({ notice, dismissed: current?.code === notice.code ? get().dismissed : [] });
  },

  dismiss: (code) =>
    set((state) =>
      state.dismissed.includes(code) ? state : { ...state, dismissed: [...state.dismissed, code] },
    ),

  clear: () => set({ view: null, notice: null, loading: false, dismissed: [] }),
}));

// The axios interceptor cannot import this store directly (client → store →
// api → client would be a cycle), so it pushes through this sink instead.
// Registered at module load, which happens as soon as anything imports the store.
registerSubscriptionNoticeSink((notice) => {
  useSubscriptionStore.getState().setNotice(notice);
});
