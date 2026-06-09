import type { Metadata } from 'next';
import { ENV, LEGAL } from '@/constants';
import {
  LegalLayout,
  SectionHeading,
  SubHeading,
  InfoBox,
  DefinitionTable,
  DataTable,
  type TocItem,
} from '@/components/legal';

export const metadata: Metadata = {
  title: `Terms & Conditions | ${ENV.APP_NAME}`,
  description:
    'The legal agreement governing your use of Sunny WhatsUp — covering accounts, acceptable use, payment, intellectual property, liability, and termination.',
};

const TOC: TocItem[] = [
  { id: 'introduction', label: '1. Introduction and Acceptance' },
  { id: 'definitions', label: '2. Definitions' },
  { id: 'eligibility', label: '3. Eligibility and Account Registration' },
  { id: 'approval', label: '4. Account Approval and Activation' },
  { id: 'service-description', label: '5. Description of the Service' },
  { id: 'meta-terms', label: '6. Meta Platform Terms and WhatsApp Policies' },
  { id: 'license', label: '7. Licence to Use the Platform' },
  { id: 'acceptable-use', label: '8. Acceptable Use Policy' },
  { id: 'prohibited', label: '9. Prohibited Content and Activities' },
  { id: 'company-responsibilities', label: '10. Company Responsibilities' },
  { id: 'recipient-consent', label: '11. Recipient Consent and Opt-Out' },
  { id: 'templates', label: '12. Message Templates' },
  { id: 'rate-limits', label: '13. Rate Limits and Fair Use' },
  { id: 'fees', label: '14. Fees, Billing, and Taxes' },
  { id: 'ip', label: '15. Intellectual Property Rights' },
  { id: 'feedback', label: '16. Feedback and Suggestions' },
  { id: 'data-processing', label: '17. Data Processing and Privacy' },
  { id: 'confidentiality', label: '18. Confidentiality' },
  { id: 'third-party', label: '19. Third-Party Services and Integrations' },
  { id: 'availability', label: '20. Service Availability and Support' },
  { id: 'modifications', label: '21. Modifications to the Service' },
  { id: 'term-termination', label: '22. Term, Suspension, and Termination' },
  { id: 'effect-termination', label: '23. Effect of Termination' },
  { id: 'warranties', label: '24. Disclaimer of Warranties' },
  { id: 'liability', label: '25. Limitation of Liability' },
  { id: 'indemnification', label: '26. Indemnification' },
  { id: 'force-majeure', label: '27. Force Majeure' },
  { id: 'governing-law', label: '28. Governing Law and Jurisdiction' },
  { id: 'disputes', label: '29. Dispute Resolution' },
  { id: 'export', label: '30. Export Controls and Sanctions' },
  { id: 'general', label: '31. General Provisions' },
  { id: 'changes', label: '32. Changes to These Terms' },
  { id: 'contact', label: '33. Contact Us' },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms &amp; Conditions"
      subtitle={
        <>
          These Terms govern your access to and use of <strong>{ENV.APP_NAME}</strong>. By
          registering or using the Platform, you agree to be bound by them. Please read carefully.
        </>
      }
      lastUpdated={LEGAL.LAST_UPDATED}
      effectiveDate={LEGAL.EFFECTIVE_DATE}
      toc={TOC}
    >
      {/* ── Section 1 ──────────────────────────────────────────────── */}
      <section id="introduction" className="mb-10 scroll-mt-24">
        <SectionHeading>1. Introduction and Acceptance</SectionHeading>
        <p>
          These Terms &amp; Conditions (&quot;Terms,&quot; &quot;Agreement&quot;) constitute a
          legally binding contract between <strong>Sunny WhatsUp</strong> (&quot;we,&quot;
          &quot;us,&quot; &quot;our,&quot; or the &quot;Platform&quot;) and the business or
          individual (&quot;you,&quot; &quot;Company,&quot; &quot;Customer&quot;) that accesses
          or uses our services.
        </p>
        <p>
          By (i) clicking &quot;I accept&quot; during registration, (ii) accessing or using the
          Platform, or (iii) connecting a WhatsApp Business Account (WABA), you confirm that
          you have read, understood, and agree to be bound by these Terms and our{' '}
          <a href="/privacy">Privacy Policy</a>. If you do not agree, you may not use the
          Platform.
        </p>
        <InfoBox>
          <strong>Operator:</strong> Sunny WhatsUp
          <br />
          Contact: <a href={`mailto:${LEGAL.CONTACT_EMAIL}`}>{LEGAL.CONTACT_EMAIL}</a>
          <br />
          Address: {LEGAL.ADDRESS}
        </InfoBox>
      </section>

      {/* ── Section 2 ──────────────────────────────────────────────── */}
      <section id="definitions" className="mb-10 scroll-mt-24">
        <SectionHeading>2. Definitions</SectionHeading>
        <DefinitionTable
          rows={[
            ['Platform', 'The Sunny WhatsUp SaaS application, web dashboard, and associated APIs'],
            ['Company / Customer', 'A business entity registered on the Platform'],
            [
              'Company Admin',
              'A natural person representing a Company who manages the Company account on the Platform',
            ],
            [
              'Super Admin',
              'A Sunny WhatsUp platform operator with administrative access across all tenants',
            ],
            ['WABA', 'WhatsApp Business Account issued by Meta to a verified business'],
            [
              'Meta',
              'Meta Platforms, Inc. and its affiliates, including WhatsApp LLC, which operate the WhatsApp Business Platform',
            ],
            [
              'System User Token',
              'A long-lived access token issued by Meta granting programmatic access to a WABA',
            ],
            [
              'Template',
              'A pre-approved Meta message template used to initiate WhatsApp business messages',
            ],
            ['Recipient', "An end user receiving WhatsApp messages sent through a Company's WABA"],
            [
              'Personal Data',
              'Any information relating to an identified or identifiable natural person',
            ],
            ['Effective Date', 'The date these Terms become applicable to your account'],
          ]}
        />
      </section>

      {/* ── Section 3 ──────────────────────────────────────────────── */}
      <section id="eligibility" className="mb-10 scroll-mt-24">
        <SectionHeading>3. Eligibility and Account Registration</SectionHeading>

        <SubHeading>3.1 Who May Register</SubHeading>
        <p>To register and use Sunny WhatsUp, you must:</p>
        <ul>
          <li>Be a legally registered business or authorised representative of one</li>
          <li>Be at least 18 years of age (or the age of majority in your jurisdiction)</li>
          <li>
            Have the legal authority to bind your Company to this Agreement and to connect your
            Meta WABA
          </li>
          <li>
            Not be located in, ordinarily resident in, or controlled by a country subject to
            comprehensive trade sanctions
          </li>
          <li>Not be listed on any restricted-parties list maintained by applicable authorities</li>
        </ul>

        <SubHeading>3.2 Information You Provide</SubHeading>
        <p>During registration you must provide accurate, complete, and current information:</p>
        <ul>
          <li>Your first and last name</li>
          <li>A valid work email address</li>
          <li>A strong password (minimum 8 characters)</li>
          <li>Your Company name (and optional legal name)</li>
          <li>Optional contact phone and website</li>
        </ul>
        <p>
          You agree to keep this information up to date. You are responsible for any losses
          arising from inaccurate or stale account information.
        </p>

        <SubHeading>3.3 Account Security</SubHeading>
        <ul>
          <li>You are responsible for safeguarding your password and login credentials</li>
          <li>
            You must immediately notify us at{' '}
            <a href={`mailto:${LEGAL.CONTACT_EMAIL}`}>{LEGAL.CONTACT_EMAIL}</a> if you suspect
            any unauthorised access to your account
          </li>
          <li>
            You are liable for all activity that occurs under your account except where caused by
            our own gross negligence or wilful misconduct
          </li>
        </ul>

        <SubHeading>3.4 One Account per Company</SubHeading>
        <p>
          Unless we explicitly agree in writing, each Company may register only one account. You
          may not register multiple accounts to evade limits, suspensions, or fees.
        </p>
      </section>

      {/* ── Section 4 ──────────────────────────────────────────────── */}
      <section id="approval" className="mb-10 scroll-mt-24">
        <SectionHeading>4. Account Approval and Activation</SectionHeading>
        <p>
          Sunny WhatsUp operates a manual approval workflow. New Company registrations are
          reviewed by our Super Admin team before activation:
        </p>
        <ol>
          <li>You submit a registration with your Company details</li>
          <li>
            Your account is initially marked <strong>Pending</strong> and you cannot access the
            Company dashboard
          </li>
          <li>
            Our Super Admin team reviews the application — typically within reasonable business
            time — and may approve, reject, or request additional information
          </li>
          <li>
            If approved, your account is activated and you may sign in and connect a WABA. If
            rejected, you will be notified at the email you provided with the reason for
            rejection (where lawful to share)
          </li>
        </ol>
        <p>
          We reserve the right to refuse any application or revoke approval at any time at our
          sole discretion, subject to applicable law.
        </p>
      </section>

      {/* ── Section 5 ──────────────────────────────────────────────── */}
      <section id="service-description" className="mb-10 scroll-mt-24">
        <SectionHeading>5. Description of the Service</SectionHeading>
        <p>
          Sunny WhatsUp is a multi-tenant Software-as-a-Service (SaaS) platform that lets
          businesses connect their Meta WhatsApp Business Accounts and dispatch template-based
          messages to their own customers via the official Meta WhatsApp Business Platform API.
          The Platform&apos;s core capabilities include:
        </p>
        <ul>
          <li>WABA onboarding through Meta&apos;s Embedded Signup flow</li>
          <li>
            Secure storage of Meta System User Tokens encrypted at rest using AES-256-GCM
          </li>
          <li>Discovery and synchronisation of your Meta-approved message templates</li>
          <li>Creation of new templates and submission to Meta for review</li>
          <li>
            Dispatch of template-only WhatsApp messages to recipient phone numbers you supply
          </li>
          <li>Message delivery logs, status tracking, and dashboard statistics</li>
          <li>Multi-tenant isolation — each Company sees only its own data</li>
        </ul>
        <InfoBox variant="note">
          Sunny WhatsUp does <strong>not</strong> store or process the content of incoming
          WhatsApp conversations. Our service is limited to outbound, template-based,
          business-initiated messages dispatched via Meta&apos;s API.
        </InfoBox>
      </section>

      {/* ── Section 6 ──────────────────────────────────────────────── */}
      <section id="meta-terms" className="mb-10 scroll-mt-24">
        <SectionHeading>6. Meta Platform Terms and WhatsApp Policies</SectionHeading>
        <p>
          Sunny WhatsUp acts as a Business Solution Provider built on top of Meta&apos;s
          WhatsApp Business Platform. By using our service you agree that you will{' '}
          <strong>independently comply</strong> with all applicable Meta and WhatsApp policies,
          including but not limited to:
        </p>
        <ul>
          <li>
            <a
              href="https://www.whatsapp.com/legal/business-terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Business Solution Terms
            </a>
          </li>
          <li>
            <a
              href="https://www.whatsapp.com/legal/business-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Business Messaging Policy
            </a>
          </li>
          <li>
            <a
              href="https://www.whatsapp.com/legal/commerce-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Commerce Policy
            </a>
          </li>
          <li>
            <a
              href="https://developers.facebook.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta Platform Terms
            </a>
          </li>
        </ul>
        <p>
          Violations of Meta&apos;s policies may result in Meta&apos;s direct action against
          your WABA (warnings, quality-rating downgrades, template rejections, account
          suspension) — independent of any action we may take. We are not responsible for
          decisions made by Meta about your account, templates, or messages.
        </p>
      </section>

      {/* ── Section 7 ──────────────────────────────────────────────── */}
      <section id="license" className="mb-10 scroll-mt-24">
        <SectionHeading>7. Licence to Use the Platform</SectionHeading>
        <p>
          Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
          non-transferable, non-sublicensable, revocable licence to access and use the Platform
          solely for your internal business purposes during the term of this Agreement.
        </p>
        <p>You may not:</p>
        <ul>
          <li>Sub-license, resell, rent, lease, or distribute access to the Platform</li>
          <li>
            Reverse-engineer, decompile, or attempt to extract the source code of the Platform
          </li>
          <li>
            Use the Platform to build a competing product or to benchmark for competitive
            purposes
          </li>
          <li>Remove, obscure, or alter any proprietary notices on the Platform</li>
          <li>Use automated tools (bots, scrapers) to access the Platform except via our public APIs</li>
        </ul>
      </section>

      {/* ── Section 8 ──────────────────────────────────────────────── */}
      <section id="acceptable-use" className="mb-10 scroll-mt-24">
        <SectionHeading>8. Acceptable Use Policy</SectionHeading>
        <p>You agree to use the Platform only for lawful, business-appropriate purposes. You will:</p>
        <ul>
          <li>Comply with all applicable laws and regulations in every jurisdiction where you operate</li>
          <li>Comply with all Meta and WhatsApp policies (Section 6)</li>
          <li>Respect the rights, privacy, and consents of message recipients</li>
          <li>Use the Platform in good faith and without intent to defraud or harm any party</li>
          <li>Maintain the security and confidentiality of your account and access tokens</li>
        </ul>
      </section>

      {/* ── Section 9 ──────────────────────────────────────────────── */}
      <section id="prohibited" className="mb-10 scroll-mt-24">
        <SectionHeading>9. Prohibited Content and Activities</SectionHeading>
        <p>You must not use the Platform to send messages or store content that:</p>
        <ul>
          <li>Is unsolicited bulk messaging (spam) or violates anti-spam laws (CAN-SPAM, CASL, TRAI etc.)</li>
          <li>Promotes hate speech, harassment, discrimination, or violence</li>
          <li>Involves illegal goods or services, drugs, weapons, counterfeit items, or illegal financial schemes</li>
          <li>Contains sexually explicit, pornographic, or child-exploitation material</li>
          <li>
            Promotes regulated industries (gambling, adult content, alcohol, tobacco, firearms,
            pharmaceuticals, cryptocurrency, financial services) without all required permits,
            disclaimers, age-gating, and compliance with the WhatsApp Commerce Policy
          </li>
          <li>Phishes, impersonates, scams, or otherwise deceives recipients</li>
          <li>Distributes malware, viruses, or any malicious code</li>
          <li>Infringes the intellectual property, privacy, or other rights of any third party</li>
          <li>Disrupts, damages, or attempts to gain unauthorised access to the Platform or its infrastructure</li>
          <li>Attempts to probe, scan, or test the vulnerability of any system or network</li>
          <li>Circumvents authentication, rate limiting, or other security controls</li>
        </ul>
        <p>
          We reserve the right to immediately suspend or terminate accounts engaged in any of
          the above, with or without notice, and to cooperate with law enforcement.
        </p>
      </section>

      {/* ── Section 10 ─────────────────────────────────────────────── */}
      <section id="company-responsibilities" className="mb-10 scroll-mt-24">
        <SectionHeading>10. Company Responsibilities</SectionHeading>
        <p>As a Company using the Platform, you are solely responsible for:</p>
        <ul>
          <li>
            Establishing and maintaining your own Meta Business Manager, Meta App, and WhatsApp
            Business Account
          </li>
          <li>The accuracy and lawfulness of all message content you send, including variable values</li>
          <li>Obtaining valid consent from every recipient before sending WhatsApp messages</li>
          <li>Honouring opt-out and unsubscribe requests promptly and permanently</li>
          <li>Responding to recipient complaints and customer service queries</li>
          <li>Complying with all data-protection laws applicable to the recipient&apos;s data</li>
          <li>The actions of any of your employees, contractors, or agents who use your account</li>
          <li>Maintaining current and accurate billing, contact, and Company information</li>
        </ul>
      </section>

      {/* ── Section 11 ─────────────────────────────────────────────── */}
      <section id="recipient-consent" className="mb-10 scroll-mt-24">
        <SectionHeading>11. Recipient Consent and Opt-Out</SectionHeading>
        <p>
          WhatsApp business messaging is consent-based. Before using the Platform to send any
          message, you must:
        </p>
        <ul>
          <li>
            Have <strong>valid, opt-in consent</strong> from the recipient that meets the standard
            required by WhatsApp&apos;s Business Messaging Policy
          </li>
          <li>
            Keep <strong>records of consent</strong> (timestamp, method, content) for as long as
            you continue to send messages to that recipient, and at least as long as applicable
            law requires
          </li>
          <li>Honour opt-out requests immediately and across all of your channels</li>
          <li>
            Not contact recipients on lists you purchased, scraped, or obtained without
            verifiable consent
          </li>
        </ul>
        <p>
          We may require evidence of consent at any time. Failure to demonstrate valid consent
          may result in immediate suspension. Repeated violations are grounds for permanent
          termination.
        </p>
      </section>

      {/* ── Section 12 ─────────────────────────────────────────────── */}
      <section id="templates" className="mb-10 scroll-mt-24">
        <SectionHeading>12. Message Templates</SectionHeading>
        <p>
          All business-initiated WhatsApp messages must use a Meta-approved template. When you
          create templates through the Platform:
        </p>
        <ul>
          <li>
            You acknowledge that approval rests entirely with Meta and that we cannot guarantee
            approval, approval timelines, or quality ratings
          </li>
          <li>
            You will not submit templates containing prohibited content (Section 9) or
            misleading variable placeholders
          </li>
          <li>
            You agree that template metadata, body content, button configurations, and language
            codes are visible to Meta as part of the approval process
          </li>
          <li>
            We may sync template state from Meta automatically; the state shown in our
            dashboard reflects Meta&apos;s most recent response
          </li>
          <li>
            Templates rejected, paused, or disabled by Meta cannot be used to send messages,
            regardless of their status in our local cache
          </li>
        </ul>
      </section>

      {/* ── Section 13 ─────────────────────────────────────────────── */}
      <section id="rate-limits" className="mb-10 scroll-mt-24">
        <SectionHeading>13. Rate Limits and Fair Use</SectionHeading>
        <p>
          To protect the Platform and ensure equitable service to all Companies, we apply rate
          limits to API endpoints (currently 300 requests per 15-minute window per IP by
          default). In addition:
        </p>
        <ul>
          <li>Meta enforces its own per-WABA messaging tiers and throughput caps</li>
          <li>
            We may impose additional fair-use limits on bulk sends, template syncs, or
            dashboard activity to protect platform health
          </li>
          <li>
            Persistent attempts to exceed limits, automate dashboard activity, or work around
            rate limiting may result in suspension
          </li>
        </ul>
      </section>

      {/* ── Section 14 ─────────────────────────────────────────────── */}
      <section id="fees" className="mb-10 scroll-mt-24">
        <SectionHeading>14. Fees, Billing, and Taxes</SectionHeading>

        <SubHeading>14.1 Current Pricing</SubHeading>
        <p>
          Subscription fees, message-based fees, and any other charges for the Platform are
          communicated to you at the time of sign-up or via a separately executed order form.
          Where no fee schedule applies to your account, the Platform is being made available on
          a trial or evaluation basis at our discretion.
        </p>

        <SubHeading>14.2 Meta&apos;s WhatsApp Conversation Charges</SubHeading>
        <p>
          Meta charges separately for WhatsApp conversations under its own pricing schedule.
          These charges flow directly between you and Meta on your Meta Business Account. We are
          not responsible for Meta&apos;s charges and cannot waive, dispute, or refund them.
        </p>

        <SubHeading>14.3 Taxes</SubHeading>
        <p>
          All fees are exclusive of taxes. You are responsible for all applicable sales, value
          added (GST/VAT), withholding, or similar taxes, except for taxes based on our net
          income.
        </p>

        <SubHeading>14.4 Non-Payment</SubHeading>
        <p>
          If you fail to pay any undisputed fee when due, we may suspend Platform access, charge
          interest at the maximum rate permitted by law, and recover collection costs. Suspension
          for non-payment does not relieve you of accrued obligations.
        </p>
      </section>

      {/* ── Section 15 ─────────────────────────────────────────────── */}
      <section id="ip" className="mb-10 scroll-mt-24">
        <SectionHeading>15. Intellectual Property Rights</SectionHeading>

        <SubHeading>15.1 Our IP</SubHeading>
        <p>
          We and our licensors retain all right, title, and interest in and to the Platform,
          including all software, designs, trademarks, logos, documentation, and any
          improvements or derivative works thereof. Nothing in these Terms transfers ownership
          of our IP to you, other than the limited licence granted in Section 7.
        </p>

        <SubHeading>15.2 Your IP and Content</SubHeading>
        <p>
          You retain all right, title, and interest in your Company content, message templates,
          recipient lists, and message payloads (&quot;Customer Content&quot;). You grant us a
          limited, worldwide, royalty-free licence to host, transmit, process, and display
          Customer Content solely as necessary to provide the Platform to you and to perform
          obligations under this Agreement.
        </p>

        <SubHeading>15.3 Aggregated and Anonymised Data</SubHeading>
        <p>
          We may collect aggregated, anonymised, and de-identified usage data and statistics
          derived from your use of the Platform (which cannot reasonably be linked back to you
          or any individual) for purposes including service improvement, capacity planning, and
          benchmarking. This aggregated data is and remains our property.
        </p>
      </section>

      {/* ── Section 16 ─────────────────────────────────────────────── */}
      <section id="feedback" className="mb-10 scroll-mt-24">
        <SectionHeading>16. Feedback and Suggestions</SectionHeading>
        <p>
          If you submit feedback, suggestions, feature requests, or ideas (&quot;Feedback&quot;),
          you grant us a perpetual, irrevocable, worldwide, royalty-free, sublicensable licence
          to use, modify, and incorporate that Feedback into the Platform without obligation,
          attribution, or compensation to you.
        </p>
      </section>

      {/* ── Section 17 ─────────────────────────────────────────────── */}
      <section id="data-processing" className="mb-10 scroll-mt-24">
        <SectionHeading>17. Data Processing and Privacy</SectionHeading>
        <p>
          Our processing of Personal Data is governed by our{' '}
          <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms by
          reference. In particular:
        </p>
        <ul>
          <li>
            For Personal Data of recipients that you upload or transmit, you act as the data
            controller and we act as your data processor under applicable data-protection laws
          </li>
          <li>
            For Personal Data of your Company Admin users, we act as a data controller for
            account-management purposes
          </li>
          <li>
            Where required, we will execute a Data Processing Agreement (DPA) with you on
            reasonable industry-standard terms — contact{' '}
            <a href={`mailto:${LEGAL.CONTACT_EMAIL}`}>{LEGAL.CONTACT_EMAIL}</a> to request one
          </li>
          <li>
            You agree that you have a lawful basis for transmitting recipient Personal Data
            through the Platform and that you will respond to any data-subject requests
            received in respect of that data
          </li>
        </ul>
      </section>

      {/* ── Section 18 ─────────────────────────────────────────────── */}
      <section id="confidentiality" className="mb-10 scroll-mt-24">
        <SectionHeading>18. Confidentiality</SectionHeading>
        <p>
          &quot;Confidential Information&quot; means any non-public information disclosed by
          one party to the other that is identified as confidential or that should reasonably
          be understood to be confidential given its nature and the circumstances of
          disclosure. Each party agrees to:
        </p>
        <ul>
          <li>Use the other party&apos;s Confidential Information only to perform under this Agreement</li>
          <li>Protect it using the same degree of care it uses for its own confidential information (and no less than reasonable care)</li>
          <li>Not disclose it to third parties except to employees, contractors, and advisors who are bound by confidentiality obligations</li>
        </ul>
        <p>
          The obligations in this Section do not apply to information that is publicly known
          through no breach by the receiving party, was already known to the receiving party
          without restriction, was independently developed without reference to the disclosing
          party&apos;s information, or must be disclosed by law (in which case prompt notice
          will be given, where lawful).
        </p>
      </section>

      {/* ── Section 19 ─────────────────────────────────────────────── */}
      <section id="third-party" className="mb-10 scroll-mt-24">
        <SectionHeading>19. Third-Party Services and Integrations</SectionHeading>
        <p>
          The Platform integrates with third-party services — most importantly Meta&apos;s
          WhatsApp Business Platform. Your use of those third-party services is governed by
          their own terms and policies. We make no representations about those services and
          are not responsible for any acts, omissions, downtime, data loss, or charges arising
          from them.
        </p>
        <p>
          If a third-party service we depend on changes its terms, suspends access, or
          discontinues a feature, our ability to deliver the Platform may be impacted and we
          reserve the right to make corresponding changes to the Platform without liability.
        </p>
      </section>

      {/* ── Section 20 ─────────────────────────────────────────────── */}
      <section id="availability" className="mb-10 scroll-mt-24">
        <SectionHeading>20. Service Availability and Support</SectionHeading>

        <SubHeading>20.1 Best-Effort Availability</SubHeading>
        <p>
          We aim to make the Platform available on a 24/7 basis but do not guarantee
          uninterrupted access. We may take the Platform offline for scheduled maintenance,
          emergency repairs, or security patches without prior notice when necessary.
        </p>

        <SubHeading>20.2 Support</SubHeading>
        <p>
          Standard support is provided via email at{' '}
          <a href={`mailto:${LEGAL.CONTACT_EMAIL}`}>{LEGAL.CONTACT_EMAIL}</a> during business
          hours. We aim to acknowledge support requests within reasonable time but do not
          commit to response or resolution times unless a separate Service Level Agreement (SLA)
          has been signed with you.
        </p>

        <SubHeading>20.3 Beta and Experimental Features</SubHeading>
        <p>
          Any feature labelled &quot;beta,&quot; &quot;preview,&quot; or &quot;experimental&quot;
          is provided as-is, with no warranty or support commitment, and may be modified or
          withdrawn at any time.
        </p>
      </section>

      {/* ── Section 21 ─────────────────────────────────────────────── */}
      <section id="modifications" className="mb-10 scroll-mt-24">
        <SectionHeading>21. Modifications to the Service</SectionHeading>
        <p>
          We continuously improve the Platform. We reserve the right to modify, add, or remove
          features, change technical infrastructure, alter integrations, and update workflows.
          We will use reasonable efforts to communicate material changes (such as deprecations
          of public APIs) through the dashboard or via email.
        </p>
      </section>

      {/* ── Section 22 ─────────────────────────────────────────────── */}
      <section id="term-termination" className="mb-10 scroll-mt-24">
        <SectionHeading>22. Term, Suspension, and Termination</SectionHeading>

        <SubHeading>22.1 Term</SubHeading>
        <p>
          This Agreement begins when you accept these Terms (typically at registration) and
          continues until terminated as described below.
        </p>

        <SubHeading>22.2 Termination by You</SubHeading>
        <p>
          You may terminate this Agreement at any time by disconnecting your WABA, deleting
          your data via the in-app Disconnect &amp; Purge action, and emailing{' '}
          <a href={`mailto:${LEGAL.CONTACT_EMAIL}`}>{LEGAL.CONTACT_EMAIL}</a> to request
          account deletion.
        </p>

        <SubHeading>22.3 Suspension by Us</SubHeading>
        <p>We may suspend your access immediately if we reasonably believe that:</p>
        <ul>
          <li>You are in material breach of these Terms or Meta&apos;s policies</li>
          <li>Your account is being used for prohibited activity (Section 9)</li>
          <li>Continued access poses a security, legal, or reputational risk</li>
          <li>You have failed to pay undisputed fees when due</li>
          <li>A regulator, court, or Meta has directed us to do so</li>
        </ul>

        <SubHeading>22.4 Termination by Us</SubHeading>
        <p>
          We may terminate this Agreement for cause if you fail to cure a material breach within
          fourteen (14) days of written notice (or immediately for breaches that cannot be cured
          or that pose ongoing harm). We may also terminate without cause on thirty (30) days&apos;
          notice.
        </p>
      </section>

      {/* ── Section 23 ─────────────────────────────────────────────── */}
      <section id="effect-termination" className="mb-10 scroll-mt-24">
        <SectionHeading>23. Effect of Termination</SectionHeading>
        <p>Upon termination, expiration, or suspension of your account:</p>
        <ul>
          <li>Your right to access the Platform ends immediately</li>
          <li>
            Your WABA connection, templates, message logs, and encrypted access token are
            hard-deleted from our primary database (see Privacy Policy Section 12.3)
          </li>
          <li>
            An archive snapshot (with access token redacted) is retained for our internal audit
            purposes for three (3) years as described in our Privacy Policy
          </li>
          <li>Accrued fees become immediately due and payable</li>
          <li>
            Sections that by their nature should survive (IP, confidentiality, indemnification,
            limitation of liability, governing law, etc.) survive termination
          </li>
        </ul>
      </section>

      {/* ── Section 24 ─────────────────────────────────────────────── */}
      <section id="warranties" className="mb-10 scroll-mt-24">
        <SectionHeading>24. Disclaimer of Warranties</SectionHeading>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PLATFORM AND ALL RELATED
          SERVICES, CONTENT, AND MATERIALS ARE PROVIDED <strong>&quot;AS IS&quot;</strong> AND{' '}
          <strong>&quot;AS AVAILABLE&quot;</strong>, WITHOUT WARRANTIES OF ANY KIND, WHETHER
          EXPRESS, IMPLIED, OR STATUTORY. WE EXPRESSLY DISCLAIM ALL IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        </p>
        <p>We do not warrant that:</p>
        <ul>
          <li>The Platform will meet your requirements or expectations</li>
          <li>The Platform will operate uninterrupted, secure, or error-free</li>
          <li>Defects will be corrected</li>
          <li>Messages dispatched via the Platform will be delivered, read, or acted upon by recipients</li>
          <li>Meta will approve any template, grant or maintain any phone-number quality rating, or refrain from suspending your WABA</li>
        </ul>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties; in such
          jurisdictions, the foregoing exclusions apply to the maximum extent permitted by law.
        </p>
      </section>

      {/* ── Section 25 ─────────────────────────────────────────────── */}
      <section id="liability" className="mb-10 scroll-mt-24">
        <SectionHeading>25. Limitation of Liability</SectionHeading>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL EITHER PARTY BE
          LIABLE TO THE OTHER FOR ANY <strong>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
          EXEMPLARY, OR PUNITIVE DAMAGES</strong>, INCLUDING LOSS OF PROFITS, REVENUE, GOODWILL,
          DATA, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATING TO THIS AGREEMENT OR THE
          PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          OUR TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT WILL NOT
          EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO US IN THE TWELVE (12) MONTHS
          IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED US
          DOLLARS (US&nbsp;$100).
        </p>
        <p>
          These limitations apply regardless of the legal theory (contract, tort, statute, or
          otherwise) and notwithstanding the failure of any limited remedy of its essential
          purpose. They do not limit liability that cannot be excluded by law (e.g., for gross
          negligence, wilful misconduct, fraud, death or personal injury caused by negligence,
          or any other liability that cannot be excluded under applicable law).
        </p>
      </section>

      {/* ── Section 26 ─────────────────────────────────────────────── */}
      <section id="indemnification" className="mb-10 scroll-mt-24">
        <SectionHeading>26. Indemnification</SectionHeading>
        <p>
          You agree to indemnify, defend, and hold harmless Sunny WhatsUp, its affiliates,
          officers, directors, employees, and agents from and against any third-party claims,
          damages, losses, liabilities, costs, and expenses (including reasonable legal fees)
          arising out of or relating to:
        </p>
        <ul>
          <li>Your use of the Platform in violation of these Terms or applicable law</li>
          <li>Your message content, recipient lists, or templates</li>
          <li>Allegations that recipients did not consent to receive your messages</li>
          <li>Your breach of any Meta or WhatsApp policy</li>
          <li>Your infringement of any third-party intellectual property, privacy, or other rights</li>
          <li>Any data-protection or privacy claim brought by a recipient or regulator in respect of data you supplied</li>
        </ul>
        <p>
          We will provide prompt notice of any indemnified claim, reasonable cooperation in the
          defence, and the right to control the defence and settlement (provided that no
          settlement may impose any obligation on us without our consent).
        </p>
      </section>

      {/* ── Section 27 ─────────────────────────────────────────────── */}
      <section id="force-majeure" className="mb-10 scroll-mt-24">
        <SectionHeading>27. Force Majeure</SectionHeading>
        <p>
          Neither party will be liable for any failure or delay in performance (other than
          payment obligations) caused by circumstances beyond its reasonable control, including
          acts of God, natural disasters, war, terrorism, civil unrest, government action,
          labour disputes, internet or telecommunications outages, cyber-attacks, or actions or
          inactions of upstream providers (including Meta).
        </p>
      </section>

      {/* ── Section 28 ─────────────────────────────────────────────── */}
      <section id="governing-law" className="mb-10 scroll-mt-24">
        <SectionHeading>28. Governing Law and Jurisdiction</SectionHeading>
        <p>
          These Terms are governed by and construed in accordance with the laws of{' '}
          <strong>India</strong>, without regard to its conflict-of-laws principles. Subject to
          Section 29 (Dispute Resolution), the courts of <strong>Ahmedabad, Gujarat, India</strong>{' '}
          have exclusive jurisdiction over any dispute arising out of or relating to these
          Terms, and the parties consent to the personal jurisdiction of those courts.
        </p>
        <p>
          The United Nations Convention on Contracts for the International Sale of Goods does
          not apply to this Agreement.
        </p>
      </section>

      {/* ── Section 29 ─────────────────────────────────────────────── */}
      <section id="disputes" className="mb-10 scroll-mt-24">
        <SectionHeading>29. Dispute Resolution</SectionHeading>

        <SubHeading>29.1 Informal Resolution</SubHeading>
        <p>
          Before initiating any formal proceeding, the parties agree to attempt in good faith to
          resolve any dispute informally for at least sixty (60) days following written notice
          of the dispute to{' '}
          <a href={`mailto:${LEGAL.CONTACT_EMAIL}`}>{LEGAL.CONTACT_EMAIL}</a>.
        </p>

        <SubHeading>29.2 Arbitration (Where Permitted)</SubHeading>
        <p>
          If informal resolution fails, either party may refer the dispute to binding
          arbitration to be conducted in <strong>Ahmedabad, Gujarat, India</strong>, by a sole
          arbitrator under the Arbitration and Conciliation Act, 1996, of India. The
          arbitration will be conducted in English. The arbitral award will be final and
          binding on both parties.
        </p>

        <SubHeading>29.3 Equitable Relief</SubHeading>
        <p>
          Notwithstanding the foregoing, either party may seek injunctive or other equitable
          relief from any court of competent jurisdiction to protect its intellectual property
          or confidential information.
        </p>
      </section>

      {/* ── Section 30 ─────────────────────────────────────────────── */}
      <section id="export" className="mb-10 scroll-mt-24">
        <SectionHeading>30. Export Controls and Sanctions</SectionHeading>
        <p>
          You agree to comply with all export-control and sanctions laws applicable to the
          Platform, including (without limitation) those administered by the United States,
          European Union, United Kingdom, and India. You represent that:
        </p>
        <ul>
          <li>You are not located in a country subject to comprehensive trade sanctions</li>
          <li>You are not listed on any restricted-parties list maintained by any applicable government</li>
          <li>You will not use the Platform to send messages to recipients in such locations in violation of applicable sanctions</li>
        </ul>
      </section>

      {/* ── Section 31 ─────────────────────────────────────────────── */}
      <section id="general" className="mb-10 scroll-mt-24">
        <SectionHeading>31. General Provisions</SectionHeading>

        <SubHeading>31.1 Entire Agreement</SubHeading>
        <p>
          These Terms, together with the Privacy Policy and any order form or DPA signed by the
          parties, constitute the entire agreement between you and us regarding the Platform
          and supersede all prior or contemporaneous communications and proposals.
        </p>

        <SubHeading>31.2 Severability</SubHeading>
        <p>
          If any provision of these Terms is held invalid, illegal, or unenforceable, the
          remaining provisions remain in full force and effect, and the invalid provision will
          be modified to the minimum extent necessary to make it enforceable while preserving
          the parties&apos; intent.
        </p>

        <SubHeading>31.3 Waiver</SubHeading>
        <p>
          No failure or delay by either party in exercising any right will operate as a waiver
          of that right. Any waiver must be in writing and signed by the waiving party.
        </p>

        <SubHeading>31.4 Assignment</SubHeading>
        <p>
          You may not assign or transfer these Terms or any rights or obligations under them
          without our prior written consent. We may assign these Terms freely in connection
          with a merger, acquisition, reorganisation, or sale of all or substantially all of
          our assets. Any attempted assignment in violation of this Section is void.
        </p>

        <SubHeading>31.5 Relationship of the Parties</SubHeading>
        <p>
          The parties are independent contractors. Nothing in these Terms creates a
          partnership, joint venture, agency, fiduciary, or employment relationship between
          them.
        </p>

        <SubHeading>31.6 Notices</SubHeading>
        <p>
          Notices to us must be sent by email to{' '}
          <a href={`mailto:${LEGAL.CONTACT_EMAIL}`}>{LEGAL.CONTACT_EMAIL}</a> or by registered
          post to the address shown above. Notices to you may be sent to the email address
          associated with your account, and are deemed received on the day of transmission
          (for email) or three business days after dispatch (for post).
        </p>

        <SubHeading>31.7 No Third-Party Beneficiaries</SubHeading>
        <p>
          These Terms do not create any rights or remedies in any third party (including Meta),
          and no third party is intended as a beneficiary of any provision of these Terms.
        </p>

        <SubHeading>31.8 Headings</SubHeading>
        <p>
          Section headings are for convenience only and do not affect the interpretation of
          these Terms.
        </p>
      </section>

      {/* ── Section 32 ─────────────────────────────────────────────── */}
      <section id="changes" className="mb-10 scroll-mt-24">
        <SectionHeading>32. Changes to These Terms</SectionHeading>
        <p>
          We may revise these Terms from time to time. When we make material changes, we will:
        </p>
        <ul>
          <li>Post a notice on the dashboard</li>
          <li>Update the &quot;Last Updated&quot; and &quot;Effective&quot; dates at the top of this page</li>
          <li>For significant changes, email the registered Company Admin at least thirty (30) days before they take effect</li>
        </ul>
        <p>
          Your continued use of the Platform after the Effective Date of the revised Terms
          constitutes your acceptance of those Terms. If you do not agree to the revised Terms,
          you must stop using the Platform and may close your account.
        </p>

        <SubHeading>32.1 Data Categories Affected by Termination</SubHeading>
        <DataTable
          headers={['Data Category', 'Treatment on Termination']}
          rows={[
            [
              'WABA connection, encrypted tokens, phone numbers',
              'Hard-deleted immediately from primary database',
            ],
            ['Templates and message logs', 'Hard-deleted immediately from primary database'],
            [
              'Archive snapshot (token redacted)',
              'Retained 3 years for internal audit, then deleted',
            ],
            ['Account & profile data', 'Retained for up to 3 years for audit and legal compliance'],
            ['Audit logs', 'Retained 7 years (compliance)'],
          ]}
        />
      </section>

      {/* ── Section 33 ─────────────────────────────────────────────── */}
      <section id="contact" className="mb-10 scroll-mt-24">
        <SectionHeading>33. Contact Us</SectionHeading>
        <p>
          For questions about these Terms, notices, or requests under this Agreement, please
          contact:
        </p>
        <div className="not-prose rounded-lg border bg-muted/40 p-5 text-sm">
          <p className="font-semibold">Legal Team — Sunny WhatsUp</p>
          <p className="mt-1">
            Email:{' '}
            <a href={`mailto:${LEGAL.CONTACT_EMAIL}`} className="text-primary hover:underline">
              {LEGAL.CONTACT_EMAIL}
            </a>
          </p>
          <p>Address: {LEGAL.ADDRESS}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            We aim to acknowledge legal enquiries within <strong>5 business days</strong>.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
