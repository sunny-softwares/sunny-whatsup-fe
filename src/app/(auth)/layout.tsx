import { ENV } from '@/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-block rounded-xl bg-primary px-3 py-2 text-lg font-bold text-primary-foreground">
            {ENV.APP_NAME}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Multi-tenant WhatsApp Business platform powered by Meta
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
