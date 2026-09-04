'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { subscriptionApi } from '@/lib/api/subscription.api';
import { pickErrorMessage } from '@/lib/utils';
import {
  ENV,
  RAZORPAY_CHECKOUT_SCRIPT_ID,
  RAZORPAY_CHECKOUT_SRC,
  UI_MESSAGES,
  type BillingCycle,
} from '@/constants';

/**
 * Razorpay Checkout's global, as much of it as we use.
 * The library ships no types and we deliberately avoid adding the SDK.
 */
interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

/**
 * Loads checkout.js on demand, deduping across mounts.
 *
 * Same pattern as MetaEmbeddedSignupButton: check the global first, then look
 * for an existing tag by id before appending a new one — otherwise navigating
 * back to this page stacks duplicate scripts.
 */
const loadCheckoutScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('not in a browser'));
    if (window.Razorpay) return resolve();

    const existing = document.getElementById(RAZORPAY_CHECKOUT_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('checkout.js failed to load')));
      return undefined;
    }

    const script = document.createElement('script');
    script.id = RAZORPAY_CHECKOUT_SCRIPT_ID;
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('checkout.js failed to load'));
    document.body.appendChild(script);
    return undefined;
  });

interface RazorpayCheckoutButtonProps {
  planKey: string;
  billingCycle: BillingCycle;
  label: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancelled?: () => void;
}

export function RazorpayCheckoutButton({
  planKey,
  billingCycle,
  label,
  disabled,
  className,
  variant = 'default',
  onSuccess,
  onError,
  onCancelled,
}: RazorpayCheckoutButtonProps) {
  const [busy, setBusy] = useState(false);

  // A REF, not state. A state value would be captured as `true` inside the async
  // closure below at the moment it was created, so flipping it on unmount would
  // never be observed — and setting state from a cleanup would itself warn. A
  // ref is read at call time, which is exactly when the answer matters: the
  // Razorpay modal can outlive this component if the user navigates mid-payment.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClick = useCallback(async () => {
    setBusy(true);
    try {
      await loadCheckoutScript();
    } catch {
      if (mountedRef.current) setBusy(false);
      onError(UI_MESSAGES.SUBSCRIPTION.CHECKOUT_SCRIPT_FAILED);
      return;
    }

    let order;
    try {
      const res = await subscriptionApi.createOrder({
        plan_key: planKey,
        billing_cycle: billingCycle,
      });
      order = res.data;
    } catch (err) {
      if (mountedRef.current) setBusy(false);
      onError(pickErrorMessage(err, UI_MESSAGES.SUBSCRIPTION.CHECKOUT_FAILED));
      return;
    }

    if (!window.Razorpay) {
      if (mountedRef.current) setBusy(false);
      onError(UI_MESSAGES.SUBSCRIPTION.CHECKOUT_SCRIPT_FAILED);
      return;
    }

    const checkout = new window.Razorpay({
      // The key comes from the SERVER response, never a frontend env var, so the
      // browser and backend can never end up on different Razorpay modes.
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: ENV.APP_NAME,
      description: `${order.plan.name} — ${order.billing_cycle}`,
      prefill: order.prefill,
      notes: { plan_key: order.plan.key, billing_cycle: order.billing_cycle },
      theme: { color: '#178a45' },

      handler: async (response: RazorpayCheckoutResponse) => {
        try {
          // The fast path. The webhook confirms the same payment independently,
          // and whichever lands second is a no-op — so a failure here does NOT
          // mean the payment was lost.
          await subscriptionApi.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          onSuccess();
        } catch (err) {
          onError(pickErrorMessage(err, UI_MESSAGES.SUBSCRIPTION.CHECKOUT_FAILED));
        } finally {
          if (mountedRef.current) setBusy(false);
        }
      },

      modal: {
        ondismiss: () => {
          if (mountedRef.current) setBusy(false);
          onCancelled?.();
        },
      },
    });

    checkout.on('payment.failed', (payload) => {
      if (mountedRef.current) setBusy(false);
      onError(payload?.error?.description || UI_MESSAGES.SUBSCRIPTION.CHECKOUT_FAILED);
    });

    checkout.open();
  }, [planKey, billingCycle, onSuccess, onError, onCancelled]);

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={disabled || busy}
      onClick={handleClick}
    >
      {busy ? UI_MESSAGES.COMMON.LOADING : label}
    </Button>
  );
}
