import type { Metadata } from 'next';
import Link from 'next/link';
import { ENV } from '@/constants';
import { ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: `Privacy Policy | ${ENV.APP_NAME}`,
  description:
    'Learn how Sunny WhatsUp collects, uses, stores, and protects your personal information.',
};

const LAST_UPDATED = 'June 6, 2026';
const EFFECTIVE_DATE = 'June 6, 2026';

const TOC = [
  { id: 'introduction', label: '1. Introduction and Who We Are' },
  { id: 'scope', label: '2. Scope of This Policy' },
  { id: 'definitions', label: '3. Definitions' },
  { id: 'information-collected', label: '4. Information We Collect' },
  { id: 'how-collected', label: '5. How We Collect Information' },
  { id: 'how-used', label: '6. How We Use Your Information' },
  { id: 'legal-bases', label: '7. Legal Bases for Processing (GDPR)' },
  { id: 'multi-tenant', label: '8. Multi-Tenant Architecture & Isolation' },
  { id: 'meta-integration', label: '9. Meta / WhatsApp Business Integration' },
  { id: 'data-sharing', label: '10. Data Sharing and Disclosure' },
  { id: 'security', label: '11. Data Security' },
  { id: 'retention', label: '12. Data Retention and Deletion' },
  { id: 'archival', label: '13. Data Archival Practices' },
  { id: 'cookies', label: '14. Cookies and Tracking Technologies' },
  { id: 'transfers', label: '15. International Data Transfers' },
  { id: 'rights', label: '16. Your Rights and Choices' },
  { id: 'children', label: "17. Children's Privacy" },
  { id: 'third-party', label: '18. Third-Party Links and Services' },
  { id: 'changes', label: '19. Changes to This Policy' },
  { id: 'contact', label: '20. Contact Us' },
  { id: 'addenda', label: '21. Jurisdiction-Specific Addenda' },
];

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            This policy explains how <strong>{ENV.APP_NAME}</strong> collects, uses, discloses, and
            protects your personal information. Please read it carefully.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">Last updated:</span> {LAST_UPDATED}
            </span>
            <span>
              <span className="font-medium text-foreground">Effective:</span> {EFFECTIVE_DATE}
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
                  {TOC.map((item) => (
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
                  {TOC.map((item) => (
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

            {/* ── Section 1 ──────────────────────────────────────────────── */}
            <section id="introduction" className="mb-10 scroll-mt-24">
              <SectionHeading>1. Introduction and Who We Are</SectionHeading>
              <p>
                Welcome to <strong>Sunny WhatsUp</strong> (&quot;we,&quot; &quot;us,&quot;
                &quot;our,&quot; or the &quot;Platform&quot;). Sunny WhatsUp is a cloud-based,
                multi-tenant Software-as-a-Service (SaaS) platform that enables WhatsApp Business
                API access for businesses (&quot;Companies&quot;) through integration with the Meta
                WhatsApp Business Platform.
              </p>
              <p>
                This Privacy Policy (&quot;Policy&quot;) explains how Sunny WhatsUp collects, uses,
                discloses, stores, retains, and protects personal information about:
              </p>
              <ul>
                <li>
                  <strong>Visitors</strong> to our public-facing web properties
                </li>
                <li>
                  <strong>Company Admins</strong> — representatives of businesses that register on
                  the Platform and connect their Meta WhatsApp Business Accounts (WABAs)
                </li>
                <li>
                  <strong>Super Admins</strong> — platform operators and administrators employed or
                  authorised by Sunny WhatsUp
                </li>
                <li>
                  <strong>Message Recipients</strong> — end users whose phone numbers are sent
                  WhatsApp messages by Companies using our Platform
                </li>
              </ul>
              <p>
                By accessing or using Sunny WhatsUp, you acknowledge that you have read, understood,
                and agree to the practices described in this Policy. If you do not agree, please
                discontinue use immediately.
              </p>
              <InfoBox>
                <strong>Data Controller:</strong> Sunny WhatsUp (the legal entity operating this
                platform)
                <br />
                Contact:{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a>
                <br />
                Address: B/5, Ananya Appartment, Nr. Mangleshwar Mahadev, Ghodasar, Ahmedabad – 380050, Gujarat, India
              </InfoBox>
            </section>

            {/* ── Section 2 ──────────────────────────────────────────────── */}
            <section id="scope" className="mb-10 scroll-mt-24">
              <SectionHeading>2. Scope of This Policy</SectionHeading>
              <p>This Policy applies to:</p>
              <ul>
                <li>
                  The Sunny WhatsUp web application and all subdomains
                </li>
                <li>Our backend API services</li>
                <li>
                  All data collected through the platform including registration flows, WhatsApp
                  Business Account connection, template management, and message dispatch
                </li>
                <li>
                  All integration data exchanged with Meta Platforms, Inc. (&quot;Meta&quot;) via
                  the WhatsApp Business Platform API
                </li>
              </ul>
              <p>This Policy does <strong>not</strong> apply to:</p>
              <ul>
                <li>Third-party websites, services, or products linked from our platform</li>
                <li>
                  Meta&apos;s own data practices — please review{' '}
                  <a
                    href="https://www.facebook.com/privacy/policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Meta&apos;s Privacy Policy
                  </a>
                </li>
                <li>
                  The end-users&apos; own WhatsApp data, which is governed by Meta&apos;s terms
                  between the Company and Meta
                </li>
              </ul>
            </section>

            {/* ── Section 3 ──────────────────────────────────────────────── */}
            <section id="definitions" className="mb-10 scroll-mt-24">
              <SectionHeading>3. Definitions</SectionHeading>
              <DefinitionTable
                rows={[
                  ['Platform', 'The Sunny WhatsUp SaaS application and associated APIs'],
                  [
                    'Company / Tenant',
                    'A business entity registered on the Platform as a Company Admin',
                  ],
                  [
                    'Company Admin',
                    'A natural person representing a Company, with access to connect WABAs, manage templates, and send messages',
                  ],
                  [
                    'Super Admin',
                    'A Sunny WhatsUp platform operator with administrative access across all tenants',
                  ],
                  [
                    'WABA',
                    'WhatsApp Business Account — a Meta account linked to a verified business phone number',
                  ],
                  [
                    'System User Token',
                    'A long-lived access token issued by Meta granting programmatic access to a WABA',
                  ],
                  [
                    'Template',
                    'A pre-approved Meta message template required for business-initiated WhatsApp conversations',
                  ],
                  [
                    'Personal Data / Personal Information',
                    'Any information relating to an identified or identifiable natural person',
                  ],
                  ['Processing', 'Any operation performed on Personal Data'],
                  ['GDPR', 'EU General Data Protection Regulation (2016/679)'],
                  ['CCPA', 'California Consumer Privacy Act'],
                  [
                    'DPDP Act',
                    'India Digital Personal Data Protection Act 2023',
                  ],
                ]}
              />
            </section>

            {/* ── Section 4 ──────────────────────────────────────────────── */}
            <section id="information-collected" className="mb-10 scroll-mt-24">
              <SectionHeading>4. Information We Collect</SectionHeading>

              <SubHeading>4.1 Account and Registration Data</SubHeading>
              <p>When a Company Admin registers on Sunny WhatsUp, we collect:</p>
              <ul>
                <li>
                  <strong>Identity data:</strong> First name, last name
                </li>
                <li>
                  <strong>Contact data:</strong> Email address, contact phone number
                </li>
                <li>
                  <strong>Company data:</strong> Company name, legal name, website URL, contact
                  email, contact phone number
                </li>
                <li>
                  <strong>Authentication data:</strong> Hashed passwords (bcrypt, cost factor 10 —
                  we never store plaintext passwords)
                </li>
                <li>
                  <strong>Account metadata:</strong> Registration timestamp, last login timestamp,
                  account status (pending / approved / rejected / suspended), approval/rejection
                  reason
                </li>
              </ul>

              <SubHeading>4.2 WhatsApp Business Account (WABA) Data</SubHeading>
              <p>
                When a Company Admin connects their Meta WABA via our platform, we collect and
                store:
              </p>
              <ul>
                <li>
                  <strong>WABA identifiers:</strong> Meta WABA ID, Meta Business ID
                </li>
                <li>
                  <strong>Business profile data:</strong> WhatsApp Business display name (as
                  returned by Meta&apos;s Graph API)
                </li>
                <li>
                  <strong>System User Access Token:</strong> The OAuth access token issued by Meta
                  that grants our platform permission to send messages on behalf of the Company. This
                  token is <strong>encrypted at rest using AES-256-GCM</strong> with a 256-bit key
                  stored in a separate environment variable. The stored format is{' '}
                  <code>ivHex:authTagHex:cipherHex</code>. The plaintext token is never logged and
                  never written to disk unencrypted.
                </li>
                <li>
                  <strong>Connection metadata:</strong> Connection timestamp, onboarding flow used
                  (Meta Embedded Signup, existing account onboarding, or manual sandbox token entry),
                  IP address of the connecting user
                </li>
                <li>
                  <strong>Phone number data:</strong> Meta phone number IDs, display phone numbers,
                  verified names, quality ratings, default status
                </li>
              </ul>

              <SubHeading>4.3 Message Template Data</SubHeading>
              <ul>
                <li>
                  Template names, languages, categories (Marketing, Utility, Authentication)
                </li>
                <li>
                  Template component structures including header text, body text with positional
                  variables, footer text, and button configurations — stored as structured JSON
                </li>
                <li>Meta-assigned template IDs and approval status</li>
                <li>Quality scores and rejection reasons returned by Meta</li>
                <li>Template sync timestamps and raw metadata from the Meta Graph API</li>
                <li>The identity of the Sunny WhatsUp user who created the template</li>
              </ul>

              <SubHeading>4.4 Message Logs</SubHeading>
              <p>For every WhatsApp message sent via our platform, we log:</p>
              <ul>
                <li>Sender company and user identity</li>
                <li>Recipient phone number</li>
                <li>Message type (template-only)</li>
                <li>
                  Full message payload as submitted to Meta&apos;s API (template name, language
                  code, and resolved variable values)
                </li>
                <li>Meta&apos;s message ID returned upon successful submission</li>
                <li>Delivery status (Queued, Sent, Delivered, Read, Failed)</li>
                <li>Error payloads from Meta (if message delivery failed)</li>
                <li>Timestamp of dispatch</li>
              </ul>
              <InfoBox variant="note">
                We log the message payload (including variable values substituted into templates). We
                do <strong>not</strong> intercept, read, or store the actual WhatsApp conversation
                stream — our logging is limited to outbound API calls initiated on the Company&apos;s
                behalf.
              </InfoBox>

              <SubHeading>4.5 Usage and Technical Data</SubHeading>
              <ul>
                <li>
                  <strong>Authentication tokens:</strong> JWT tokens (HS-256, 1-day expiry) stored in
                  browser localStorage and mirrored to HTTP cookies for server-side route validation
                </li>
                <li>
                  <strong>IP addresses:</strong> Captured for security-relevant actions (WABA
                  connect, disconnect/purge)
                </li>
                <li>
                  <strong>Audit logs:</strong> Records of administrative actions (company
                  approval/rejection, WABA connection/disconnection, template creation/deletion)
                  including actor identity, action type, target entity, and timestamp
                </li>
                <li>
                  <strong>HTTP access logs:</strong> Standard server access logs including request
                  method, path, status code, and response time
                </li>
              </ul>

              <SubHeading>4.6 Data Collected from Third Parties (Meta)</SubHeading>
              <p>
                When you authorise our platform via the Meta Embedded Signup flow, Meta returns:
              </p>
              <ul>
                <li>
                  An authorization code (short-lived, exchanged server-side for an access token —
                  the code itself is not persisted)
                </li>
                <li>WABA metadata (business name, currency, timezone)</li>
                <li>Phone number details (display number, verified name, quality rating)</li>
                <li>Message template listings including approval status and quality scores</li>
                <li>Token debug information (scopes, expiry) used during validation</li>
              </ul>
            </section>

            {/* ── Section 5 ──────────────────────────────────────────────── */}
            <section id="how-collected" className="mb-10 scroll-mt-24">
              <SectionHeading>5. How We Collect Information</SectionHeading>
              <ol>
                <li>
                  <strong>Directly from you:</strong> Registration forms, the WABA connection flow
                  (Embedded Signup or manual token entry), template creation forms, and message
                  sending actions
                </li>
                <li>
                  <strong>Automatically via our systems:</strong> Server-side logging, JWT validation
                  middleware, and audit trail creation on every significant action
                </li>
                <li>
                  <strong>From Meta&apos;s Graph API:</strong> WABA metadata, phone numbers, template
                  status updates (pulled during sync operations triggered by you or automatically
                  after WABA connection)
                </li>
                <li>
                  <strong>From your browser:</strong> Cookies and localStorage for authentication
                  state persistence; no third-party analytics trackers are embedded in the current
                  platform version
                </li>
              </ol>
            </section>

            {/* ── Section 6 ──────────────────────────────────────────────── */}
            <section id="how-used" className="mb-10 scroll-mt-24">
              <SectionHeading>6. How We Use Your Information</SectionHeading>

              <SubHeading>6.1 Service Provision</SubHeading>
              <ul>
                <li>Creating and managing Company and Super Admin accounts</li>
                <li>Facilitating the Meta Embedded Signup onboarding flow</li>
                <li>
                  Storing and managing WABA credentials securely to enable message dispatch on your
                  behalf
                </li>
                <li>Syncing and displaying your Meta message templates</li>
                <li>
                  Sending WhatsApp messages via the Meta Graph API using your WABA credentials
                </li>
                <li>Displaying message delivery logs and statistics on your dashboard</li>
              </ul>

              <SubHeading>6.2 Platform Administration</SubHeading>
              <ul>
                <li>Super Admin review and approval/rejection of Company registrations</li>
                <li>Monitoring platform health, usage, and message delivery statistics</li>
                <li>Displaying cross-tenant aggregate statistics to Super Admins</li>
              </ul>

              <SubHeading>6.3 Security and Fraud Prevention</SubHeading>
              <ul>
                <li>
                  Verifying identity and authentication at every API request via JWT validation
                </li>
                <li>
                  Rate limiting (300 requests per 15-minute window per IP by default) to prevent
                  abuse
                </li>
                <li>
                  Audit logging of all sensitive administrative actions for security investigation
                </li>
                <li>Detecting and preventing unauthorised access</li>
              </ul>

              <SubHeading>6.4 Legal Compliance</SubHeading>
              <ul>
                <li>Maintaining records as required by applicable law</li>
                <li>Responding to lawful requests from authorities</li>
                <li>Enforcing our Terms of Service</li>
              </ul>

              <SubHeading>6.5 Service Improvement</SubHeading>
              <ul>
                <li>Internal aggregate analytics to understand usage patterns and improve features</li>
              </ul>
              <InfoBox>
                We do <strong>not</strong> sell your data or use it for advertising.
              </InfoBox>
            </section>

            {/* ── Section 7 ──────────────────────────────────────────────── */}
            <section id="legal-bases" className="mb-10 scroll-mt-24">
              <SectionHeading>7. Legal Bases for Processing (GDPR)</SectionHeading>
              <p>
                For users in the European Economic Area (EEA), the United Kingdom, and Switzerland,
                we rely on the following legal bases under GDPR Article 6:
              </p>
              <DataTable
                headers={['Processing Activity', 'Legal Basis']}
                rows={[
                  [
                    'Account registration and service delivery',
                    'Contract (Art. 6(1)(b)) — necessary to perform the services you requested',
                  ],
                  [
                    'WABA token storage and message dispatch',
                    'Contract (Art. 6(1)(b)) — the core purpose of the platform',
                  ],
                  [
                    'Security logging and audit trails',
                    "Legitimate interests (Art. 6(1)(f)) — we have a legitimate interest in maintaining platform security and integrity",
                  ],
                  [
                    'Super Admin approval workflow',
                    'Contract (Art. 6(1)(b)) — necessary to manage the platform',
                  ],
                  [
                    'Legal holds and compliance records',
                    'Legal obligation (Art. 6(1)(c))',
                  ],
                  [
                    'Data archival upon WABA disconnection',
                    'Legitimate interests (Art. 6(1)(f)) — maintaining internal audit trails for developers and compliance; balanced against your right to erasure (see Section 13)',
                  ],
                ]}
              />
              <p className="mt-4 text-sm text-muted-foreground">
                For special categories of data: We do not intentionally collect special category data
                (health, biometric, racial/ethnic, etc.). If any such data appears incidentally in
                message content, it is not processed or used for any purpose other than transmission
                to Meta&apos;s API.
              </p>
            </section>

            {/* ── Section 8 ──────────────────────────────────────────────── */}
            <section id="multi-tenant" className="mb-10 scroll-mt-24">
              <SectionHeading>8. Multi-Tenant Data Architecture and Isolation</SectionHeading>
              <p>
                Sunny WhatsUp is a multi-tenant platform. Each Company&apos;s data is logically
                isolated using a <code>company_id</code> foreign key present on every data table.
                Our architecture enforces the following isolation guarantees:
              </p>
              <ul>
                <li>
                  Every API endpoint that returns tenant-specific data applies a{' '}
                  <code>WHERE company_id = [authenticated company&apos;s ID]</code> filter, enforced
                  server-side through authenticated middleware
                </li>
                <li>
                  Company Admins are only ever authorised to access, manage, and view data belonging
                  to their own company
                </li>
                <li>
                  Super Admins may view data across all tenants for platform administration purposes
                  but cannot impersonate Company Admins or access their login sessions
                </li>
                <li>
                  All role-based authorisation checks occur server-side via middleware — client-side
                  roles are never trusted
                </li>
              </ul>
              <InfoBox variant="note">
                Notwithstanding logical isolation, all tenants share the same underlying database
                infrastructure. We rely on application-layer controls rather than separate database
                instances for data isolation.
              </InfoBox>
            </section>

            {/* ── Section 9 ──────────────────────────────────────────────── */}
            <section id="meta-integration" className="mb-10 scroll-mt-24">
              <SectionHeading>9. Meta (WhatsApp Business Platform) Integration</SectionHeading>

              <SubHeading>9.1 How the Integration Works</SubHeading>
              <p>
                Sunny WhatsUp integrates with Meta&apos;s WhatsApp Business Platform API (Meta Graph
                API v21.0 or later). When you connect your WABA:
              </p>
              <ol>
                <li>
                  You are redirected through Meta&apos;s Embedded Signup popup, which is governed by
                  Meta&apos;s own terms and privacy policy
                </li>
                <li>
                  Upon your authorisation, Meta returns an OAuth code to our backend
                </li>
                <li>
                  Our server exchanges this code for a System User Access Token via a
                  server-to-server call to Meta&apos;s OAuth endpoint using your App ID and App
                  Secret — this exchange never passes through the browser
                </li>
                <li>
                  The resulting access token is immediately encrypted (AES-256-GCM) and stored in
                  our database. The plaintext token exists only transiently in server memory during
                  API calls
                </li>
              </ol>

              <SubHeading>9.2 Data Meta Shares With Us</SubHeading>
              <p>
                Through the WhatsApp Business API, Meta shares with us (subject to your
                authorisation):
              </p>
              <ul>
                <li>WABA metadata (name, currency, timezone)</li>
                <li>Phone number details and quality ratings</li>
                <li>Message template definitions and approval statuses</li>
                <li>
                  Message delivery status callbacks (if webhook integration is configured)
                </li>
              </ul>

              <SubHeading>9.3 Data We Share With Meta</SubHeading>
              <p>When you use our platform to send messages or manage templates:</p>
              <ul>
                <li>Recipient phone numbers</li>
                <li>Template names, languages, and variable values</li>
                <li>
                  Your WABA credentials (access token transmitted server-side only, over HTTPS,
                  never client-side)
                </li>
              </ul>

              <SubHeading>9.4 Meta as an Independent Data Controller</SubHeading>
              <p>
                For data processed through Meta&apos;s infrastructure (message delivery, template
                review, phone number verification), Meta operates as an independent or joint data
                controller subject to their own{' '}
                <a
                  href="https://www.facebook.com/privacy/policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a
                  href="https://www.whatsapp.com/legal/business-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Business Terms of Service
                </a>
                . We are not responsible for Meta&apos;s data practices.
              </p>

              <SubHeading>9.5 Sandbox and Development Accounts</SubHeading>
              <p>
                During development and testing, Companies may use Meta&apos;s test phone numbers,
                temporary 24-hour access tokens, or System User tokens. These are treated
                identically to production credentials in terms of encryption and storage practices.
              </p>
            </section>

            {/* ── Section 10 ─────────────────────────────────────────────── */}
            <section id="data-sharing" className="mb-10 scroll-mt-24">
              <SectionHeading>10. Data Sharing and Disclosure</SectionHeading>
              <p>
                We do <strong>not</strong> sell, rent, or trade your Personal Data. We share data
                only in the following limited circumstances:
              </p>

              <SubHeading>10.1 With Meta Platforms, Inc.</SubHeading>
              <p>
                As described in Section 9, we transmit WABA credentials and message data to
                Meta&apos;s Graph API to perform the services you&apos;ve requested. This is
                fundamental to platform operation.
              </p>

              <SubHeading>10.2 With Infrastructure Providers</SubHeading>
              <p>
                Our platform runs on cloud infrastructure (hosting, databases, networking). These
                providers process data as sub-processors under appropriate data processing
                agreements. We select providers that offer adequate data protection guarantees.
              </p>

              <SubHeading>10.3 Legal Requirements</SubHeading>
              <p>
                We may disclose Personal Data if required to do so by law or in good faith belief
                that such action is necessary to: comply with a legal obligation or court order;
                protect and defend our rights or property; prevent or investigate possible
                wrongdoing; or protect the personal safety of users or the public.
              </p>

              <SubHeading>10.4 Business Transfers</SubHeading>
              <p>
                In the event of a merger, acquisition, asset sale, or bankruptcy, your Personal Data
                may be transferred. We will provide notice before your Personal Data is transferred
                and becomes subject to a different privacy policy.
              </p>

              <SubHeading>10.5 With Your Explicit Consent</SubHeading>
              <p>
                We will share data with additional third parties only with your explicit, informed
                consent.
              </p>

              <SubHeading>10.6 Within the Platform (Super Admins)</SubHeading>
              <p>
                Super Admins have access to aggregate statistics across all tenants and may view
                individual Company registration details (name, contact email, approval status) for
                platform administration purposes. Super Admins cannot access message content, WABA
                tokens, or other sensitive Company operational data beyond what is needed for
                administrative oversight.
              </p>
            </section>

            {/* ── Section 11 ─────────────────────────────────────────────── */}
            <section id="security" className="mb-10 scroll-mt-24">
              <SectionHeading>11. Data Security</SectionHeading>
              <p>
                We implement technical and organisational security measures appropriate to the
                sensitivity of the data we process:
              </p>

              <SubHeading>11.1 Encryption</SubHeading>
              <ul>
                <li>
                  <strong>In transit:</strong> All communications between clients and our servers
                  use TLS 1.2+ (HTTPS enforced)
                </li>
                <li>
                  <strong>At rest — access tokens:</strong> Meta System User tokens are encrypted
                  using <strong>AES-256-GCM</strong> (Galois/Counter Mode), providing both
                  confidentiality and authenticated integrity. Each encryption operation generates a
                  cryptographically random 96-bit IV; the encrypted record is stored as{' '}
                  <code>ivHex:authTagHex:cipherHex</code>. The master encryption key (256-bit) is
                  stored as an environment variable, never in source code or version control.
                </li>
                <li>
                  <strong>At rest — passwords:</strong> User passwords are hashed using{' '}
                  <strong>bcrypt</strong> with a work factor of 10 and never stored in plaintext
                  anywhere — not in logs, databases, or backups.
                </li>
                <li>
                  <strong>JWT secrets:</strong> Authentication token signing secrets (HS256) are
                  long-lived, randomly generated, and stored exclusively as environment variables.
                </li>
              </ul>

              <SubHeading>11.2 Authentication and Access Control</SubHeading>
              <ul>
                <li>
                  All API endpoints require a valid JWT bearer token (1-day expiry)
                </li>
                <li>
                  Role-based access control (RBAC) enforced server-side:{' '}
                  <code>company_admin</code> and <code>super_admin</code> roles with distinct
                  permission sets
                </li>
                <li>
                  JWT validation middleware verifies token signature, expiry, and issuer on every
                  request
                </li>
                <li>
                  Company admins with unapproved company status are blocked from accessing the
                  dashboard even with a valid token
                </li>
              </ul>

              <SubHeading>11.3 Rate Limiting</SubHeading>
              <p>
                API rate limiting is applied (300 requests per 15-minute window per IP by default)
                to help mitigate brute-force attacks and API abuse.
              </p>

              <SubHeading>11.4 Security Headers</SubHeading>
              <p>
                HTTP security headers are applied via Helmet.js:{' '}
                <code>X-Content-Type-Options</code>, <code>X-Frame-Options</code>,{' '}
                <code>Strict-Transport-Security</code>, <code>Content-Security-Policy</code>, and
                others. The <code>X-Powered-By</code> header is removed to reduce fingerprinting
                surface.
              </p>

              <SubHeading>11.5 Audit Logging</SubHeading>
              <p>
                All sensitive actions (login, company approval/rejection, WABA
                connect/disconnect, template create/delete) are recorded in <code>audit_logs</code>{' '}
                with actor identity, action type, target entity, and timestamp. Audit records are
                append-only and cannot be deleted by Company Admins.
              </p>

              <SubHeading>11.6 Data Breach Notification</SubHeading>
              <p>
                Despite our measures, no security system is impenetrable. In the event we discover
                a personal data breach, we will:
              </p>
              <ul>
                <li>Contain and assess the breach within 24 hours of discovery</li>
                <li>
                  Notify the relevant supervisory authority (e.g., ICO for UK users, relevant EU DPA
                  for EEA users) within <strong>72 hours</strong> of becoming aware, where the
                  breach is likely to result in risk to individuals&apos; rights and freedoms
                </li>
                <li>
                  Notify affected individuals without undue delay if the breach is likely to result
                  in high risk to their rights and freedoms
                </li>
                <li>Maintain internal records of all breaches regardless of notification obligation</li>
              </ul>
            </section>

            {/* ── Section 12 ─────────────────────────────────────────────── */}
            <section id="retention" className="mb-10 scroll-mt-24">
              <SectionHeading>12. Data Retention and Deletion</SectionHeading>
              <p>
                We retain Personal Data only for as long as necessary to fulfil the purposes
                described in this Policy or as required by law.
              </p>

              <SubHeading>12.1 Retention Periods</SubHeading>
              <DataTable
                headers={['Data Category', 'Retention Period']}
                rows={[
                  [
                    'Company registration and user account data',
                    'Duration of active account + 3 years after account closure',
                  ],
                  [
                    'WABA connection data (waba_id, business_name, phone numbers)',
                    'Duration of active connection; immediately hard-deleted upon disconnection',
                  ],
                  [
                    'Encrypted access tokens',
                    'Duration of active WABA connection; immediately hard-deleted upon disconnection',
                  ],
                  [
                    'Message templates',
                    'Duration of active WABA connection; hard-deleted upon WABA disconnection',
                  ],
                  [
                    'Message logs',
                    'Duration of active WABA connection; hard-deleted upon WABA disconnection',
                  ],
                  ['Audit logs', '7 years (financial/compliance records)'],
                  [
                    'Data archive events (developer audit trail)',
                    '3 years from creation, then deleted',
                  ],
                  [
                    'JWT tokens (browser-side)',
                    '1 day (token expiry); cleared on logout',
                  ],
                ]}
              />

              <SubHeading>12.2 Account Deletion</SubHeading>
              <p>
                To request deletion of your account and associated data, please contact us at{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a>. Upon
                verified request:
              </p>
              <ul>
                <li>
                  Your user account will be deactivated and all personally identifiable information
                  will be anonymised or deleted within 30 days
                </li>
                <li>
                  Company data will be deleted subject to the retention requirements for audit logs
                  described above
                </li>
                <li>
                  We may retain anonymised, aggregated statistics that cannot be linked back to you
                </li>
              </ul>

              <SubHeading>12.3 WABA Disconnect and Automatic Cleanup</SubHeading>
              <p>
                When a Company Admin uses the <strong>Disconnect &amp; Purge</strong> action in the
                platform, the following is automatically <strong>hard-deleted</strong> from our
                primary database:
              </p>
              <ul>
                <li>The WABA account record (and encrypted access token)</li>
                <li>All associated phone numbers</li>
                <li>All associated message templates</li>
                <li>All associated message logs</li>
              </ul>
              <p>
                This data is removed from all primary database tables and will no longer appear in
                any user interface. See Section 13 for archival practices applicable to this action.
              </p>
            </section>

            {/* ── Section 13 ─────────────────────────────────────────────── */}
            <section id="archival" className="mb-10 scroll-mt-24">
              <SectionHeading>13. Data Archival Practices</SectionHeading>

              <SubHeading>13.1 Purpose of the Archive</SubHeading>
              <p>
                When WABA data is purged (Section 12.3), Sunny WhatsUp creates an{' '}
                <strong>archive snapshot</strong> in a separate{' '}
                <code>data_archive_events</code> table before deletion. This archive is accessible
                only to Sunny WhatsUp&apos;s authorised technical staff (Super Admins) and is used
                solely for:
              </p>
              <ul>
                <li>Debugging and post-incident investigation</li>
                <li>Fraud detection and abuse prevention</li>
                <li>Compliance with our internal audit requirements</li>
              </ul>

              <SubHeading>13.2 What the Archive Contains</SubHeading>
              <p>The archive snapshot includes:</p>
              <ul>
                <li>
                  WABA metadata (WABA ID, business name, connection timestamps) —{' '}
                  <strong>
                    the encrypted access token is REDACTED and not included in the archive
                  </strong>
                </li>
                <li>
                  Phone number records (phone number IDs, display numbers, verified names)
                </li>
                <li>All message templates at the time of disconnection</li>
                <li>
                  A sample of up to the 200 most-recent message log records (including recipient
                  phone numbers and message payloads)
                </li>
                <li>Summary counts of total records purged</li>
                <li>Identity of the user who triggered the disconnect and their IP address</li>
                <li>Timestamp of the archive event</li>
              </ul>

              <SubHeading>13.3 Archive Retention and Access</SubHeading>
              <ul>
                <li>Archive records are retained for <strong>3 years</strong> from creation</li>
                <li>Archive data is not accessible through any Company Admin interface</li>
                <li>Archive data is never used for marketing or product improvement</li>
                <li>
                  The archive table uses <code>ON DELETE SET NULL</code> for foreign keys to the
                  companies and users tables, so archive records persist even if the triggering
                  company or user is later deleted
                </li>
              </ul>

              <SubHeading>13.4 Your Rights Over Archived Data</SubHeading>
              <p>
                If you have disconnected your WABA and subsequently submit a verified erasure
                request, we will delete your archived data from{' '}
                <code>data_archive_events</code> subject to any overriding legal retention
                obligations. Send requests to{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a> with subject
                &quot;Archive Erasure Request.&quot;
              </p>
            </section>

            {/* ── Section 14 ─────────────────────────────────────────────── */}
            <section id="cookies" className="mb-10 scroll-mt-24">
              <SectionHeading>14. Cookies and Tracking Technologies</SectionHeading>

              <SubHeading>14.1 Cookies We Use</SubHeading>
              <DataTable
                headers={['Cookie Name', 'Type', 'Purpose', 'Duration']}
                rows={[
                  [
                    'sw_token',
                    'Functional / Authentication',
                    'Stores your JWT authentication token to maintain your logged-in session. This mirrors the localStorage token for server-side route validation in Next.js middleware.',
                    '1 day',
                  ],
                  [
                    'sw_role',
                    'Functional / Authentication',
                    'Stores your user role (super_admin or company_admin) to enable server-side route protection without decoding the full JWT on every navigation.',
                    '1 day',
                  ],
                ]}
              />

              <SubHeading>14.2 We Do Not Use</SubHeading>
              <ul>
                <li>Advertising or tracking cookies</li>
                <li>
                  Third-party analytics cookies (e.g., Google Analytics, Facebook Pixel)
                </li>
                <li>Cross-site tracking mechanisms</li>
              </ul>

              <SubHeading>14.3 localStorage</SubHeading>
              <p>
                In addition to cookies, we store the following in your browser&apos;s{' '}
                <code>localStorage</code>:
              </p>
              <ul>
                <li>
                  <code>sunny_whatsup_auth_token</code>: Your JWT authentication token
                </li>
                <li>
                  <code>sunny_whatsup_auth_user</code>: A JSON object containing your
                  non-sensitive user profile data (name, email, role, company name/status)
                </li>
              </ul>
              <p>These values are cleared when you log out.</p>

              <SubHeading>14.4 Cookie Control</SubHeading>
              <p>
                You may configure your browser to refuse cookies. However, refusing functional
                authentication cookies will prevent you from logging in to the Platform. The Meta
                Embedded Signup flow (operated by Meta) may set its own cookies; please refer to
                Meta&apos;s Cookie Policy for details on those.
              </p>
            </section>

            {/* ── Section 15 ─────────────────────────────────────────────── */}
            <section id="transfers" className="mb-10 scroll-mt-24">
              <SectionHeading>15. International Data Transfers</SectionHeading>
              <p>
                Sunny WhatsUp may process and store your data in servers located outside your
                country of residence. If you are based in the EEA, UK, or a jurisdiction with data
                export restrictions:
              </p>
              <ul>
                <li>
                  We transfer data only to countries with an adequacy decision, or under appropriate
                  safeguards such as Standard Contractual Clauses (SCCs) approved by the European
                  Commission
                </li>
                <li>
                  Transfers to Meta (a US-based company) are governed by the EU-US Data Privacy
                  Framework and/or applicable SCCs
                </li>
                <li>
                  Our infrastructure providers are selected based on their ability to provide
                  GDPR-equivalent guarantees
                </li>
              </ul>
              <p>
                By using our Platform, you acknowledge that your data may be transferred to and
                processed in countries outside your jurisdiction.
              </p>
            </section>

            {/* ── Section 16 ─────────────────────────────────────────────── */}
            <section id="rights" className="mb-10 scroll-mt-24">
              <SectionHeading>16. Your Rights and Choices</SectionHeading>
              <p>
                To exercise any right, contact{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a> with your
                name, email address, and a description of your request. We will verify your
                identity before processing requests.
              </p>

              <SubHeading>16.1 Rights Available to All Users</SubHeading>
              <DataTable
                headers={['Right', 'Description']}
                rows={[
                  ['Access', 'Request a copy of the Personal Data we hold about you'],
                  ['Correction', 'Request correction of inaccurate or incomplete Personal Data'],
                  [
                    'Deletion / Erasure',
                    'Request deletion of your Personal Data, subject to legal retention requirements',
                  ],
                  [
                    'Data Portability',
                    'Request your data in a machine-readable format',
                  ],
                  [
                    'Object to Processing',
                    'Object to processing based on legitimate interests',
                  ],
                  [
                    'Withdraw Consent',
                    'Where processing is based on consent, withdraw it at any time without affecting prior processing',
                  ],
                  [
                    'Lodge a Complaint',
                    'Lodge a complaint with your national data protection authority',
                  ],
                ]}
              />

              <SubHeading>16.2 EEA / UK Users (GDPR / UK GDPR)</SubHeading>
              <p>
                You have all rights listed in 16.1, plus the right to{' '}
                <strong>Restriction of Processing</strong> in certain circumstances. We do not use
                fully automated decision-making that produces legal effects about you.
              </p>
              <p>
                <strong>Response time:</strong> We will respond to verified requests within{' '}
                <strong>30 days</strong> (extendable by a further 2 months for complex requests,
                with notice).
              </p>
              <p>
                <strong>Supervisory Authority:</strong> You have the right to lodge a complaint with
                your national DPA. For UK users: the Information Commissioner&apos;s Office (ICO) at{' '}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
                  ico.org.uk
                </a>
                .
              </p>

              <SubHeading>16.3 California Users (CCPA / CPRA)</SubHeading>
              <p>California residents have additional rights:</p>
              <ul>
                <li>
                  <strong>Know:</strong> The categories and specific pieces of Personal Information
                  collected, disclosed, or sold
                </li>
                <li>
                  <strong>Delete:</strong> Request deletion of Personal Information (subject to
                  exceptions)
                </li>
                <li>
                  <strong>Correct:</strong> Request correction of inaccurate Personal Information
                </li>
                <li>
                  <strong>Opt-Out of Sale:</strong> We do <strong>not</strong> sell Personal
                  Information. No opt-out is therefore required.
                </li>
                <li>
                  <strong>Non-Discrimination:</strong> We will not discriminate against you for
                  exercising your CCPA rights
                </li>
              </ul>
              <p>
                <strong>Categories of Personal Information Collected (per CCPA):</strong> Identifiers
                (name, email, phone number, company name); Commercial information (business account
                details); Internet or electronic network activity information (access logs,
                authentication events); Professional or employment-related information (company role).
              </p>
              <p>
                To submit a CCPA rights request, email{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a> with subject
                &quot;CCPA Privacy Request.&quot;
              </p>

              <SubHeading>16.4 Indian Users (DPDP Act 2023)</SubHeading>
              <p>
                Under India&apos;s Digital Personal Data Protection Act 2023, you have the right to
                access information about your Personal Data, correction and erasure, grievance
                redressal, and the right to nominate a representative.
              </p>
              <p>
                Grievance Officer:{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a>
              </p>
            </section>

            {/* ── Section 17 ─────────────────────────────────────────────── */}
            <section id="children" className="mb-10 scroll-mt-24">
              <SectionHeading>17. Children&apos;s Privacy</SectionHeading>
              <p>
                Sunny WhatsUp is a business-to-business (B2B) platform intended solely for use by
                businesses and their adult employees. We do not knowingly collect Personal Data from
                individuals under the age of 18 (or the age of majority in your jurisdiction).
              </p>
              <p>
                If you believe we have inadvertently collected Personal Data from a minor, please
                contact us immediately at{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a> and we will
                take steps to delete such information as quickly as possible.
              </p>
            </section>

            {/* ── Section 18 ─────────────────────────────────────────────── */}
            <section id="third-party" className="mb-10 scroll-mt-24">
              <SectionHeading>18. Third-Party Links and Services</SectionHeading>
              <p>
                The Platform may contain links to third-party websites or services (including
                Meta&apos;s developer documentation and the Meta Business Suite). We are not
                responsible for the privacy practices or content of those third-party sites. This
                Policy does not apply to any third-party websites or services.
              </p>
              <p>
                <strong>Key third-party integrations and their privacy policies:</strong>
              </p>
              <ul>
                <li>
                  Meta Platforms, Inc. (WhatsApp Business API, Embedded Signup):{' '}
                  <a
                    href="https://www.facebook.com/privacy/policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.facebook.com/privacy/policy/
                  </a>
                </li>
              </ul>
            </section>

            {/* ── Section 19 ─────────────────────────────────────────────── */}
            <section id="changes" className="mb-10 scroll-mt-24">
              <SectionHeading>19. Changes to This Privacy Policy</SectionHeading>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our
                practices, technology, legal requirements, or for other operational reasons. We will
                notify you of material changes by:
              </p>
              <ul>
                <li>Posting a notice on the Platform dashboard</li>
                <li>
                  Sending an email to the registered email address of Company Admins
                </li>
                <li>Updating the &quot;Last Updated&quot; date at the top of this page</li>
              </ul>
              <p>
                Your continued use of the Platform after the effective date of the revised Policy
                constitutes your acceptance of the changes. For material changes that require
                consent (e.g., new processing purposes), we will obtain your explicit consent before
                the changes apply to your existing data.
              </p>
            </section>

            {/* ── Section 20 ─────────────────────────────────────────────── */}
            <section id="contact" className="mb-10 scroll-mt-24">
              <SectionHeading>20. Contact Us</SectionHeading>
              <p>
                For any questions, requests, or concerns about this Privacy Policy or our data
                practices, please contact:
              </p>
              <div className="not-prose rounded-lg border bg-muted/40 p-5 text-sm">
                <p className="font-semibold">Privacy Team — Sunny WhatsUp</p>
                <p className="mt-1">
                  Email:{' '}
                  <a
                    href="mailto:sunny_softwares@yahoo.com"
                    className="text-primary hover:underline"
                  >
                    sunny_softwares@yahoo.com
                  </a>
                </p>
                <p>Address: B/5, Ananya Appartment, Nr. Mangleshwar Mahadev, Ghodasar, Ahmedabad – 380050, Gujarat, India</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  We aim to acknowledge all privacy enquiries within{' '}
                  <strong>5 business days</strong> and resolve them within{' '}
                  <strong>30 calendar days</strong>.
                </p>
              </div>
            </section>

            {/* ── Section 21 ─────────────────────────────────────────────── */}
            <section id="addenda" className="mb-10 scroll-mt-24">
              <SectionHeading>21. Jurisdiction-Specific Addenda</SectionHeading>

              <SubHeading>21.1 European Economic Area and United Kingdom</SubHeading>
              <p>
                We are committed to processing Personal Data in compliance with GDPR (EU) 2016/679
                and the UK GDPR as retained by the Data Protection Act 2018.
              </p>
              <p>
                <strong>Data Processing Agreements:</strong> Business customers established in the
                EEA or UK who use our Platform to process Personal Data of their end users may
                require a Data Processing Agreement (DPA) with Sunny WhatsUp. Please contact{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a> to request a
                DPA.
              </p>

              <SubHeading>21.2 Brazil (LGPD)</SubHeading>
              <p>
                For users in Brazil, our processing is subject to Lei Geral de Proteção de Dados
                (LGPD). You have the right to access, correct, anonymise, block, or delete
                unnecessary or excessive data, and to data portability. Contact{' '}
                <a href="mailto:sunny_softwares@yahoo.com">sunny_softwares@yahoo.com</a> for
                requests.
              </p>

              <SubHeading>21.3 Canada (PIPEDA / Provincial Laws)</SubHeading>
              <p>
                For users in Canada, we comply with the Personal Information Protection and
                Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation.
                You may request access to and correction of your Personal Information by contacting
                our Privacy Team.
              </p>

              <SubHeading>21.4 Australia (Privacy Act 1988)</SubHeading>
              <p>
                For users in Australia, we comply with the Australian Privacy Act 1988 and the
                Australian Privacy Principles (APPs). You have the right to access and correct
                information we hold about you. Complaints may be directed to our Privacy Team first;
                unresolved complaints may be escalated to the Office of the Australian Information
                Commissioner (OAIC).
              </p>
            </section>

            {/* ── Footer note ─────────────────────────────────────────────── */}
            <div className="not-prose mt-10 rounded-lg border-t pt-6 text-xs text-muted-foreground">
              <p>
                This Privacy Policy was last updated on {LAST_UPDATED}.
              </p>
              <p className="mt-1">© 2026 Sunny WhatsUp. All rights reserved.</p>
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

/* ─── Small reusable layout components ────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-0 text-xl font-bold tracking-tight text-foreground">{children}</h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-5 text-base font-semibold text-foreground">{children}</h3>
  );
}

function InfoBox({
  children,
  variant = 'info',
}: {
  children: React.ReactNode;
  variant?: 'info' | 'note';
}) {
  const styles =
    variant === 'note'
      ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100'
      : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100';
  return (
    <div className={`not-prose my-4 rounded-md border p-4 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

function DefinitionTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="not-prose my-4 overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">Term</th>
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">Meaning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([term, meaning]) => (
            <tr key={term} className="odd:bg-background even:bg-muted/20">
              <td className="whitespace-nowrap px-4 py-2.5 font-medium text-foreground">{term}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="not-prose my-4 overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-background even:bg-muted/20">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 ${j === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
