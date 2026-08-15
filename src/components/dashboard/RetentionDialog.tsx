'use client';

import { useEffect, useState } from 'react';
import { MESSAGE_RETENTION, UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { pickErrorMessage } from '@/lib/utils';
import type { Company } from '@/types';
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

interface RetentionDialogProps {
  company: Company | null;
  onClose: () => void;
  // Called with the updated company once the change is saved.
  onSaved: (company: Company) => void;
}

/**
 * Super-admin editor for how many days of message history one company's own
 * admins may see. A visibility limit only — no messages are deleted by it.
 */
export function RetentionDialog({ company, onClose, onSaved }: RetentionDialogProps) {
  const [days, setDays] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to the company's current value each time the dialog opens.
  useEffect(() => {
    if (!company) return;
    setDays(String(company.message_retention_days));
    setError(null);
  }, [company]);

  const parsed = Number(days);
  const valid =
    Number.isInteger(parsed) &&
    parsed >= MESSAGE_RETENTION.MIN_DAYS &&
    parsed <= MESSAGE_RETENTION.MAX_DAYS;

  const handleSave = async () => {
    if (!company || !valid) return;
    setSaving(true);
    setError(null);
    try {
      const res = await superAdminApi.setCompanyMessageRetention(company.id, parsed);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.MESSAGE_RETENTION.SAVE_FAILED));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!company} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{UI_MESSAGES.MESSAGE_RETENTION.DIALOG_TITLE}</DialogTitle>
          <DialogDescription className="mt-1">
            {UI_MESSAGES.MESSAGE_RETENTION.DIALOG_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground" htmlFor="retention-days">
            {UI_MESSAGES.MESSAGE_RETENTION.FIELD_LABEL}
          </label>
          <Input
            id="retention-days"
            type="number"
            min={MESSAGE_RETENTION.MIN_DAYS}
            max={MESSAGE_RETENTION.MAX_DAYS}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {MESSAGE_RETENTION.MIN_DAYS}–{MESSAGE_RETENTION.MAX_DAYS} days.
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {UI_MESSAGES.COMMON.CANCEL}
          </Button>
          <Button onClick={handleSave} disabled={!valid || saving}>
            {UI_MESSAGES.COMMON.SAVE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
