export const UI_MESSAGES = {
  AUTH: {
    LOGIN_TITLE: 'Sign in to your account',
    LOGIN_SUBTITLE: 'Enter your credentials below to continue',
    REGISTER_TITLE: 'Register your company',
    REGISTER_SUBTITLE: 'Submit your details and wait for super admin approval',
    NO_ACCOUNT: "Don't have an account?",
    HAVE_ACCOUNT: 'Already have an account?',
    SIGN_UP: 'Sign up',
    SIGN_IN: 'Sign in',
    LOGOUT: 'Log out',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
    REGISTRATION_PENDING:
      'Registration submitted. Your account will be activated after super admin approval.',
    ACCEPT_LEGAL_PREFIX: 'I have read and agree to the',
    ACCEPT_LEGAL_AND: 'and',
    ACCEPT_LEGAL_REQUIRED: 'You must accept the Terms & Conditions and Privacy Policy to continue.',
    TERMS_LINK_LABEL: 'Terms & Conditions',
    PRIVACY_LINK_LABEL: 'Privacy Policy',
  },
  COMPANY: {
    DASHBOARD_TITLE: 'Company Dashboard',
    WABA_TITLE: 'WhatsApp Business Account',
    SEND_MESSAGE_TITLE: 'Send WhatsApp Message',
    MESSAGES_TITLE: 'Message History',
    TEMPLATES_TITLE: 'Message Templates',
    NEW_TEMPLATE_TITLE: 'Create new template',
    CONNECT_WABA: 'Connect Meta WABA',
    CONNECT_WABA_HINT: 'Connect your Meta WhatsApp Business Account via Embedded Signup.',
    WABA_SYNC: 'Sync from Meta',
    WABA_SYNCING: 'Syncing…',
    WABA_SYNCED: 'WABA state refreshed from Meta.',
    NO_WABA_YET:
      'You have not connected a Meta WABA yet. Connect one to start sending WhatsApp messages.',
    NO_TEMPLATES_YET:
      'No templates yet for this category. Create one to start sending messages.',
    NO_APPROVED_TEMPLATES:
      'You don’t have any approved templates yet. Templates must be approved by Meta before you can send messages with them.',
    TEMPLATES_HINT:
      'WhatsApp requires all business-initiated messages to use Meta-approved templates. Create templates here — Meta typically reviews them within minutes.',
  },
  ADMIN: {
    DASHBOARD_TITLE: 'Super Admin Dashboard',
    COMPANIES_TITLE: 'Companies',
    PENDING_TITLE: 'Pending approvals',
    APPROVE: 'Approve',
    REJECT: 'Reject',
    ACTIVATE: 'Activate',
    DEACTIVATE: 'Deactivate',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DEACTIVATE_CONFIRM:
      'Deactivate this company? Its admins will be unable to log in and all of its APIs will be blocked.',
    MESSAGES_TITLE: 'All Messages',
    TEMPLATES_TITLE: 'Company Templates',
    TEMPLATES_SUBTITLE: 'Select a company to manage its message templates on its behalf.',
    WABA_TITLE: 'Company WhatsApp Account',
    WABA_SUBTITLE:
      'Select a company to manage its Meta WhatsApp Business Account on its behalf.',
    SELECT_COMPANY_LABEL: 'Company',
    SELECT_COMPANY_PLACEHOLDER: 'Select a company…',
    NO_COMPANY_SELECTED: 'Select a company above to view and manage its templates.',
    NO_COMPANY_SELECTED_WABA:
      'Select a company above to view and manage its WhatsApp Business Account.',
    NO_COMPANY_SELECTED_BILLING: 'Select a company above to open its billing on Meta.',
    BILLING_TITLE: 'Company Billing',
    BILLING_SUBTITLE:
      'Select a company to open its WhatsApp Business Account billing in Meta’s Billing Hub.',
  },
  FEATURES: {
    TITLE: 'Company Features',
    SUBTITLE:
      'Control which product features each company can use. Disabled features disappear from the company’s sidebar and their APIs are blocked. A toggle set here always beats what the company’s plan grants.',
    NAV_LABEL: 'Features',
    NO_COMPANY_SELECTED: 'Select a company above to manage its features.',
    ENABLED: 'Enabled',
    DISABLED: 'Disabled',
    SOURCE_OVERRIDE: 'Set manually',
    SOURCE_PLAN: 'From plan',
    RESET_TO_PLAN: 'Reset to plan',
    NOT_ENABLED_PAGE:
      'This feature is not enabled for your company. Please contact the administrator.',
    NONE_ENABLED:
      'No features are enabled for your company yet. Please contact the administrator.',
  },
  API_TOKEN: {
    TITLE: 'API Tokens',
    SUBTITLE:
      'Issue one API token per company for machine-to-machine access (currently the send-message API). Rotate or delete a token at any time.',
    NAV_LABEL: 'API Tokens',
    COL_TOKEN: 'Token',
    COL_SCOPES: 'Scopes',
    COL_LAST_USED: 'Last used',
    NO_TOKEN: 'No token',
    NEVER_USED: 'Never',
    CREATE: 'Create token',
    ROTATE: 'Rotate',
    DELETE: 'Delete',
    CREATED_TITLE: 'API token created',
    ROTATED_TITLE: 'API token rotated',
    REVEAL_HINT:
      'Copy this token now and share it with the company through a secure channel. For security reasons it will never be shown again.',
    COPY: 'Copy',
    COPIED: 'Copied!',
    DONE: 'Done',
    ROTATE_CONFIRM_TITLE: 'Rotate this API token?',
    ROTATE_CONFIRM:
      'The current token stops working immediately and a new one is generated. Any integration using the old token will fail until it is updated.',
    DELETE_CONFIRM_TITLE: 'Delete this API token?',
    DELETE_CONFIRM:
      'The token stops working immediately and the company loses API access until a new token is created.',
    COPY_TOKEN: 'Copy token',
    NOT_REVEALABLE:
      'This token was created before secure copy was supported. Rotate it to get a copyable token.',
  },
  CURL: {
    COL_API: 'API',
    COPY_CURL: 'Copy curl',
    TITLE: 'Send-message API request',
    HINT: 'Replace the placeholder values (recipient phone, template variables) before running. The Authorization header already contains this company’s API token — share it only with the company.',
    DOCUMENT_HINT:
      'This template has a document header: attach the PDF via the file field — the API uploads it and sends the message in one call. The filename field is the document name the recipient sees.',
    IMAGE_HINT:
      'This template has an image header: attach a JPEG or PNG (max 1 MB) via the file field — the API uploads it and sends the message in one call.',
    MEDIA_ID_HINT:
      'This template has a media header: upload the file first and pass the returned media id as variables.header.',
    NO_TOKEN: 'No API token found for this company. Please create the API token first.',
  },
  PHONE: {
    COL_REGISTRATION: 'Cloud API',
    REGISTERED: 'Registered',
    VERIFY: 'Verify',
    REGISTER: 'Register',
    VERIFY_TITLE: 'Verify phone number',
    VERIFY_DESCRIPTION:
      'This number has not been verified with Meta yet. Request a verification code, then enter it below to confirm ownership.',
    CODE_METHOD_LABEL: 'Send code via',
    SEND_CODE: 'Send code',
    SENDING_CODE: 'Sending…',
    CODE_SENT: 'Code sent. It may take a minute to arrive.',
    CODE_LABEL: 'Verification code',
    CODE_PLACEHOLDER: '6-digit code',
    VERIFY_SUBMIT: 'Verify number',
    VERIFYING: 'Verifying…',
    VERIFIED_SUCCESS: 'Phone number verified successfully.',
    REGISTER_TITLE: 'Register with Cloud API',
    REGISTER_DESCRIPTION:
      'Registering activates this number for sending and receiving messages via the WhatsApp Cloud API. The 6-digit PIN sets — or must match — the number’s two-step verification PIN.',
    PIN_LABEL: 'Two-step verification PIN',
    PIN_PLACEHOLDER: '6-digit PIN',
    REGISTER_SUBMIT: 'Register number',
    REGISTERING: 'Registering…',
    REGISTERED_SUCCESS: 'Phone number registered with the Cloud API.',
    INVALID_PIN: 'Enter a 6-digit number.',
    APP_LINKED:
      'Linked to the WhatsApp Business app (coexistence). Meta activates Cloud API automatically once the in-app signup step completes — if this stays inactive, reconnect via "Connect with Meta" and finish the step in the app.',
  },
  TEMPLATE: {
    DETAILS_TITLE: 'Template details',
    STATUS: 'Status',
    LANGUAGE: 'Language',
    CATEGORY: 'Category',
    CREATED: 'Created',
    SYNCED: 'Last synced',
    META_ID: 'Meta template ID',
    VARIABLES: 'Variables',
    REJECTION_REASON: 'Rejection reason',
    PREVIEW: 'Preview',
    SYNC: 'Sync from Meta',
    SYNCING: 'Syncing…',
    CREATE: 'Create template',
    DELETE_CONFIRM: 'Delete this template on Meta? This cannot be undone.',
  },
  MESSAGE_RETENTION: {
    NOTICE: (days: number) =>
      `Message history is shown for the last ${days} days. Older messages aren’t listed here and can’t be filtered for.`,
    COL_LABEL: 'History',
    DAYS_SUFFIX: (days: number) => `${days} days`,
    DIALOG_TITLE: 'Message history window',
    DIALOG_DESCRIPTION:
      'How many days of message history this company’s own admins can see on their Messages page. This only limits what they see — no messages are deleted, and your own listings are never restricted.',
    FIELD_LABEL: 'Days of history',
    EDIT: 'Change',
    SAVE_FAILED: 'Could not update the history window. Please try again.',
  },
  MESSAGE_ACTIONS: {
    OPEN_CHAT: 'Open a WhatsApp chat with this number',
    MARK_HANDLED: 'Mark handled',
    MARK_HANDLED_HINT: 'Record that you resent this message yourself',
    HANDLED: 'Handled',
    UNMARK_HANDLED_HINT: (when: string) => `Marked handled on ${when} — click to undo`,
    HANDLED_FAILED: 'Could not update the message. Please try again.',
  },
  MESSAGE_ERROR: {
    VIEW_REASON: 'View failure reason',
    DIALOG_TITLE: 'Message failure reason',
    DIALOG_SUBTITLE: 'Error reported for this message.',
    UNKNOWN_REASON: 'No error details were recorded for this message.',
    RAW_LABEL: 'Raw error details',
    DOCS_HINT_PREFIX: 'Some messages failed. To look up what a failure code means, check',
    DOCS_LINK_LABEL: 'Meta’s WhatsApp error codes reference',
    SEND_WHATSAPP_WEB: 'Send it on WhatsApp Web',
    // WhatsApp's click-to-chat link can only prefill text, so an attachment has
    // to be downloaded and re-attached by hand in the WhatsApp Web composer.
    DOWNLOAD_MEDIA: 'Download the attachment to re-attach on WhatsApp Web',
    DOWNLOADING_MEDIA: 'Downloading the attachment…',
    DOWNLOAD_FAILED: 'Could not download the attachment. Please try again.',
  },
  TABLE: {
    COL_CREATED: 'Created',
    COL_FROM: 'From',
    COL_TO: 'To',
    COL_TYPE: 'Type',
    COL_TEMPLATE: 'Template',
    COL_STATUS: 'Status',
    COL_HANDLED: 'Handled',
    COL_COMPANY: 'Company',
    COL_NAME: 'Name',
    COL_CATEGORY: 'Category',
    COL_LANGUAGE: 'Language',
    COL_CONTACT: 'Contact',
    COL_REGISTERED: 'Registered',
    COL_ACTIVE: 'Active',
    COL_ACTIONS: 'Actions',
  },
  FILTERS: {
    COMPANY_LABEL: 'Company name',
    COMPANY_PLACEHOLDER: 'Search company',
    RECIPIENT_LABEL: 'Recipient',
    RECIPIENT_PLACEHOLDER: 'Search phone',
    STATUS_LABEL: 'Status',
    CATEGORY_LABEL: 'Category',
    FROM_DATE_LABEL: 'From date',
    TO_DATE_LABEL: 'To date',
    ALL: 'All',
    APPLY: 'Apply',
    CLEAR: 'Clear',
  },
  PAGINATION: {
    PREV: 'Previous',
    NEXT: 'Next',
    PAGE_OF: (page: number, totalPages: number) => `Page ${page} of ${totalPages}`,
    SHOWING: (count: number, total: number) => `Showing ${count} of ${total}`,
  },
  BILLING: {
    TITLE: 'Billing',
    SUBTITLE: 'Manage the payment method and balance for your WhatsApp Business Account.',
    NAV_LABEL: 'Billing',
    CARD_TITLE: 'Billing is managed by Meta',
    CARD_DESCRIPTION:
      'Meta bills your WhatsApp Business Account directly. Your outstanding balance, payment method, billing cycle, and invoices all live in Meta’s Billing Hub — sign in with the Facebook account that owns the WABA to view or update them.',
    OPEN_BUTTON: 'Open Meta Billing Hub',
    WABA_ID_LABEL: 'WhatsApp Business Account ID:',
    NO_WABA:
      'No WhatsApp Business Account is connected yet, so we can’t link to a specific account — the Billing Hub will open on your default business portfolio.',
  },
  // Static UI chrome only. Everything describing the STATE of a subscription —
  // titles, warnings, day counts, CTA labels — arrives from the API as
  // `meta.subscription`, driven by the editable `subscription_notices` table.
  // Never hardcode that copy here.
  SUBSCRIPTION: {
    TITLE: 'Subscription',
    NAV_LABEL: 'Subscription',
    SUBTITLE: 'Manage your plan, billing cycle and payments.',
    ADMIN_TITLE: 'Subscriptions',
    ADMIN_SUBTITLE: 'Every company’s plan, billing cycle and payment status.',
    PLANS_TITLE: 'Plans',
    PLANS_SUBTITLE: 'Pricing, trial and grace periods, and what each plan unlocks.',

    CURRENT_PLAN: 'Current plan',
    PAID_THROUGH: (date: string) => `Paid through ${date}`,
    PAID_THROUGH_HINT:
      'You renewed early, so the cycle below runs to its own end date and the time you bought is queued after it.',
    CHOOSE_PLAN: 'Choose a plan',
    CURRENT_BADGE: 'Current plan',
    COMING_SOON_BADGE: 'Coming soon',
    NOTIFY_ME: 'Notify me',
    NOTIFY_ME_DONE: 'We’ll let you know',
    PAY_NOW: 'Pay now',
    RENEW_NOW: 'Renew now',
    UPGRADE: 'Switch to this plan',
    SAVE_PERCENT: (percent: number) => `Save ${percent}%`,
    BILLED_MONTHLY: 'Billed monthly',
    BILLED_YEARLY: 'Billed yearly',

    PAYMENT_UNAVAILABLE:
      'Online payment is not available right now. Please contact the administrator to arrange payment.',
    PRICE_UNAVAILABLE: 'No price is configured for this billing cycle yet.',
    TEST_MODE_BANNER:
      'Razorpay is in test mode — no real payment will be taken. Use a Razorpay test card.',
    CHECKOUT_CANCELLED: 'Payment cancelled. You have not been charged.',
    CHECKOUT_FAILED: 'The payment could not be completed. Please try again.',
    CHECKOUT_SCRIPT_FAILED:
      'Could not load the payment gateway. Check your connection and try again.',
    PAYMENT_SUCCESS: 'Payment successful — your subscription is active.',

    CANCEL_TITLE: 'Cancel subscription',
    CANCEL_BUTTON: 'Cancel subscription',
    CANCEL_CONFIRM:
      'Your plan will stay active until the end of the cycle you have already paid for, and will not renew after that. You can resume any time before then.',
    RESUME_BUTTON: 'Resume subscription',

    PAYMENT_HISTORY_TITLE: 'Payment history',
    PAYMENT_HISTORY_EMPTY: 'No payments yet.',
    CYCLES_TITLE: 'Billing cycles',
    CYCLE_CURRENT: 'Current',
    CYCLE_QUEUED: 'Queued',
    CYCLE_PAST: 'Past',
    HISTORY_TITLE: 'Billing history',
    BANKED_COVERAGE_HINT: (date: string) =>
      `This company has renewed early and is paid through ${date}. The queued cycles below start when the current one ends.`,
    NO_SUBSCRIPTION: 'No subscription is set up for this company yet.',

    // Super admin
    EDIT_SUBSCRIPTION: 'Edit subscription',
    EDIT_PERIOD: 'Edit billing cycle',
    NEW_PERIOD: 'New billing cycle',
    NEW_CYCLE_BUTTON: 'New cycle',
    CREATE_CYCLE: 'Create cycle',
    PLACEMENT_QUEUED: (date: string) =>
      `This cycle will be QUEUED — it starts on ${date}, when the company's current coverage ends.`,
    PLACEMENT_CURRENT:
      'Nothing is currently running, so this cycle starts immediately and becomes the active one.',
    MAKE_ACTIVE: 'Make this the active cycle now',
    MAKE_ACTIVE_HINT:
      'Supersedes every cycle still running or queued and starts this one immediately. Superseded cycles stay in the billing history but stop granting access.',
    PLACEMENT_REPLACE: (count: number) =>
      count > 0
        ? `This cycle starts NOW and becomes the only active one. ${count} existing ${
            count === 1 ? 'cycle' : 'cycles'
          } will be superseded and stop granting access.`
        : 'This cycle starts NOW and becomes the active one. Nothing else is currently in play.',
    CYCLE_SUPERSEDED: 'Superseded',
    SUPERSEDED_HINT: 'Voided by an admin — no longer grants access.',
    CUSTOM_DATES: 'Set custom dates',
    CUSTOM_AMOUNT: 'Set a custom amount',
    DEFAULT_DATES_HINT: (start: string, cycle: string) =>
      `Starts ${start} and runs for one ${cycle} cycle.`,
    ENDS_AT_HINT: 'Leave blank to run for one full billing cycle from the start date.',
    DEFAULT_AMOUNT_HINT: (amount: string) => `Uses the plan's current price of ₹${amount}.`,
    NO_PLAN_PRICE_HINT:
      'This plan has no active price for the selected billing cycle, so the amount will be ₹0.',
    GRACE_INHERIT: 'Inherit from plan',
    MARK_AS_TRIAL: 'Mark this cycle as a trial',
    NOTES_PLACEHOLDER: 'Why this cycle was created (visible to admins only)',
    EXTEND: 'Extend',
    EXTEND_DAYS_LABEL: 'Extend by (days)',
    MARK_PAID: 'Mark paid',
    SUSPEND: 'Suspend',
    RESUME: 'Resume',
    VIEW_PAYMENTS: 'Payments',
    VIEW_HISTORY: 'History',
    PLAN_LABEL: 'Plan',
    CYCLE_LABEL: 'Billing cycle',
    STATE_LABEL: 'State',
    PAYMENT_STATUS_LABEL: 'Payment',
    STARTS_AT_LABEL: 'Starts',
    ENDS_AT_LABEL: 'Ends',
    GRACE_DAYS_LABEL: 'Grace days',
    AMOUNT_LABEL: 'Amount',
    NOTES_LABEL: 'Notes',
    DAYS_REMAINING: (days: number) => `${days} day${days === 1 ? '' : 's'} left`,
    NO_COMPANY_SELECTED: 'Select a company to view its subscription.',
    ENFORCEMENT_OFF:
      'Subscription enforcement is OFF. States below are accurate, but no company is being blocked. Turn on SUBSCRIPTION_ENFORCEMENT_ENABLED once these look right.',

    MONTHLY_PRICE_LABEL: 'Monthly price (₹)',
    YEARLY_PRICE_LABEL: 'Yearly price (₹)',
    TRIAL_DAYS_LABEL: 'Trial days',
    PURCHASABLE_LABEL: 'Purchasable',
    COMING_SOON_LABEL: 'Show as coming soon',
    SAVE_PRICES: 'Save pricing',
    SAVE_PLAN: 'Save plan',
  },
  // Razorpay Payment Links — a standalone super-admin collection tool.
  // Unrelated to subscriptions.
  PAYMENT_LINK: {
    TITLE: 'Payment Links',
    NAV_LABEL: 'Payment Links',
    SUBTITLE: 'Create and track one-off payment requests collected through Razorpay.',

    NEW: 'New payment link',
    CREATE: 'Create link',

    // Fallbacks — the API returns its own message for each of these, so these
    // only show if a response arrives without one.
    CREATED: 'Payment link created',
    CANCELLED: 'Payment link cancelled',
    NOTIFIED: 'Payment link sent',
    EMPTY: 'No payment links yet. Create one to collect a payment.',
    NO_MATCHES: 'No payment links match these filters.',

    GATEWAY_DISABLED:
      'Razorpay is not configured, so new links cannot be created. Existing links are still shown.',
    TEST_MODE: 'Razorpay is in test mode — these links do not collect real money.',

    // Stat cards
    STAT_TOTAL: 'Total links',
    STAT_AWAITING: 'Awaiting payment',
    STAT_COLLECTED: 'Collected',
    STAT_OUTSTANDING: 'Outstanding',
    STAT_OUTSTANDING_HINT: 'Unpaid amount on links that can still be paid',

    // Table
    COL_CUSTOMER: 'Customer',
    COL_AMOUNT: 'Amount',
    COL_STATUS: 'Status',
    COL_CREATED: 'Created',
    COL_EXPIRES: 'Expires',
    COL_LINK: 'Link',
    NO_CUSTOMER: 'No customer details',
    NO_EXPIRY: 'No expiry',
    PAID_OF: (paid: string, total: string) => `${paid} of ${total}`,

    // Actions
    COPY: 'Copy',
    COPIED: 'Link copied',
    OPEN: 'Open',
    RESEND: 'Resend',
    RESEND_SMS: 'Resend by SMS',
    RESEND_EMAIL: 'Resend by email',
    CANCEL_LINK: 'Cancel',
    CANCEL_TITLE: 'Cancel this payment link?',
    CANCEL_CONFIRM:
      'The link stops working immediately and can no longer be paid. This cannot be undone.',
    SYNC: 'Refresh',
    SYNC_HINT: 'Fetch the latest status from Razorpay',
    VIEW: 'Details',

    // Create form
    AMOUNT_LABEL: 'Amount (₹)',
    DESCRIPTION_LABEL: 'What is this for?',
    DESCRIPTION_PLACEHOLDER: 'Shown to the customer on the payment page',
    CUSTOMER_SECTION: 'Customer',
    CUSTOMER_NAME_LABEL: 'Name',
    CUSTOMER_EMAIL_LABEL: 'Email',
    CUSTOMER_CONTACT_LABEL: 'Phone',
    CUSTOMER_HINT: 'Razorpay can only send the link to a channel it has an address for.',
    NOTIFY_SMS: 'Send by SMS',
    NOTIFY_EMAIL: 'Send by email',
    NOTIFY_SMS_REQUIRES: 'Add a phone number to send by SMS',
    NOTIFY_EMAIL_REQUIRES: 'Add an email address to send by email',
    REMINDERS: 'Let Razorpay send payment reminders',
    OPTIONS_SECTION: 'Options',
    ACCEPT_PARTIAL: 'Allow partial payments',
    FIRST_MIN_LABEL: 'Minimum first instalment (₹)',
    EXPIRE_BY_LABEL: 'Expires on',
    EXPIRE_BY_HINT: 'Leave blank for no expiry.',
    REFERENCE_LABEL: 'Your reference',
    REFERENCE_PLACEHOLDER: 'e.g. an invoice number (must be unique)',

    // Details
    DETAILS_TITLE: 'Payment link',
    RAZORPAY_ID: 'Razorpay ID',
    CREATED_BY: 'Created by',
    NOTES: 'Notes',
  },
  SETTINGS: {
    TITLE: 'Settings',
    SECURITY_LABEL: 'Security',
    SECURITY_TITLE: 'Change Password',
    SECURITY_SUBTITLE: 'Update your account password to keep it secure',
    CURRENT_PASSWORD_LABEL: 'Current password',
    NEW_PASSWORD_LABEL: 'New password',
    CONFIRM_PASSWORD_LABEL: 'Confirm new password',
    CHANGE_PASSWORD_BUTTON: 'Change password',
    PASSWORD_CHANGED: 'Password changed successfully',
    PASSWORD_MISMATCH: 'New password and confirmation do not match',
    DANGER_ZONE_TITLE: 'Danger zone',
    DELETE_ACCOUNT_TITLE: 'Delete account',
    DELETE_ACCOUNT_SUBTITLE:
      'Permanently delete your company and all of its data — WhatsApp connection, templates, messages, and team members. This action cannot be undone.',
    DELETE_ACCOUNT_BUTTON: 'Delete account',
    DELETE_ACCOUNT_CONFIRM:
      'This will permanently delete your company and ALL of its data — WhatsApp connection, templates, message history, and all users. This cannot be undone.\n\nAre you absolutely sure?',
    DELETE_ACCOUNT_SUCCESS: 'Your account and all data have been deleted.',
  },
  COMMON: {
    LOADING: 'Loading…',
    NO_MATCHES: 'No matches found',
    CLEAR_SELECTION: 'Clear selection',
    SAVE: 'Save',
    EDIT: 'Edit',
    CANCEL: 'Cancel',
    SUBMIT: 'Submit',
    SEARCH: 'Search',
    REFRESH: 'Refresh',
    SUCCESS: 'Success',
    ERROR: 'Error',
    EMPTY: 'No data available',
    DISMISS: 'Dismiss',
  },
} as const;
