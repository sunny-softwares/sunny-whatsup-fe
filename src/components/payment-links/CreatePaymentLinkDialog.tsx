'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PAYMENT_LINK_MIN_AMOUNT_MINOR, UI_MESSAGES } from '@/constants';
import { fromDateTimeLocalInput } from '@/lib/utils';
import type { CreatePaymentLinkPayload } from '@/types';

interface CreatePaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  error: string | null;
  onCreate: (payload: CreatePaymentLinkPayload) => Promise<void>;
}

export function CreatePaymentLinkDialog({
  open,
  onOpenChange,
  loading,
  error,
  onCreate,
}: CreatePaymentLinkDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [notifySms, setNotifySms] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [acceptPartial, setAcceptPartial] = useState(false);
  const [firstMin, setFirstMin] = useState('');
  const [expireBy, setExpireBy] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (!open) return;
    setAmount('');
    setDescription('');
    setName('');
    setEmail('');
    setContact('');
    setNotifySms(false);
    setNotifyEmail(false);
    setReminders(true);
    setAcceptPartial(false);
    setFirstMin('');
    setExpireBy('');
    setReference('');
  }, [open]);

  // Razorpay can only deliver over a channel it has an address for, so each
  // toggle stays disabled until its contact field is filled — and un-ticks
  // itself if the field is later cleared, which would otherwise fail server-side.
  useEffect(() => {
    if (!contact) setNotifySms(false);
  }, [contact]);
  useEffect(() => {
    if (!email) setNotifyEmail(false);
  }, [email]);
  useEffect(() => {
    if (!acceptPartial) setFirstMin('');
  }, [acceptPartial]);

  const amountMinor = amount === '' ? 0 : Math.round(Number(amount) * 100);
  const canSubmit = amountMinor >= PAYMENT_LINK_MIN_AMOUNT_MINOR && !loading;

  const handleSubmit = async () => {
    const payload: CreatePaymentLinkPayload = {
      amount_minor: amountMinor,
      description: description || null,
      customer_name: name || null,
      customer_email: email || null,
      customer_contact: contact || null,
      notify_sms: notifySms,
      notify_email: notifyEmail,
      reminder_enable: reminders,
      accept_partial: acceptPartial,
      reference_id: reference || null,
    };

    if (acceptPartial && firstMin !== '') {
      payload.first_min_partial_amount_minor = Math.round(Number(firstMin) * 100);
    }
    if (expireBy) payload.expire_by = fromDateTimeLocalInput(expireBy);

    await onCreate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (loading ? null : onOpenChange(next))}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.PAYMENT_LINK.NEW}</DialogTitle>
          <DialogDescription>{UI_MESSAGES.PAYMENT_LINK.SUBTITLE}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pl-amount">{UI_MESSAGES.PAYMENT_LINK.AMOUNT_LABEL}</Label>
              <Input
                id="pl-amount"
                type="number"
                min={1}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pl-expire">{UI_MESSAGES.PAYMENT_LINK.EXPIRE_BY_LABEL}</Label>
              <Input
                id="pl-expire"
                type="datetime-local"
                value={expireBy}
                onChange={(e) => setExpireBy(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {UI_MESSAGES.PAYMENT_LINK.EXPIRE_BY_HINT}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pl-description">{UI_MESSAGES.PAYMENT_LINK.DESCRIPTION_LABEL}</Label>
            <Input
              id="pl-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={UI_MESSAGES.PAYMENT_LINK.DESCRIPTION_PLACEHOLDER}
            />
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium">{UI_MESSAGES.PAYMENT_LINK.CUSTOMER_SECTION}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pl-name">{UI_MESSAGES.PAYMENT_LINK.CUSTOMER_NAME_LABEL}</Label>
                <Input id="pl-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pl-contact">
                  {UI_MESSAGES.PAYMENT_LINK.CUSTOMER_CONTACT_LABEL}
                </Label>
                <Input
                  id="pl-contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+919876543210"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pl-email">{UI_MESSAGES.PAYMENT_LINK.CUSTOMER_EMAIL_LABEL}</Label>
                <Input
                  id="pl-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {UI_MESSAGES.PAYMENT_LINK.CUSTOMER_HINT}
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label
                className="flex items-center gap-2 text-sm"
                title={!contact ? UI_MESSAGES.PAYMENT_LINK.NOTIFY_SMS_REQUIRES : undefined}
              >
                <Checkbox
                  checked={notifySms}
                  disabled={!contact}
                  onChange={(e) => setNotifySms(e.target.checked)}
                />
                <span className={!contact ? 'text-muted-foreground' : undefined}>
                  {UI_MESSAGES.PAYMENT_LINK.NOTIFY_SMS}
                </span>
              </label>
              <label
                className="flex items-center gap-2 text-sm"
                title={!email ? UI_MESSAGES.PAYMENT_LINK.NOTIFY_EMAIL_REQUIRES : undefined}
              >
                <Checkbox
                  checked={notifyEmail}
                  disabled={!email}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                />
                <span className={!email ? 'text-muted-foreground' : undefined}>
                  {UI_MESSAGES.PAYMENT_LINK.NOTIFY_EMAIL}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium">{UI_MESSAGES.PAYMENT_LINK.OPTIONS_SECTION}</p>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={reminders} onChange={(e) => setReminders(e.target.checked)} />
              {UI_MESSAGES.PAYMENT_LINK.REMINDERS}
            </label>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={acceptPartial}
                onChange={(e) => setAcceptPartial(e.target.checked)}
              />
              {UI_MESSAGES.PAYMENT_LINK.ACCEPT_PARTIAL}
            </label>

            {/* Razorpay rejects this field unless partials are on. */}
            {acceptPartial ? (
              <div className="space-y-1.5">
                <Label htmlFor="pl-first-min">{UI_MESSAGES.PAYMENT_LINK.FIRST_MIN_LABEL}</Label>
                <Input
                  id="pl-first-min"
                  type="number"
                  min={1}
                  step="0.01"
                  value={firstMin}
                  onChange={(e) => setFirstMin(e.target.value)}
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="pl-reference">{UI_MESSAGES.PAYMENT_LINK.REFERENCE_LABEL}</Label>
              <Input
                id="pl-reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={UI_MESSAGES.PAYMENT_LINK.REFERENCE_PLACEHOLDER}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {UI_MESSAGES.COMMON.CANCEL}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.PAYMENT_LINK.CREATE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
