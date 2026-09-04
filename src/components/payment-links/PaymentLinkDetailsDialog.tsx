'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  PAYMENT_LINK_STATUS_LABEL,
  PAYMENT_LINK_STATUS_VARIANT,
  RAZORPAY_MODE,
  UI_MESSAGES,
  formatAmountMinor,
} from '@/constants';
import { formatDateTime } from '@/lib/utils';
import type { PaymentLink } from '@/types';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm">{value}</dd>
    </div>
  );
}

interface PaymentLinkDetailsDialogProps {
  link: PaymentLink | null;
  onOpenChange: (open: boolean) => void;
}

export function PaymentLinkDetailsDialog({ link, onOpenChange }: PaymentLinkDetailsDialogProps) {
  if (!link) return null;

  const dash = '—';

  return (
    <Dialog open={!!link} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{UI_MESSAGES.PAYMENT_LINK.DETAILS_TITLE}</DialogTitle>
            <Badge variant={PAYMENT_LINK_STATUS_VARIANT[link.status]}>
              {PAYMENT_LINK_STATUS_LABEL[link.status]}
            </Badge>
            {link.razorpay_mode === RAZORPAY_MODE.TEST ? (
              <Badge variant="muted">test</Badge>
            ) : null}
          </div>
          <DialogDescription>{link.description || dash}</DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-4">
          <Field
            label={UI_MESSAGES.PAYMENT_LINK.COL_AMOUNT}
            value={formatAmountMinor(link.amount_minor, link.currency)}
          />
          <Field
            label="Paid"
            value={formatAmountMinor(link.amount_paid_minor, link.currency)}
          />
          <Field label={UI_MESSAGES.PAYMENT_LINK.CUSTOMER_NAME_LABEL} value={link.customer_name || dash} />
          <Field label={UI_MESSAGES.PAYMENT_LINK.CUSTOMER_CONTACT_LABEL} value={link.customer_contact || dash} />
          <div className="col-span-2">
            <Field label={UI_MESSAGES.PAYMENT_LINK.CUSTOMER_EMAIL_LABEL} value={link.customer_email || dash} />
          </div>

          <Field label={UI_MESSAGES.PAYMENT_LINK.COL_CREATED} value={formatDateTime(link.created_at)} />
          <Field
            label={UI_MESSAGES.PAYMENT_LINK.COL_EXPIRES}
            value={link.expire_by ? formatDateTime(link.expire_by) : UI_MESSAGES.PAYMENT_LINK.NO_EXPIRY}
          />
          {link.paid_at ? <Field label="Paid at" value={formatDateTime(link.paid_at)} /> : null}
          {link.cancelled_at ? (
            <Field label="Cancelled at" value={formatDateTime(link.cancelled_at)} />
          ) : null}

          <Field
            label="Partial payments"
            value={
              link.accept_partial
                ? link.first_min_partial_amount_minor
                  ? `Allowed, min ${formatAmountMinor(link.first_min_partial_amount_minor, link.currency)}`
                  : 'Allowed'
                : 'Not allowed'
            }
          />
          <Field label="Reminders" value={link.reminder_enable ? 'On' : 'Off'} />

          <div className="col-span-2">
            <Field
              label={UI_MESSAGES.PAYMENT_LINK.RAZORPAY_ID}
              value={<span className="font-mono text-xs">{link.razorpay_payment_link_id}</span>}
            />
          </div>
          {link.reference_id ? (
            <div className="col-span-2">
              <Field label={UI_MESSAGES.PAYMENT_LINK.REFERENCE_LABEL} value={link.reference_id} />
            </div>
          ) : null}
          {link.createdBy ? (
            <div className="col-span-2">
              <Field
                label={UI_MESSAGES.PAYMENT_LINK.CREATED_BY}
                value={`${link.createdBy.first_name} ${link.createdBy.last_name ?? ''} (${link.createdBy.email})`}
              />
            </div>
          ) : null}
          {link.notes && Object.keys(link.notes).length ? (
            <div className="col-span-2">
              <Field
                label={UI_MESSAGES.PAYMENT_LINK.NOTES}
                value={
                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                    {Object.entries(link.notes).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </li>
                    ))}
                  </ul>
                }
              />
            </div>
          ) : null}
          {link.short_url ? (
            <div className="col-span-2">
              <Field
                label={UI_MESSAGES.PAYMENT_LINK.COL_LINK}
                value={
                  <a
                    href={link.short_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {link.short_url}
                  </a>
                }
              />
            </div>
          ) : null}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
