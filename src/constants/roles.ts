export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
