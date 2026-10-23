'use client';

import { useEffect, useRef, useState } from 'react';
import { UI_MESSAGES } from '@/constants';
import { pickErrorMessage } from '@/lib/utils';

interface AnalyticsResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /**
   * `data` was loaded for a different `key` than the one now in force.
   *
   * Callers need this to avoid presenting an old answer as the current one:
   * the previous data is deliberately kept on screen while a new request runs,
   * which is right for a chart but wrong for anything that states what the
   * request WAS — a window, a filter summary, a row count.
   */
  stale: boolean;
}

interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  loadedKey: string | null;
}

/**
 * Fetches one analytics panel's data, re-fetching whenever `key` changes.
 *
 * Two behaviours the dashboard depends on:
 *
 * 1. **Latest wins.** Changing a filter while a request is in flight is normal
 *    here — the panels are driven by a filter bar someone clicks through. Each
 *    run is tagged, and a stale response is dropped rather than painted, so the
 *    chart can never end up showing a window the filter bar no longer names.
 *
 * 2. **Previous data stays on screen while re-fetching.** Blanking the panel on
 *    every keystroke makes the whole page flash; keeping the old numbers under
 *    a loading flag lets the caller dim them instead.
 *
 * `enabled` is how inactive tabs avoid fetching: a tab nobody is looking at
 * should not be running a GROUP BY over the message log.
 */
export function useAnalyticsResource<T>(
  fetcher: () => Promise<T>,
  key: string,
  enabled = true,
): AnalyticsResource<T> {
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    loading: enabled,
    error: null,
    loadedKey: null,
  });

  // The fetcher closes over the current filters and is therefore a new function
  // on every render. Holding it in a ref keeps it out of the effect's
  // dependencies, so `key` alone decides when to re-fetch.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const runIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const runId = ++runIdRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcherRef
      .current()
      .then((data) => {
        if (runIdRef.current !== runId) return;
        // Stamped with the key it answers, so a caller can tell this apart from
        // data left over from a previous one.
        setState({ data, loading: false, error: null, loadedKey: key });
      })
      .catch((err) => {
        if (runIdRef.current !== runId) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR),
        }));
      });
  }, [key, enabled]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    stale: state.data !== null && state.loadedKey !== key,
  };
}
