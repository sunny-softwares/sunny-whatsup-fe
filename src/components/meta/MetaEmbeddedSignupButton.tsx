'use client';

import { useEffect, useState } from 'react';
import { ENV } from '@/constants';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    FB?: {
      init: (params: Record<string, unknown>) => void;
      login: (
        cb: (response: { authResponse?: { code?: string }; status?: string }) => void,
        params?: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface MetaEmbeddedSignupButtonProps {
  onSuccess: (payload: { code: string; wabaId?: string }) => void;
  disabled?: boolean;
}

/**
 * Loads the Meta JS SDK and triggers the Embedded Signup flow.
 *
 * Set NEXT_PUBLIC_META_APP_ID and NEXT_PUBLIC_META_CONFIG_ID in your env.
 * The callback receives the auth code which should be POSTed to the backend
 * `/company/waba/connect` endpoint for the server-side token handshake.
 *
 * Whether the popup offers "create a new WhatsApp Business Account" or
 * "connect an existing WhatsApp Business app" (or both) is controlled by how
 * the configuration is set up in Meta App Dashboard → WhatsApp → Configuration.
 * No client-side toggle is required.
 */
export function MetaEmbeddedSignupButton({ onSuccess, disabled }: MetaEmbeddedSignupButtonProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ENV.META.APP_ID || ENV.META.APP_ID.startsWith('your-')) {
      setError('Meta App ID is not configured. Set NEXT_PUBLIC_META_APP_ID in your env.');
      return;
    }

    if (window.FB) {
      setSdkReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: ENV.META.APP_ID,
        cookie: true,
        xfbml: true,
        version: ENV.META.GRAPH_VERSION,
      });
      setSdkReady(true);
    };

    const id = 'meta-jssdk';
    if (!document.getElementById(id)) {
      const js = document.createElement('script');
      js.id = id;
      js.async = true;
      js.defer = true;
      js.crossOrigin = 'anonymous';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.body.appendChild(js);
    }

    const sessionListener = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
          const wabaId = data?.data?.waba_id;
          if (wabaId) {
            (window as Window & { __waba_id__?: string }).__waba_id__ = wabaId;
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    window.addEventListener('message', sessionListener);
    return () => window.removeEventListener('message', sessionListener);
  }, []);

  const handleSignup = () => {
    if (!window.FB) {
      setError('Meta SDK has not finished loading. Please retry in a moment.');
      return;
    }
    window.FB.login(
      (response) => {
        const code = response?.authResponse?.code;
        if (code) {
          const wabaId = (window as Window & { __waba_id__?: string }).__waba_id__;
          onSuccess({ code, wabaId });
        } else {
          setError('Signup cancelled or failed.');
        }
      },
      {
        config_id: ENV.META.CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: 3 },
      },
    );
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleSignup} disabled={disabled || !sdkReady}>
        Connect with Meta
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {!sdkReady && !error ? (
        <p className="text-xs text-muted-foreground">Loading Meta SDK…</p>
      ) : null}
    </div>
  );
}
