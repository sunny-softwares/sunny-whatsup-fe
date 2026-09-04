import type { SubscriptionNotice } from '@/types';

/**
 * Bridge between the axios interceptor and the subscription store.
 *
 * The interceptor cannot import the store directly — the store imports the api
 * module, which imports the client, which is where the interceptor lives, and
 * that cycle would leave the store undefined at module-evaluation time. So the
 * store registers a sink here at import time and the interceptor pushes through
 * it.
 *
 * The payoff: every company API response carries `meta.subscription`, so the
 * banner stays current off traffic the app is already making. No polling, and no
 * page needs to know the notice exists.
 */
type NoticeSink = (notice: SubscriptionNotice) => void;

let sink: NoticeSink | null = null;

export const registerSubscriptionNoticeSink = (next: NoticeSink) => {
  sink = next;
};

const hasNotice = (body: unknown): body is { meta: { subscription: SubscriptionNotice } } => {
  const meta = (body as { meta?: { subscription?: unknown } })?.meta;
  return Boolean(meta?.subscription);
};

/** Called for every response, success or error. Silently ignores anything else. */
export const captureSubscriptionNotice = (body: unknown): void => {
  if (!sink || !hasNotice(body)) return;
  sink(body.meta.subscription);
};
