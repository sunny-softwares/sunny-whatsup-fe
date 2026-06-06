import type { Metadata } from 'next';
import { ENV } from '@/constants';
import { AuthHydrator } from '@/components/layout/AuthHydrator';
import './globals.css';

export const metadata: Metadata = {
  title: ENV.APP_NAME,
  description: 'Multi-tenant WhatsApp Business platform powered by Meta',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthHydrator />
        {children}
      </body>
    </html>
  );
}
