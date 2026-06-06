'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ManualTokenFormProps {
  onSubmit: (payload: { access_token: string; waba_id: string }) => Promise<void> | void;
  disabled?: boolean;
}

/**
 * Sandbox / manual-entry alternative to Embedded Signup.
 *
 * Use the System User Access Token + Test WABA ID from Meta Business Manager
 * (Meta App Dashboard → WhatsApp → API Setup) when developing locally,
 * or when you don't yet have an approved Embedded Signup configuration.
 */
export function ManualTokenForm({ onSubmit, disabled }: ManualTokenFormProps) {
  const [wabaId, setWabaId] = useState('');
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ access_token: token.trim(), waba_id: wabaId.trim() });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="waba_id">WABA ID</Label>
        <Input
          id="waba_id"
          required
          value={wabaId}
          onChange={(e) => setWabaId(e.target.value)}
          placeholder="e.g. 102290129340398"
        />
        <p className="text-xs text-muted-foreground">
          Found at Meta App Dashboard → WhatsApp → API Setup.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="access_token">System User Access Token</Label>
        <Textarea
          id="access_token"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="EAAB...long token..."
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Use a permanent System User token (Business Settings → System Users → Generate Token) for
          production, or the 24h test token from WhatsApp → API Setup for quick testing. Stored
          encrypted (AES-256-GCM) on the server.
        </p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={submitting || disabled}>
        <KeyRound className="mr-2 h-4 w-4" />
        {submitting ? 'Connecting…' : 'Connect with token'}
      </Button>
    </form>
  );
}
