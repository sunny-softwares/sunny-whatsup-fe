'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROLES, ROUTES, UI_MESSAGES } from '@/constants';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { pickErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.token, res.data.user);
      const next = searchParams.get('next');
      if (next) {
        router.replace(next);
      } else {
        router.replace(
          res.data.user.role === ROLES.SUPER_ADMIN
            ? ROUTES.ADMIN.DASHBOARD
            : ROUTES.COMPANY.DASHBOARD,
        );
      }
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{UI_MESSAGES.AUTH.LOGIN_TITLE}</CardTitle>
        <CardDescription>{UI_MESSAGES.AUTH.LOGIN_SUBTITLE}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.AUTH.SIGN_IN}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {UI_MESSAGES.AUTH.NO_ACCOUNT}{' '}
            <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
              {UI_MESSAGES.AUTH.SIGN_UP}
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            <Link href={ROUTES.PRIVACY} className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
