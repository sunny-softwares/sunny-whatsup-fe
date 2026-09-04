'use client';

import { create } from 'zustand';
import { companyApi } from '@/lib/api/company.api';
import { registerSubscriptionPageReachability } from '@/lib/subscriptionNotice';
import { COMPANY_FEATURE } from '@/constants/features';
import type { CompanyFeatures } from '@/types';

interface FeatureState {
  // null until loaded; a missing key in the map means the feature is disabled.
  features: CompanyFeatures | null;
  loading: boolean;
  // Fetches the caller's company feature map (company admins only).
  load: () => Promise<void>;
  clear: () => void;
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  features: null,
  loading: false,
  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await companyApi.getFeatures();
      set({ features: res.data });
    } catch {
      // Leave features null: the guard keeps waiting rather than flashing a
      // wrong sidebar; a route change retriggers the load.
    } finally {
      set({ loading: false });
    }
  },
  clear: () => set({ features: null, loading: false }),
}));

// The axios interceptor cannot import this store (client → store → api → client
// would be a cycle), so it reads reachability through this bridge instead. Used
// before redirecting a 402 to the subscription page: if the super admin has
// switched that page off, the redirect would be a dead end.
registerSubscriptionPageReachability(() => {
  const features = useFeatureStore.getState().features;
  // Unknown yet → allow the redirect; the route guards correct it if wrong.
  if (features === null) return true;
  return features[COMPANY_FEATURE.SUBSCRIPTION] === true;
});
