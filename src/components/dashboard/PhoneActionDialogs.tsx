'use client';

import { useEffect, useState } from 'react';
import {
  PHONE_CODE_METHOD,
  PHONE_CODE_METHOD_LABEL,
  PHONE_PIN_LENGTH,
  UI_MESSAGES,
  type PhoneCodeMethod,
} from '@/constants';
import { pickErrorMessage } from '@/lib/utils';
import type { PhoneNumber } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PIN_PATTERN = new RegExp(`^\\d{${PHONE_PIN_LENGTH}}$`);

interface VerifyPhoneDialogProps {
  phone: PhoneNumber | null;
  onClose: () => void;
  requestCode: (phoneId: string, codeMethod: string) => Promise<unknown>;
  verifyCode: (phoneId: string, code: string) => Promise<unknown>;
  // Called after a successful verification (e.g. to reload the phone list).
  onVerified: () => void | Promise<void>;
}

/**
 * Two-step ownership verification for a business phone number: request a code
 * from Meta via SMS / voice call, then confirm the received code.
 */
export function VerifyPhoneDialog({
  phone,
  onClose,
  requestCode,
  verifyCode,
  onVerified,
}: VerifyPhoneDialogProps) {
  const [codeMethod, setCodeMethod] = useState<PhoneCodeMethod>(PHONE_CODE_METHOD.SMS);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start fresh whenever the dialog opens for a (different) phone number.
  useEffect(() => {
    setCodeMethod(PHONE_CODE_METHOD.SMS);
    setCodeSent(false);
    setCode('');
    setBusy(false);
    setError(null);
  }, [phone?.id]);

  const handleSendCode = async () => {
    if (!phone) return;
    setBusy(true);
    setError(null);
    try {
      await requestCode(phone.id, codeMethod);
      setCodeSent(true);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!phone) return;
    if (!PIN_PATTERN.test(code)) {
      setError(UI_MESSAGES.PHONE.INVALID_PIN);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyCode(phone.id, code);
      onClose();
      await onVerified();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!phone} onOpenChange={(next) => (busy || next ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.PHONE.VERIFY_TITLE}</DialogTitle>
          <DialogDescription className="mt-1">
            {UI_MESSAGES.PHONE.VERIFY_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm font-medium">{phone?.display_phone_number}</p>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[160px]">
              <label className="mb-1 block text-xs text-muted-foreground">
                {UI_MESSAGES.PHONE.CODE_METHOD_LABEL}
              </label>
              <select
                value={codeMethod}
                onChange={(e) => setCodeMethod(e.target.value as PhoneCodeMethod)}
                disabled={busy}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Object.values(PHONE_CODE_METHOD).map((m) => (
                  <option key={m} value={m}>
                    {PHONE_CODE_METHOD_LABEL[m]}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" onClick={handleSendCode} disabled={busy}>
              {busy && !codeSent ? UI_MESSAGES.PHONE.SENDING_CODE : UI_MESSAGES.PHONE.SEND_CODE}
            </Button>
          </div>

          {codeSent ? (
            <p className="text-xs text-muted-foreground">{UI_MESSAGES.PHONE.CODE_SENT}</p>
          ) : null}

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.PHONE.CODE_LABEL}
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              placeholder={UI_MESSAGES.PHONE.CODE_PLACEHOLDER}
              inputMode="numeric"
              maxLength={PHONE_PIN_LENGTH}
              disabled={busy}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {UI_MESSAGES.COMMON.CANCEL}
          </Button>
          <Button onClick={handleVerify} disabled={busy || !code}>
            {busy && codeSent ? UI_MESSAGES.PHONE.VERIFYING : UI_MESSAGES.PHONE.VERIFY_SUBMIT}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RegisterPhoneDialogProps {
  phone: PhoneNumber | null;
  onClose: () => void;
  registerPhone: (phoneId: string, pin: string) => Promise<unknown>;
  // Called after a successful registration (e.g. to reload the phone list).
  onRegistered: () => void | Promise<void>;
}

/**
 * Registers a verified business phone number with the WhatsApp Cloud API using
 * the number's two-step verification PIN.
 */
export function RegisterPhoneDialog({
  phone,
  onClose,
  registerPhone,
  onRegistered,
}: RegisterPhoneDialogProps) {
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start fresh whenever the dialog opens for a (different) phone number.
  useEffect(() => {
    setPin('');
    setBusy(false);
    setError(null);
  }, [phone?.id]);

  const handleRegister = async () => {
    if (!phone) return;
    if (!PIN_PATTERN.test(pin)) {
      setError(UI_MESSAGES.PHONE.INVALID_PIN);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await registerPhone(phone.id, pin);
      onClose();
      await onRegistered();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!phone} onOpenChange={(next) => (busy || next ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.PHONE.REGISTER_TITLE}</DialogTitle>
          <DialogDescription className="mt-1">
            {UI_MESSAGES.PHONE.REGISTER_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm font-medium">{phone?.display_phone_number}</p>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {UI_MESSAGES.PHONE.PIN_LABEL}
            </label>
            <Input
              value={pin}
              onChange={(e) => setPin(e.target.value.trim())}
              placeholder={UI_MESSAGES.PHONE.PIN_PLACEHOLDER}
              inputMode="numeric"
              maxLength={PHONE_PIN_LENGTH}
              disabled={busy}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {UI_MESSAGES.COMMON.CANCEL}
          </Button>
          <Button onClick={handleRegister} disabled={busy || !pin}>
            {busy ? UI_MESSAGES.PHONE.REGISTERING : UI_MESSAGES.PHONE.REGISTER_SUBMIT}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
