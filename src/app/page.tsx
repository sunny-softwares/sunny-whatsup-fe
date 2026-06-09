import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Layers,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ENV, LEGAL, ROUTES } from '@/constants';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingCta } from '@/components/marketing/MarketingCta';

export const metadata: Metadata = {
  title: `${ENV.APP_NAME} — Multi-tenant WhatsApp Business platform`,
  description:
    'Connect your Meta WhatsApp Business Account, manage approved templates, and reliably dispatch business-initiated messages — all from a secure, multi-tenant dashboard.',
};

/**
 * Static structured content for the marketing page.
 *
 * Living here (instead of inline JSX) keeps the JSX scannable and means future
 * copy changes are a single localised edit. None of these are user-facing
 * dynamic data, so they're safely co-located with the page.
 */
const FEATURES = [
  {
    icon: Building2,
    title: 'Multi-tenant by design',
    body:
      'Every business gets its own isolated workspace. Strict company_id scoping is enforced server-side so tenants only ever see their own data.',
  },
  {
    icon: Lock,
    title: 'Secure WABA credentials',
    body:
      'Meta System User tokens are encrypted at rest with AES-256-GCM. Plaintext tokens never touch disk and are never logged.',
  },
  {
    icon: Sparkles,
    title: 'Meta Embedded Signup',
    body:
      'Connect your WhatsApp Business Account in a guided popup flow. Tokens are exchanged server-to-server — never client-side.',
  },
  {
    icon: FileText,
    title: 'Template management',
    body:
      'Create, sync, and dispatch Meta-approved message templates. Header, body, footer, buttons, and variables — all in one place.',
  },
  {
    icon: Send,
    title: 'Reliable template messaging',
    body:
      'Send business-initiated WhatsApp messages with full delivery logs, status tracking, and per-message error visibility.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit trail and archival',
    body:
      'Every sensitive action is logged. Disconnect-and-purge cleans your primary database while preserving a redacted developer audit trail.',
  },
] as const;

const STEPS = [
  {
    icon: UserCheck,
    title: 'Register your company',
    body:
      'Sign up with your work email. Our Super Admin team reviews and approves your account so the platform stays clean and compliant.',
  },
  {
    icon: Sparkles,
    title: 'Connect your Meta WABA',
    body:
      'Launch the Meta Embedded Signup popup, authorise our app, and your encrypted System User Token is stored securely on our backend.',
  },
  {
    icon: FileText,
    title: 'Sync and manage templates',
    body:
      'Existing Meta-approved templates auto-sync. Create new ones in our editor and submit them to Meta for review without leaving the dashboard.',
  },
  {
    icon: Send,
    title: 'Send messages and track delivery',
    body:
      'Dispatch template messages to opted-in recipients and watch real-time delivery, read, and failure status in your dashboard.',
  },
] as const;

const SECURITY_BULLETS = [
  'AES-256-GCM at-rest encryption for every Meta System User Token',
  'bcrypt password hashing — plaintext passwords never stored',
  'JWT auth with HS256 signing, 1-day expiry, and server-side validation on every request',
  'Multi-tenant isolation enforced via company_id on every database table',
  'Audit logs for company approvals, WABA connect/disconnect, template lifecycle, and more',
  'Helmet.js security headers, strict CORS, and configurable rate limiting (300 req / 15 min by default)',
] as const;

