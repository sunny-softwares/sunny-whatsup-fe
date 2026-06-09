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
    MESSAGES_TITLE: 'All Messages',
  },
  COMMON: {
    LOADING: 'Loading…',
    SAVE: 'Save',
    CANCEL: 'Cancel',
    SUBMIT: 'Submit',
    SEARCH: 'Search',
    SUCCESS: 'Success',
    ERROR: 'Error',
    EMPTY: 'No data available',
  },
} as const;
