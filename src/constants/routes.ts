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
    MESSAGES: '/admin/messages',
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
    MESSAGES: '/super-admin/messages',
  },
  COMPANY: {
    ME: '/company/me',
    STATS: '/company/stats',
    WABA: '/company/waba',
    WABA_CONNECT: '/company/waba/connect',
    WABA_DISCONNECT: '/company/waba/disconnect',
    MESSAGES: '/company/messages',
    TEMPLATES: '/company/templates',
    TEMPLATE: (id: string) => `/company/templates/${id}`,
    TEMPLATES_SYNC: '/company/templates/sync',
  },
} as const;