const FAQ = [
  {
    q: `What is ${ENV.APP_NAME}?`,
    a:
      `${ENV.APP_NAME} is a multi-tenant SaaS platform that helps businesses connect their Meta WhatsApp Business Account and send template-based messages to their own customers — without building the integration from scratch.`,
  },
  {
    q: 'Do I need my own Meta Business account?',
    a:
      'Yes. You need a Meta Business Manager and a WhatsApp Business Account. We connect to your WABA on your behalf via the Meta Embedded Signup flow — we never own or operate WABAs for you.',
  },
  {
    q: 'Can I send freeform messages?',
    a:
      'No. The platform is intentionally template-only. WhatsApp requires business-initiated conversations to use Meta-approved templates, so we built the dispatch flow around that policy.',
  },
  {
    q: 'How is my data isolated from other companies?',
    a:
      'Every table includes a company_id foreign key, and every API call is filtered server-side by the authenticated company. Super Admins can see aggregate metrics but cannot impersonate Company users or read their tokens.',
  },
  {
    q: 'What happens when I disconnect my WABA?',
    a:
      'Your WABA, encrypted token, phone numbers, templates, and message logs are hard-deleted from the primary database. A redacted snapshot (token removed) is retained for 3 years in our internal audit archive — see the Privacy Policy for full detail.',
  },
  {
    q: 'How much does it cost?',
    a:
      'Pricing depends on your usage and is shared at sign-up or via an order form. Meta charges you separately for WhatsApp conversations on their own pricing schedule.',
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-emerald-50 via-background to-emerald-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
              WhatsApp Business Platform
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              The fastest way to put your business on{' '}
              <span className="text-emerald-600">WhatsApp.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {ENV.APP_NAME} is a secure, multi-tenant SaaS that connects your Meta WhatsApp
              Business Account, manages approved templates, and reliably dispatches
              business-initiated messages to your customers.
            </p>
            <div className="mt-8">
              <MarketingCta />
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              No credit card required • Approval by our team before activation
            </p>
          </div>

          {/* Decorative mock card */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-emerald-200/40 blur-3xl" />
            <div className="rounded-2xl border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Send template message</p>
                    <p className="text-xs text-muted-foreground">order_shipped • en_US</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Approved
                </span>
              </div>
              <div className="space-y-3 py-5 text-sm">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Recipient</p>
                  <p className="font-medium">+1 555 010 2401</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Variables</p>
                  <p className="font-medium">Maya • #SW-48217</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-4 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Delivered
                </span>
                <span className="text-muted-foreground">just now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted-by-developers strip ──────────────────────────────── */}
      <section className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600" /> AES-256-GCM token encryption
          </span>
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-600" /> Multi-tenant by default
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-600" /> Meta Graph API v21.0+
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> GDPR & DPDP-aware
          </span>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="border-b bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to run WhatsApp messaging at scale
            </h2>
            <p className="mt-4 text-muted-foreground">
              From secure onboarding to template lifecycle and reliable dispatch — all of it under
              one roof, with the controls a serious business expects.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border bg-card p-6 transition-all hover:border-emerald-300 hover:shadow-md"
              >
                <div className="inline-flex rounded-lg bg-emerald-100 p-2.5 text-emerald-700 transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-b bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From signup to send in minutes</h2>
            <p className="mt-4 text-muted-foreground">
              Four guided steps, no manual provisioning, no waiting around for engineering.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, index) => (
              <li
                key={title}
                className="relative rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                  Step {index + 1}
                </div>
                <div className="mt-3 inline-flex rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Security ─────────────────────────────────────────────────── */}
      <section id="security" className="border-b bg-background py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Built for trust
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Security is not an afterthought — it&apos;s the architecture.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We handle credentials that talk directly to a regulated messaging API. We treat them
              that way, end-to-end, with controls you can read about in our Privacy Policy and
              audit in our codebase behaviour.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={ROUTES.PRIVACY}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Read the Privacy Policy <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.TERMS}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Read the Terms &amp; Conditions <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <ul className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
            {SECURITY_BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="leading-relaxed text-muted-foreground">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Use cases ────────────────────────────────────────────────── */}
      <section className="border-b bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for the messages businesses actually need to send
            </h2>
            <p className="mt-4 text-muted-foreground">
              Wherever a conversation with your customer must be initiated by you, {ENV.APP_NAME}{' '}
              keeps it compliant, reliable, and on-brand.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Order & shipping updates', 'Send confirmations, tracking IDs, and delivery alerts from your Utility templates.'],
              ['Authentication & OTP', 'Use Authentication templates for sign-in codes and account verification.'],
              ['Appointment reminders', 'Keep no-shows down with Utility template reminders the day before.'],
              ['Marketing announcements', 'Reach opted-in customers with Meta-approved Marketing templates.'],
              ['Customer support intros', 'Open the conversation politely and let support take it from there.'],
              ['Onboarding journeys', 'Trigger a series of templates as new customers move through your funnel.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border bg-card p-6">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section id="faq" className="border-b bg-background py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Email{' '}
              <a
                href={`mailto:${LEGAL.CONTACT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {LEGAL.CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border bg-card p-5 transition-colors open:border-emerald-300"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                  {q}
                  <span className="rounded-full border border-input p-1 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start sending on WhatsApp?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-50">
            Register your company in under two minutes. Our team activates approved accounts so you
            can connect your Meta WABA and dispatch your first template message the same day.
          </p>
          <div className="mt-8 flex justify-center">
            <MarketingCta
              align="center"
              primaryLabelLoggedOut="Create your account"
              primaryLabelLoggedIn="Open your dashboard"
              showSecondary={false}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <Link href={ROUTES.HOME} className="inline-flex items-center gap-2">
              <span className="rounded-lg bg-primary px-2.5 py-1 text-sm font-bold text-primary-foreground">
                {ENV.APP_NAME}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Multi-tenant WhatsApp Business platform powered by Meta. Built for businesses that
              need reliable, compliant, template-based messaging at scale.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Product
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground">
                  How it works
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-foreground">
                  Security
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Legal
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href={ROUTES.PRIVACY} className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={ROUTES.TERMS} className="hover:text-foreground">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${LEGAL.CONTACT_EMAIL}`}
                  className="hover:text-foreground"
                >
                  {LEGAL.CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <span>
              © {LEGAL.COPYRIGHT_YEAR} {ENV.APP_NAME}. All rights reserved.
            </span>
            <span>{LEGAL.ADDRESS}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
