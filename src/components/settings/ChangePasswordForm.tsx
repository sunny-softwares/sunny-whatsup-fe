'use client';

import { useState } from 'react';
import { UI_MESSAGES } from '@/constants';
import { authApi } from '@/lib/api/auth.api';
import { pickErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setError(UI_MESSAGES.SETTINGS.PASSWORD_MISMATCH);
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{UI_MESSAGES.SETTINGS.SECURITY_TITLE}</CardTitle>
        <CardDescription>{UI_MESSAGES.SETTINGS.SECURITY_SUBTITLE}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">
              {UI_MESSAGES.SETTINGS.CURRENT_PASSWORD_LABEL}
            </Label>
            <PasswordInput
              id="current_password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">{UI_MESSAGES.SETTINGS.NEW_PASSWORD_LABEL}</Label>
            <PasswordInput
              id="new_password"
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_new_password">
              {UI_MESSAGES.SETTINGS.CONFIRM_PASSWORD_LABEL}
            </Label>
            <PasswordInput
              id="confirm_new_password"
              required
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? (
            <p className="text-sm text-green-600">{UI_MESSAGES.SETTINGS.PASSWORD_CHANGED}</p>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.SETTINGS.CHANGE_PASSWORD_BUTTON}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
