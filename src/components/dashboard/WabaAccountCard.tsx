'use client';

import { CheckCircle2, Plus, RefreshCw, Unlink, Zap } from 'lucide-react';
import { PHONE_CODE_VERIFICATION_STATUS, PHONE_PLATFORM_TYPE, UI_MESSAGES } from '@/constants';
import { cn, formatDate } from '@/lib/utils';
import type { PhoneNumber, WabaAccountSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WabaAccountCardProps {
  waba: WabaAccountSummary;
  // Disables every action (another action is in flight).
  disabled: boolean;
  // This card's own sync is running.
  syncing: boolean;
  onActivate: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onAddPhone: () => void;
  onSetDefault: (phone: PhoneNumber) => void;
  onVerify: (phone: PhoneNumber) => void;
  onRegister: (phone: PhoneNumber) => void;
}

/**
 * One of the company's WhatsApp Business Accounts: its status (active or
 * not), account-level actions, and its phone numbers.
 */
export function WabaAccountCard({
  waba,
  disabled,
  syncing,
  onActivate,
  onSync,
  onDisconnect,
  onAddPhone,
  onSetDefault,
  onVerify,
  onRegister,
}: WabaAccountCardProps) {
  const phones = waba.phoneNumbers ?? [];

  // Cloud API onboarding state of a phone number.
  //
  // - CLOUD_API → registered, nothing to do.
  // - ON_PREMISE → held by the WhatsApp Business app (coexistence). Meta
  //   blocks both SMS verification (it would disconnect the app) and the
  //   /register endpoint ("not available for SMB businesses") — activation
  //   happens automatically when the signup's in-app step completes, so we
  //   show guidance instead of actions.
  // - otherwise → dedicated number: Verify (until Meta reports VERIFIED),
  //   then Register.
  const renderRegistrationCell = (p: PhoneNumber) => {
    if (p.platform_type === PHONE_PLATFORM_TYPE.CLOUD_API) {
      return <Badge variant="success">{UI_MESSAGES.PHONE.REGISTERED}</Badge>;
    }
    if (p.platform_type === PHONE_PLATFORM_TYPE.ON_PREMISE) {
      return <p className="max-w-xs text-xs text-muted-foreground">{UI_MESSAGES.PHONE.APP_LINKED}</p>;
    }
    const needsVerify = p.code_verification_status !== PHONE_CODE_VERIFICATION_STATUS.VERIFIED;
    return (
      <div className="flex flex-wrap gap-2">
        {needsVerify ? (
          <Button size="sm" variant="outline" onClick={() => onVerify(p)} disabled={disabled}>
            {UI_MESSAGES.PHONE.VERIFY}
          </Button>
        ) : null}
        <Button size="sm" onClick={() => onRegister(p)} disabled={disabled}>
          {UI_MESSAGES.PHONE.REGISTER}
        </Button>
      </div>
    );
  };

  return (
    <Card className={cn(waba.is_active && 'border-primary/60 ring-1 ring-primary/30')}>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <span className="truncate">{waba.business_name || waba.waba_id}</span>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <Badge variant={waba.is_active ? 'success' : 'muted'}>
                {waba.is_active ? UI_MESSAGES.WABA_ACCOUNTS.ACTIVE : UI_MESSAGES.WABA_ACCOUNTS.INACTIVE}
              </Badge>
            </CardTitle>
            <CardDescription className="break-all">WABA ID: {waba.waba_id}</CardDescription>
            <p className="mt-1 text-xs text-muted-foreground">
              {waba.is_active
                ? UI_MESSAGES.WABA_ACCOUNTS.ACTIVE_HINT
                : UI_MESSAGES.WABA_ACCOUNTS.INACTIVE_HINT}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {!waba.is_active ? (
              <Button size="sm" onClick={onActivate} disabled={disabled}>
                <Zap className="mr-2 h-4 w-4" /> {UI_MESSAGES.WABA_ACCOUNTS.MAKE_ACTIVE}
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={onSync} disabled={disabled}>
              <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
              {syncing ? UI_MESSAGES.COMPANY.WABA_SYNCING : UI_MESSAGES.WABA_ACCOUNTS.SYNC_ONE}
            </Button>
            <Button size="sm" variant="destructive" onClick={onDisconnect} disabled={disabled}>
              <Unlink className="mr-2 h-4 w-4" /> {UI_MESSAGES.WABA_ACCOUNTS.DISCONNECT}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">{UI_MESSAGES.WABA_ACCOUNTS.CONNECTED_AT}</p>
          <p className="text-sm font-medium">{formatDate(waba.connected_at)}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold">{UI_MESSAGES.WABA_ACCOUNTS.PHONE_NUMBERS}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddPhone}
            disabled={disabled}
            className="self-start sm:self-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> {UI_MESSAGES.PHONE.ADD}
          </Button>
        </div>

        {phones.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display</TableHead>
                <TableHead>Phone Number ID</TableHead>
                <TableHead>Verified name</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>{UI_MESSAGES.PHONE.COL_REGISTRATION}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phones.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.display_phone_number}</TableCell>
                  <TableCell className="text-muted-foreground">{p.phone_number_id}</TableCell>
                  <TableCell>{p.verified_name ?? '—'}</TableCell>
                  <TableCell>{p.quality_rating ?? '—'}</TableCell>
                  <TableCell>
                    {p.is_default ? (
                      <Badge variant="success">{UI_MESSAGES.PHONE.DEFAULT}</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSetDefault(p)}
                        disabled={disabled}
                      >
                        {UI_MESSAGES.PHONE.SET_DEFAULT}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{renderRegistrationCell(p)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">{UI_MESSAGES.WABA_ACCOUNTS.NO_PHONES}</p>
        )}
      </CardContent>
    </Card>
  );
}
