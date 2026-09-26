'use client';

import { useEffect, useState } from 'react';
import {
  PHONE_CODE_METHOD,
  PHONE_CODE_METHOD_LABEL,
  PHONE_PIN_LENGTH,
  UI_MESSAGES,
  type PhoneCodeMethod,
} from '@/constants';
import { cn, pickErrorMessage } from '@/lib/utils';
import type { PhoneNumber } from '@/types';
import type { AddPhoneEmbeddedPayload, AddPhoneNumberPayload } from '@/lib/api/company.api';
import { MetaEmbeddedSignupButton } from '@/components/meta/MetaEmbeddedSignupButton';
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

const CC_PATTERN = /^\d{1,4}$/;
const NATIONAL_NUMBER_PATTERN = /^\d{4,15}$/;

// Keeps digits only so users can paste "+91", "98765 43210", etc.
const digitsOnly = (value: string) => value.replace(/\D/g, '');

// How a number is brought onto the WABA:
// - app → a number already on the WhatsApp Business app (coexistence). Must go
//   through Embedded Signup; SMS/voice verification would disconnect the app.
// - new → a number not on WhatsApp yet, added directly and verified via OTP.
export type AddPhoneMethod = 'app' | 'new';

interface AddPhoneDialogProps {
  open: boolean;
  onClose: () => void;
  addPhone: (payload: AddPhoneNumberPayload) => Promise<unknown>;
  addPhoneEmbedded: (payload: AddPhoneEmbeddedPayload) => Promise<unknown>;
  // Name of the WABA a new (OTP) number is added to. App numbers land wherever
  // Meta puts them — often a separate WABA.
  targetWabaName?: string;
  // Defaults the display name field (e.g. the WABA's business name).
  defaultDisplayName?: string;
  // Called after the number was added (e.g. to reload the list and open verify).
  onAdded: (result: unknown, method: AddPhoneMethod) => void | Promise<void>;
}

/**
 * Adds a business phone number to the connected WABA, either by connecting a
 * WhatsApp Business app number through Embedded Signup (coexistence) or by
 * adding a brand-new number that then goes through verify → register.
 */
export function AddPhoneDialog({
  open,
  onClose,
  addPhone,
  addPhoneEmbedded,
  targetWabaName,
  defaultDisplayName,
  onAdded,
}: AddPhoneDialogProps) {
  const [method, setMethod] = useState<AddPhoneMethod>('app');
  const [cc, setCc] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start fresh every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setMethod('app');
    setCc('');
    setPhoneNumber('');
    setVerifiedName(defaultDisplayName ?? '');
    setBusy(false);
    setError(null);
  }, [open, defaultDisplayName]);

  const selectMethod = (next: AddPhoneMethod) => {
    setMethod(next);
    setError(null);
  };

  const handleAdd = async () => {
    const name = verifiedName.trim();
    if (!CC_PATTERN.test(cc)) {
      setError(UI_MESSAGES.PHONE.INVALID_CC);
      return;
    }
    if (!NATIONAL_NUMBER_PATTERN.test(phoneNumber)) {
      setError(UI_MESSAGES.PHONE.INVALID_NUMBER);
      return;
    }
    if (!name) {
      setError(UI_MESSAGES.PHONE.DISPLAY_NAME_REQUIRED);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await addPhone({ cc, phone_number: phoneNumber, verified_name: name });
      onClose();
      await onAdded(result, 'new');
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const handleEmbeddedSuccess = async ({ code, wabaId: signupWabaId }: { code: string; wabaId?: string }) => {
    setBusy(true);
    setError(null);
    try {
      const result = await addPhoneEmbedded({ code, waba_id: signupWabaId });
      onClose();
      await onAdded(result, 'app');
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const methodOptions: { value: AddPhoneMethod; label: string; hint: string }[] = [
    {
      value: 'app',
      label: UI_MESSAGES.PHONE.ADD_METHOD_APP,
      hint: UI_MESSAGES.PHONE.ADD_METHOD_APP_HINT,
    },
    {
      value: 'new',
      label: UI_MESSAGES.PHONE.ADD_METHOD_NEW,
      hint: UI_MESSAGES.PHONE.ADD_METHOD_NEW_HINT,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(next) => (busy || next ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.PHONE.ADD_TITLE}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {methodOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={method === opt.value}
                onClick={() => selectMethod(opt.value)}
                disabled={busy}
                className={cn(
                  'rounded-md border p-3 text-left transition-colors disabled:opacity-60',
                  method === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'hover:bg-muted/50',
                )}
              >
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="block text-xs text-muted-foreground">{opt.hint}</span>
              </button>
            ))}
          </div>

          {method === 'app' ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{UI_MESSAGES.PHONE.ADD_APP_DESCRIPTION}</p>
              <p className="rounded-md border bg-muted/50 p-2 text-xs">
                {UI_MESSAGES.PHONE.ADD_APP_NEW_WABA_NOTE}
              </p>
              <MetaEmbeddedSignupButton
                onSuccess={handleEmbeddedSuccess}
                disabled={busy}
                label={busy ? UI_MESSAGES.PHONE.ADD_APP_PROCESSING : UI_MESSAGES.PHONE.ADD_APP_BUTTON}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{UI_MESSAGES.PHONE.ADD_DESCRIPTION}</p>
              {targetWabaName ? (
                <p className="rounded-md border bg-muted/50 p-2 text-xs">
                  {UI_MESSAGES.PHONE.ADD_TARGET_WABA}{' '}
                  <span className="font-medium">{targetWabaName}</span>
                </p>
              ) : null}
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {UI_MESSAGES.PHONE.CC_LABEL}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      +
                    </span>
                    <Input
                      value={cc}
                      onChange={(e) => setCc(digitsOnly(e.target.value))}
                      placeholder={UI_MESSAGES.PHONE.CC_PLACEHOLDER}
                      inputMode="numeric"
                      maxLength={4}
                      disabled={busy}
                      className="pl-6"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {UI_MESSAGES.PHONE.NUMBER_LABEL}
                  </label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(digitsOnly(e.target.value))}
                    placeholder={UI_MESSAGES.PHONE.NUMBER_PLACEHOLDER}
                    inputMode="tel"
                    maxLength={15}
                    disabled={busy}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {UI_MESSAGES.PHONE.DISPLAY_NAME_LABEL}
                </label>
                <Input
                  value={verifiedName}
                  onChange={(e) => setVerifiedName(e.target.value)}
                  maxLength={200}
                  disabled={busy}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {UI_MESSAGES.PHONE.DISPLAY_NAME_HINT}
                </p>
              </div>
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {UI_MESSAGES.COMMON.CANCEL}
          </Button>
          {method === 'new' ? (
            <Button onClick={handleAdd} disabled={busy || !cc || !phoneNumber}>
              {busy ? UI_MESSAGES.PHONE.ADDING : UI_MESSAGES.PHONE.ADD_SUBMIT}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
