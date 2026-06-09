import Link from 'next/link';
import { ENV, ROUTES } from '@/constants';

export interface TocItem {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  /** Page title shown in the hero banner (e.g. "Privacy Policy"). */
  title: string;
  /** Short description shown under the title. */
  subtitle: React.ReactNode;
  /** ISO-ish display date for the "Last updated" badge. */
  lastUpdated: string;
  /** ISO-ish display date for the "Effective" badge. */
  effectiveDate: string;
  /** Table-of-contents entries — used to build the sticky sidebar and mobile dropdown. */
  toc: TocItem[];
  /** The legal copy itself — typically a sequence of <section> elements. */
  children: React.ReactNode;
}

/**
 * Shared chrome for long-form legal pages.
 * Provides the top nav, hero banner, sticky desktop TOC, mobile collapsible TOC,
 * a footer note, and the site footer.
 *
 * Server-component-safe.
 */
export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  effectiveDate,
  toc,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top navigation bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <span className="rounded-lg bg-primary px-2.5 py-1 text-sm font-bold text-primary-foreground">
              {ENV.APP_NAME}
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href={ROUTES.LOGIN}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="border-b bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">Last updated:</span> {lastUpdated}
            </span>
            <span>
              <span className="font-medium text-foreground">Effective:</span> {effectiveDate}
            </span>
          </div>
        </div>
      </div>

      {/* ── Two-column layout: sticky TOC + content ─────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
          {/* Sticky table of contents — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Table of Contents
              </p>
              <nav>
                <ul className="space-y-1.5">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="prose prose-neutral dark:prose-invert max-w-none">
            {/* Mobile TOC */}
            <details className="mb-8 rounded-lg border bg-muted/40 p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold">Table of Contents</summary>
              <nav className="mt-3">
                <ul className="space-y-1.5">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>

            {children}

            {/* ── Footer note ─────────────────────────────────────────────── */}
            <div className="not-prose mt-10 rounded-lg border-t pt-6 text-xs text-muted-foreground">
              <p>This document was last updated on {lastUpdated}.</p>
              <p className="mt-1">© 2026 {ENV.APP_NAME}. All rights reserved.</p>
            </div>
          </main>
        </div>
      </div>

      {/* ── Site footer ─────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>
            © 2026 <strong className="text-foreground">{ENV.APP_NAME}</strong>. All rights
            reserved.
          </span>
          <nav className="flex gap-4">
            <Link href={ROUTES.PRIVACY} className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <Link href={ROUTES.TERMS} className="text-primary hover:underline">
              Terms &amp; Conditions
            </Link>
            <Link href={ROUTES.LOGIN} className="hover:text-foreground">
              Sign in
            </Link>
            <Link href={ROUTES.REGISTER} className="hover:text-foreground">
              Register
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
