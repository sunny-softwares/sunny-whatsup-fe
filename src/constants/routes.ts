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
    MESSAGES: '/super-admin/messages',
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
    TEMPLATES: '/company/templates',
    TEMPLATE: (id: string) => `/company/templates/${id}`,
    TEMPLATES_SYNC: '/company/templates/sync',
    MEDIA_TEMPLATE_DOCUMENT: '/company/media/template-document',
    MEDIA_MESSAGE_DOCUMENT: '/company/media/message-document',
  },
} as const;
