'use client';

import { create } from 'zustand';
import { companyApi } from '@/lib/api/company.api';
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
