import { Suspense } from 'react';
import { LoginForm, LoginFormSkeleton } from './LoginForm';

export default function LoginPage() {
  // The form uses useSearchParams() to read `?next=...`, which forces
  // client-side rendering. Wrapping it in <Suspense> lets Next.js
  // statically prerender this page shell during `next build`.
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
