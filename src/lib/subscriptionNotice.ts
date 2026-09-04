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

/**
 * Whether the company can actually open the subscription page.
 *
 * Same bridge problem as above: the interceptor cannot import the feature store,
 * so the store registers a reader here. Used before redirecting a 402 there —
 * if the super admin has switched the page off, sending someone to it is a dead
 * end, and the error is better left to surface where it happened.
 *
 * Defaults to true so a redirect still happens before the feature map has
 * loaded; the guards correct it a moment later if that turns out to be wrong.
 */
let canReachSubscriptionPage: () => boolean = () => true;

export const registerSubscriptionPageReachability = (reader: () => boolean) => {
  canReachSubscriptionPage = reader;
};

export const isSubscriptionPageReachable = () => {
  try {
    return canReachSubscriptionPage();
  } catch {
    return true;
  }
};
