'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ROUTES, UI_MESSAGES } from '@/constants';
import { authApi, type RegisterPayload } from '@/lib/api/auth.api';
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

const initial: RegisterPayload = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  company_name: '',
  legal_name: '',
  contact_phone: '',
  website: '',
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterPayload>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onChange = (key: keyof RegisterPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleaned: RegisterPayload = {
        ...form,
        last_name: form.last_name || undefined,
        legal_name: form.legal_name || undefined,
        contact_phone: form.contact_phone || undefined,
        website: form.website || undefined,
      };
      await authApi.register(cleaned);
      setSuccess(true);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registration submitted</CardTitle>
          <CardDescription>{UI_MESSAGES.AUTH.REGISTRATION_PENDING}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Link href={ROUTES.LOGIN} className="w-full">
            <Button className="w-full" variant="outline">
              Back to sign in
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{UI_MESSAGES.AUTH.REGISTER_TITLE}</CardTitle>
        <CardDescription>{UI_MESSAGES.AUTH.REGISTER_SUBTITLE}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" required value={form.first_name} onChange={onChange('first_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" value={form.last_name ?? ''} onChange={onChange('last_name')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" required value={form.email} onChange={onChange('email')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={8} value={form.password} onChange={onChange('password')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input id="company_name" required value={form.company_name} onChange={onChange('company_name')} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact phone</Label>
              <Input id="contact_phone" value={form.contact_phone ?? ''} onChange={onChange('contact_phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://" value={form.website ?? ''} onChange={onChange('website')} />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? UI_MESSAGES.COMMON.LOADING : UI_MESSAGES.COMMON.SUBMIT}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {UI_MESSAGES.AUTH.HAVE_ACCOUNT}{' '}
            <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
              {UI_MESSAGES.AUTH.SIGN_IN}
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            By registering you agree to our{' '}
            <Link href={ROUTES.PRIVACY} className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
