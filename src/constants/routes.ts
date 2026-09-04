export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COMPANY: {
    ROOT: '/company',
    DASHBOARD: '/company/dashboard',
    WABA: '/company/waba',
    TEMPLATES: '/company/templates',
    TEMPLATES_NEW: '/company/templates/new',
    SEND_MESSAGE: '/company/send-message',
    MESSAGES: '/company/messages',
    // Meta's Billing Hub link-out — not our subscription page.
    BILLING: '/company/billing',
    SUBSCRIPTION: '/company/subscription',
  },
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    COMPANIES: '/admin/companies',
    WABA: '/admin/waba',
    MESSAGES: '/admin/messages',
    TEMPLATES: '/admin/templates',
    TEMPLATES_NEW: '/admin/templates/new',
    API_TOKENS: '/admin/api-tokens',
    FEATURES: '/admin/features',
    BILLING: '/admin/billing',
    SUBSCRIPTIONS: '/admin/subscriptions',
    PLANS: '/admin/plans',
    PAYMENT_LINKS: '/admin/payment-links',
  },
  SETTINGS: {
    ROOT: '/settings',
    SECURITY: '/settings/security',
  },
} as const;

export const API_ROUTES = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  SUPER_ADMIN: {
    STATS: '/super-admin/stats',
    COMPANIES: '/super-admin/companies',
    COMPANY: (id: string) => `/super-admin/companies/${id}`,
    APPROVE: (id: string) => `/super-admin/companies/${id}/approve`,
    REJECT: (id: string) => `/super-admin/companies/${id}/reject`,
    SET_ACTIVE: (id: string) => `/super-admin/companies/${id}/active`,
    COMPANY_MESSAGE_RETENTION: (id: string) =>
      `/super-admin/companies/${id}/message-retention`,
    MESSAGES: '/super-admin/messages',
    MESSAGE_MEDIA: (id: string) => `/super-admin/messages/${id}/media`,
    MESSAGE_HANDLED: (id: string) => `/super-admin/messages/${id}/handled`,
    COMPANY_WABA: (companyId: string) => `/super-admin/companies/${companyId}/waba`,
    COMPANY_WABA_CONNECT: (companyId: string) =>
      `/super-admin/companies/${companyId}/waba/connect`,
    COMPANY_WABA_DISCONNECT: (companyId: string) =>
      `/super-admin/companies/${companyId}/waba/disconnect`,
    COMPANY_WABA_SYNC: (companyId: string) => `/super-admin/companies/${companyId}/waba/sync`,
    COMPANY_WABA_PHONE_REQUEST_CODE: (companyId: string, id: string) =>
      `/super-admin/companies/${companyId}/waba/phone-numbers/${id}/request-code`,
    COMPANY_WABA_PHONE_VERIFY_CODE: (companyId: string, id: string) =>
      `/super-admin/companies/${companyId}/waba/phone-numbers/${id}/verify-code`,
    COMPANY_WABA_PHONE_REGISTER: (companyId: string, id: string) =>
      `/super-admin/companies/${companyId}/waba/phone-numbers/${id}/register`,
    COMPANY_MESSAGES: (companyId: string) => `/super-admin/companies/${companyId}/messages`,
    API_TOKENS: '/super-admin/api-tokens',
    COMPANY_FEATURES: (companyId: string) => `/super-admin/companies/${companyId}/features`,
    COMPANY_API_TOKEN: (companyId: string) => `/super-admin/companies/${companyId}/api-token`,
    COMPANY_API_TOKEN_ROTATE: (companyId: string) =>
      `/super-admin/companies/${companyId}/api-token/rotate`,
    COMPANY_TEMPLATES: (companyId: string) => `/super-admin/companies/${companyId}/templates`,
    COMPANY_TEMPLATE: (companyId: string, id: string) =>
      `/super-admin/companies/${companyId}/templates/${id}`,
    COMPANY_TEMPLATES_SYNC: (companyId: string) =>
      `/super-admin/companies/${companyId}/templates/sync`,
    COMPANY_MEDIA_TEMPLATE_DOCUMENT: (companyId: string) =>
      `/super-admin/companies/${companyId}/media/template-document`,
    // Subscriptions & billing
    SUBSCRIPTIONS: '/super-admin/subscriptions',
    SUBSCRIPTION_STATS: '/super-admin/subscriptions/stats',
    COMPANY_SUBSCRIPTION: (companyId: string) =>
      `/super-admin/companies/${companyId}/subscription`,
    COMPANY_SUBSCRIPTION_PERIODS: (companyId: string) =>
      `/super-admin/companies/${companyId}/subscription/periods`,
    COMPANY_SUBSCRIPTION_PERIOD: (companyId: string, periodId: string) =>
      `/super-admin/companies/${companyId}/subscription/periods/${periodId}`,
    COMPANY_SUBSCRIPTION_EXTEND: (companyId: string) =>
      `/super-admin/companies/${companyId}/subscription/extend`,
    COMPANY_SUBSCRIPTION_MARK_PAID: (companyId: string) =>
      `/super-admin/companies/${companyId}/subscription/mark-paid`,
    COMPANY_SUBSCRIPTION_SUSPEND: (companyId: string) =>
      `/super-admin/companies/${companyId}/subscription/suspend`,
    COMPANY_SUBSCRIPTION_RESUME: (companyId: string) =>
      `/super-admin/companies/${companyId}/subscription/resume`,
    COMPANY_PAYMENTS: (companyId: string) => `/super-admin/companies/${companyId}/payments`,
    // Plan & notice catalogues
    PLANS: '/super-admin/plans',
    PLAN: (id: string) => `/super-admin/plans/${id}`,
    PLAN_PRICES: (id: string) => `/super-admin/plans/${id}/prices`,
    PLAN_FEATURES: (id: string) => `/super-admin/plans/${id}/features`,
    PLAN_INTERESTS: '/super-admin/plan-interests',
    SUBSCRIPTION_NOTICES: '/super-admin/subscription-notices',
    SUBSCRIPTION_NOTICE: (id: string) => `/super-admin/subscription-notices/${id}`,
    // Payment Links — standalone, unrelated to subscriptions.
    PAYMENT_LINKS: '/super-admin/payment-links',
    PAYMENT_LINK_STATS: '/super-admin/payment-links/stats',
    PAYMENT_LINK: (id: string) => `/super-admin/payment-links/${id}`,
    PAYMENT_LINK_CANCEL: (id: string) => `/super-admin/payment-links/${id}/cancel`,
    PAYMENT_LINK_NOTIFY: (id: string) => `/super-admin/payment-links/${id}/notify`,
    PAYMENT_LINK_SYNC: (id: string) => `/super-admin/payment-links/${id}/sync`,
  },
  COMPANY: {
    ME: '/company/me',
    FEATURES: '/company/features',
    ACCOUNT: '/company/account',
    STATS: '/company/stats',
    WABA: '/company/waba',
    WABA_CONNECT: '/company/waba/connect',
    WABA_DISCONNECT: '/company/waba/disconnect',
    WABA_SYNC: '/company/waba/sync',
    WABA_PHONE_REQUEST_CODE: (id: string) => `/company/waba/phone-numbers/${id}/request-code`,
    WABA_PHONE_VERIFY_CODE: (id: string) => `/company/waba/phone-numbers/${id}/verify-code`,
    WABA_PHONE_REGISTER: (id: string) => `/company/waba/phone-numbers/${id}/register`,
    MESSAGES: '/company/messages',
    MESSAGE_MEDIA: (id: string) => `/company/messages/${id}/media`,
    MESSAGE_HANDLED: (id: string) => `/company/messages/${id}/handled`,
    TEMPLATES: '/company/templates',
    TEMPLATE: (id: string) => `/company/templates/${id}`,
    TEMPLATES_SYNC: '/company/templates/sync',
    MEDIA_TEMPLATE_DOCUMENT: '/company/media/template-document',
    MEDIA_MESSAGE_DOCUMENT: '/company/media/message-document',
    // Subscription. Every one of these stays reachable while the subscription is
    // blocking, so a locked-out company can still pay.
    SUBSCRIPTION: '/company/subscription',
    SUBSCRIPTION_PLANS: '/company/subscription/plans',
    SUBSCRIPTION_PAYMENTS: '/company/subscription/payments',
    SUBSCRIPTION_ORDERS: '/company/subscription/orders',
    SUBSCRIPTION_VERIFY: '/company/subscription/payments/verify',
    SUBSCRIPTION_CANCEL: '/company/subscription/cancel',
    SUBSCRIPTION_RESUME: '/company/subscription/resume',
    SUBSCRIPTION_INTEREST: '/company/subscription/interest',
  },
} as const;
