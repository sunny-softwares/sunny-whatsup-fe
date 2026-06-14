'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ROLES, ROUTES, UI_MESSAGES } from '@/constants';
import { companyApi } from '@/lib/api/company.api';
import { useAuthStore } from '@/store/auth.store';
import { pickErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function DeleteAccountCard() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account deletion is a company-scoped action; super admins have no company.
  if (user?.role !== ROLES.COMPANY_ADMIN) return null;

  const handleDelete = async () => {
    // Native confirmation alert — irreversible action.
    if (!window.confirm(UI_MESSAGES.SETTINGS.DELETE_ACCOUNT_CONFIRM)) return;

    setError(null);
    setLoading(true);
    try {
      await companyApi.deleteAccount();
      // The account (and its token's user) no longer exists — clear session and
      // send the user back to the login screen.
      logout();
      router.replace(ROUTES.LOGIN);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">
          {UI_MESSAGES.SETTINGS.DELETE_ACCOUNT_TITLE}
        </CardTitle>
        <CardDescription>{UI_MESSAGES.SETTINGS.DELETE_ACCOUNT_SUBTITLE}</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          <Trash2 className="mr-2 h-4 w-4" />
          {loading ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.SETTINGS.DELETE_ACCOUNT_BUTTON}
        </Button>
      </CardFooter>
    </Card>
  );
}
